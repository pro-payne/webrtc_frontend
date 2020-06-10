import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from 'src/app/services/chat/chat.service';
import { ListenerService } from 'src/app/services/utility/listener/listener.service';
import { TimerService } from 'src/app/services/utility/timer/timer.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: '.dashboard.purple_bg.resize',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  public mute: boolean = true;
  public video: boolean = true;
  private user = {
    id: 0,
    name: '',
    image: ''
  };
  public localStream: any;
  private peerConnection: any = null; // RTCPeerConnection
  public onlineusers: [] = [];
  private localSDP: any = null;
  private callType: string = '';
  private caller = {
    name: '',
    image: ''
  };
  public onCall: boolean = false;
  private onCallWith: any = null;
  incoming: any;
  outgoing: any;
  tone: any;

  constructor(
    private chatService: ChatService,
    private listener: ListenerService,
    private timer: TimerService,
    private titleService: Title
  ) {
    this.titleUpdate()
  }

  private titleUpdate(title?: string) {
    let val = 'Boom';
    if (title != undefined) {
      val = title + " - " + val
    }
    this.titleService.setTitle(val);
  }

  ngOnInit() {
    // Listen for calls
    this.chatService.messages.subscribe((message: any) => {
      let data = JSON.parse(message.data)
      this.dataSwitch(data)
    })

    this.responseListener()

    this.incoming = document.getElementById('incoming-stream');
    this.outgoing = document.getElementById('outgoing-stream');
    this.tone = document.getElementById('incoming-tone')
  }


  private dataSwitch(data: any) {

    switch (data.type) {
      case 'id':
        this.user.id = data.id
        this.user.name = data.id
        console.log("My UID = " + this.user.id)
        break;
      case 'userlist':
        this.updateUserList(data.users)
        break;
      case 'newUser':
        this.chatService.send({
          msg: {
            user: this.user.id,
            caller: this.caller
          },
          callType: '',
          type: 'signal'
        })
        break;
      case 'response':
        this.prepareForConnection(data)
        break;
      case 'answer':
        this.answerRemoteCall(data)
        break;
      case 'endcall':
        this.handleEndCall(data)
        break;
      case 'upgrade':
        this.upgrade(data)
        break;
      case "call-offer":
        this.handleOfferMsg(data)
        break;
      case 'call':
        this.receivingCall(data)
        break;
      case "on-call":
        this.callAutoReject(data)
        break;
      case "new-ice-candidate":
        this.handleNewICECandidateMsg(data)
        break;
      default:

        break;
    }
  }

  private responseListener() {
    this.listener.call.subscribe((data: any) => {
      if (data.type == 'response') {
        this.stopTone()
        // Response from remote peer
        console.log('Sending ' + data.msg.response + 'ed response...')
        data.msg = {
          to: this.onCallWith,
          response: data.msg.response,
          caller: data.msg.caller
        }
        if (data.msg.response == 'accept') {
          this.prepareRemoteScreen(data)
        } else {
          // On rejection
          this.titleUpdate()
          this.onCall = false;
        }
        this.chatService.send(data)
      }
    })
  }

  private updateUserList(data: []) {
    if (data.length != 0) {
      this.onlineusers = data
    } else {
      this.onlineusers = []
    }
  }

  ngOnDestroy() {
    this.dropCall()
  }

  mediaControl(element: any, mediaType: string) {
    let _this = element,
      _true = false;
    if (_this.classList.contains(mediaType)) {
      _true = true;
      _this.classList.remove(mediaType)
    } else {
      _true = false;
      _this.classList.add(mediaType)
    }

    if (mediaType == 'mute') {
      this.mute = _true;
    } else if (mediaType == 'no_video') {
      this.video = _true;
    }

    this.upgrade()
  }

  private upgrade(msg?: any) {

    if (msg != undefined) {
      let info = msg.msg.media;
      console.log('Received upgrade msg...', "Video: " + info.video + " and Sound: " + info.audio)
      this.mute = info.audio;
      this.video = info.video;
    } else {
      let message = {
        msg: {
          to: this.onCallWith,
          media: { video: this.video, audio: this.mute }
        },
        response: '',
        callType: '',
        type: 'upgrade'
      };
      this.chatService.send(message)

      console.log("Sent upgrade msg...", "Video: " + this.video + " and Sound: " + this.mute)
    }

    if (this.video) {
      this.incoming.play()
    } else {
      this.incoming.pause()
    }
    console.log(this.video, this.mute)

    this.incoming.muted = !this.mute
  }

  /**
   * Handling Local Peer Connection
   */

  createPeerConnection() {
    console.log("Setting up a RTCPeerConnection...");

    // Create an RTCPeerConnection which knows to use our chosen
    // STUN server.
    const configuration = {
      iceServers: [
        {
          urls: [
            'stun:stun.l.google.com:19302',
            // 'stun:stun.l.google.com:19302?transport=udp'
          ]
        },
        {
          urls: 'turn:numb.viagenie.ca',
          username: 'hanisikuhle@gmail.com',
          credential: '58453'
        }
      ]
    };

    this.peerConnection = new RTCPeerConnection(configuration);

    // Set up event handlers for the ICE negotiation process.
    this.peerConnection.onicecandidate = (event: any) => this.handleICECandidateEvent(event);
    this.peerConnection.onremovetrack = (event: any) => this.handleRemoveTrackEvent(event);
    this.peerConnection.oniceconnectionstatechange = (event: any) => this.handleICEConnectionStateChangeEvent(event);
    this.peerConnection.onicegatheringstatechange = (event: any) => this.handleICEGatheringStateChangeEvent(event);
    this.peerConnection.onsignalingstatechange = (event: any) => this.handleSignalingStateChangeEvent(event);
    // this.peerConnection.onnegotiationneeded = (event: any) => this.handleLocalNegotiation(event);

    // Because the deprecation of addStream() and the addstream event is recent,
    // we need to use those if addTrack() and track aren't available.

    this.peerConnection.ontrack = (event: any) => this.handleTrackEvent(event);
  }

  handleLocalNegotiation(event) {
    this.peerConnection.createOffer().then((sdp: any) => {
      return this.peerConnection.setLocalDescription(sdp)
    })
      .then(() => {
        // Send SDP to remote media
        this.localSDP = this.peerConnection.localDescription;
        let message = {
          msg: {
            to: this.onCallWith,
            sdp: this.localSDP,
            from: this.user.id,
            caller: {
              name: this.user.name,
              image: this.user.image
            }
          },
          callType: this.callType,
          type: 'call-offer'
        };
        this.chatService.send(message)

      })
  }

  handleICECandidateEvent(event: any) {
    if (event.candidate) {
      this.chatService.send({
        type: "new-ice-candidate",
        callType: '',
        msg: {
          to: this.onCallWith,
          candidate: event.candidate
        }
      });
    }
  }

  handleICEConnectionStateChangeEvent(event: any) {
    switch (this.peerConnection.iceConnectionState) {
      case 'connected':
        this.incoming.classList.remove('d-none')
        break;
      case 'checking':
        document.getElementsByClassName('media-state')[0].innerHTML = "Connecting..."
        break;
      case "closed":
      case "failed":
        this.endCall();
        break;
      case "disconnected":
        // this.endCall();
        break;
    }

    if (this.peerConnection == null) {
      console.log("connection is null")
    }
    console.log("handleICEConnectionStateChangeEvent: ", (this.peerConnection != null) ? this.peerConnection.iceConnectionState : 'Nothing')
  }

  handleICEGatheringStateChangeEvent(event: any) {

  }

  handleSignalingStateChangeEvent(event: any) {
    console.log("handleSignalingStateChangeEvent: ", this.peerConnection.signalingState)
    switch (this.peerConnection.signalingState) {
      case "closed":
        // this.endCall();
        break;
    }
  }

  handleTrackEvent(event: any) {
    this.incoming.srcObject = event.streams[0];
  }

  handleRemoveTrackEvent(event) {
    var trackList = this.incoming.srcObject.getTracks();
    if (trackList.length == 0) {
      // this.endCall();
      console.log("handleRemoveTrackEvent: ", trackList.length)
    }

  }

  private handleNewICECandidateMsg(data: any) {
    let candidate = new RTCIceCandidate(data.msg.candidate);
    this.peerConnection.addIceCandidate(candidate)
      .catch(error => {
        // this.handleCallError(error)
        console.log("handleNewICECandidateMsg: ", error)
      });
  }

  receivingCall(data) {
    if (this.onCall) {
      console.log('On Call.., try again later')
      this.chatService.send({
        type: "on-call",
        callType: '',
        msg: {
          to: data.msg.from
        }
      });
      return false;
    }
    this.onCallWith = data.msg.from;
    this.titleUpdate(data.msg.caller.name + ' is calling')
    this.onCall = true;
    this.tone.play()
    this.tone.volume = 0.5
    this.listener.makeCall(data)
  }

  callAutoReject(data: any) {
    console.log("Auto rejected")
    let start = 5
    document.getElementsByClassName('media-state')[0].innerHTML = 'On another call, auto dropping in <span id="auto-drop">' + start + '</span>'
    let target = document.getElementById('auto-drop')
    let autoCount = setInterval(() => {
      start--;
      target.innerText = "" + start + ""
      if (start <= 0) {
        clearInterval(autoCount)
        setTimeout(() => {
          this.endCall()
        }, 1000)
      }
    }, 1000)
  }

  /**
   * Handling Local call
   */

  public localCall(event: any, uid: any, callType: string) {
    let target = event.target,
      parentNode = target.parentNode.parentNode.parentNode,
      main_container = document.querySelector('.main-container'),
      media_container = document.querySelector('.media-container');

    this.onCallWith = uid;
    this.titleUpdate('Calling ' + this.onCallWith)

    if (main_container.querySelectorAll('.contact.active').length != 0 ||
      document.querySelector('.contact-list').classList.contains('oncall')) {
      return false;
    }

    if (!parentNode.classList.contains('online')) return false;

    parentNode.querySelector('.call-state').innerHTML = 'Calling...';
    let contacts = document.getElementsByClassName('contact');
    for (let i = 0; i < contacts.length; i++) {
      contacts[i].classList.remove('active')
    }
    parentNode.classList.add('active')

    // media-container
    media_container.querySelector('.media-state').innerHTML = "Connecting...";
    this.caller.name = parentNode.querySelector('.item-name').innerText;
    this.caller.image = parentNode.querySelector('img').src;

    this.user.image = this.caller.image

    main_container.querySelector('.media-user').innerHTML = this.caller.name;

    this.callType = callType;
    main_container.classList.add('split-screen')

    let constraints: any;
    if (this.callType == 'voice') {
      constraints = { audio: true, video: false };
    } else {
      constraints = { audio: true, video: { facingMode: "user" } };
    }

    this.onCall = true;
    // Capture Video Media
    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {

        this.outgoing.srcObject = stream;
        this.localStream = stream;
        this.outgoing.volume = 0;
        this.outgoing.controls = false;

        setTimeout(()=> {
          this.outgoing.play();
      }, 5000);
        this.outgoing.classList.remove('d-none')
        let message = {
          msg: {
            to: this.onCallWith,
            from: this.user.id,
            caller: {
              name: this.user.name,
              image: this.user.image
            }
          },
          callType: this.callType,
          type: 'call'
        };
        this.chatService.send(message)

        // Pretend connection
        if (this.callType == 'video') {
          document.getElementById('dashboard-row').classList.add('connected')
        }

      })
      .catch(error => this.handleCallError(error));

  }

  /**
   * Handle call response from remote peer and preparing for RTCPeerConnection on local peer
   */
  prepareForConnection(data) {
    console.log(data.msg.response.toUpperCase() + "ED...")
    if (data.msg.response == 'reject') {
      this.endCall()
      return false;
    }
    console.log("Prepare For Connection...")
    this.createPeerConnection()
    this.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.localStream));

    this.handleLocalNegotiation(data)
  }

  // Preparing remote screen for call upon accepting the call
  prepareRemoteScreen(data: any) {
    console.log('Preparing screen for call...');
    this.caller.name = data.msg.caller.name;
    this.callType = data.callType;
    let main_container = document.querySelector('.main-container'),
      media_container = document.querySelector('.media-container');

    document.querySelector('.contact-list').classList.add('oncall')

    media_container.querySelector('.media-state').innerHTML = "Connecting...";
    main_container.querySelector('.media-user').innerHTML = this.caller.name

    main_container.classList.add('split-screen')
  }

  handleOfferMsg(data: any) {
    console.log('Handling the offer...', data);
    this.createPeerConnection()
    let remoteMedia: any = this.outgoing,
      audio = true,
      video = false;
    if (data.callType == 'video') video = true;

    let mediaConstraints = {
      audio: audio,
      video: video
    };

    this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.msg.sdp)).then(() => {
      return navigator.mediaDevices.getUserMedia(mediaConstraints);
    })
      .then((stream: any) => {

        this.localStream = stream;
        this.outgoing.srcObject = stream;
        this.outgoing.volume = 0;
        this.outgoing.controls = false;
        this.outgoing.play();
        this.outgoing.classList.remove('d-none')
        this.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.localStream));

        // Pretend connection
        if (this.callType == 'video') {
          document.getElementById('dashboard-row').classList.add('connected')
        }
      })
      .then(() => {
        return this.peerConnection.createAnswer();
      })
      .then((answer: any) => {
        return this.peerConnection.setLocalDescription(answer);
      })
      .then(() => {
        let message = {
          msg: {
            to: this.onCallWith,
            sdp: this.peerConnection.localDescription
          },
          callType: '',
          type: 'answer'
        };
        console.log("Sending answer packet back to the caller")
        this.chatService.send(message)
        this.titleUpdate("On call with " + this.onCallWith)
        this.startTimer()
      })
      .catch(error => this.handleCallError(error));

  }

  // Responds to the "answer" message sent to the caller
  // once the callee has decided to accept our request to talk.
  private answerRemoteCall(data: any) {
    console.log("Call recipient has accepted your call")

    // Configure the remote description, which is the SDP payload
    // in our "answer" message.
    if (this.peerConnection != null) {
      this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.msg.sdp)).then((e) => {
        this.startTimer()
      }).catch(error => this.handleCallError(error));

      this.titleUpdate('On call with ' + this.onCallWith)
    } else {
      console.log("No peerConnection found")
    }
  }

  private onAcceptCall() {
    console.log(this.peerConnection)
    this.peerConnection.onsignalingstatechange = (e) => {
      //console.log("onsignalingstatechange: ", e)
    };

    this.peerConnection.onconnectionstatechange = (e) => {
      console.log("onconnectionstatechange: ", e)
    }
  }

  private startTimer() {
    let onCallUser = document.querySelector('.contact.active');
    if (onCallUser != null) {
      onCallUser.querySelector('.call-state').innerHTML = 'On call...';
    }
    this.timer.start()
  }

  handleCallError(e: any) {
    console.log(e)
    let error: any;
    switch (e.name) {
      case "NotFoundError":
        error = "Unable to open your call because no camera and/or microphone" +
          "were found.";
        break;
      case "SecurityError":
      case "PermissionDeniedError":
        // Do nothing; this is the same as the user canceling the call.
        break;
      default:
        error = "Error opening your camera and/or microphone: " + e.message;
        this.dropCall()
        break;
    }
    console.error(error);
    document.getElementById('error').innerHTML = error
    this.endCall();
  }

  private handleEndCall(data: any) {

    if (data.msg.from == this.onCallWith) {
      console.log("*** Received hang up notification from other peer");
      this.endCall()
      this.listener.makeCall({
        msg: [],
        callType: '',
        type: 'closeModal'
      })
    } else {
      console.log('Am on call, I can\'t dropcall')
    }
  }

  dropCall() {
    this.endCall()
    let message = {
      msg: {
        to: this.onCallWith,
        from: this.user.id
      },
      callType: '',
      type: 'endcall'
    };
    this.chatService.send(message)
  }

  stopTone() {
    this.tone.load()
    this.tone.pause()
    this.tone.volume = 0
  }

  endCall() {
    let media = document.querySelector('.main-container');
    media.querySelector('.media-state').innerHTML = "";
    media.querySelector('.media-user').innerHTML = "Recipient";
    media.classList.remove('split-screen');

    if (document.querySelector('.contact-list').classList.contains('oncall')) {
      document.querySelector('.contact-list').classList.remove('oncall')
    }

    let contacts = document.getElementsByClassName('contact');
    for (let i = 0; i < contacts.length; i++) {
      contacts[i].classList.remove('active')
    }
    document.querySelector('.media-btn.video').classList.remove('no-video')
    document.querySelector('.media-btn.microphone').classList.remove('mute')
    document.getElementById('dashboard-row').classList.remove('connected')
    this.mute = true;
    this.video = true;

    this.stopTone()

    this.incoming.muted = false;
    this.incoming.play()
    this.incoming.classList.add('d-none')
    this.outgoing.classList.add('d-none')

    if (this.incoming.srcObject) {
      this.incoming.srcObject.getTracks().forEach(track => track.stop());
      this.incoming.srcObject = null;
    }

    if (this.outgoing.srcObject) {
      this.outgoing.srcObject.getTracks().forEach(track => track.stop());
      this.outgoing.srcObject = null
    }
    if (this.peerConnection) {
      this.peerConnection.ontrack = null;
      this.peerConnection.onremovetrack = null;
      this.peerConnection.onremovestream = null;
      this.peerConnection.onicecandidate = null;
      this.peerConnection.oniceconnectionstatechange = null;
      this.peerConnection.onsignalingstatechange = null;
      this.peerConnection.onicegatheringstatechange = null;
      this.peerConnection.onnegotiationneeded = null;
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.incoming.removeAttribute("src");
    this.incoming.removeAttribute("srcObject");
    this.outgoing.removeAttribute("src");
    this.outgoing.removeAttribute("srcObject");

    this.timer.stop()
    this.titleUpdate()
    this.onCall = false;


  }

}