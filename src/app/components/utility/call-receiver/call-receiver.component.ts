import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { ReceiverModalComponent } from '../receiver-modal/receiver-modal.component';
import { ListenerService } from 'src/app/services/utility/listener/listener.service';

@Component({
  selector: '.call-receiver',
  templateUrl: './call-receiver.component.html',
  styleUrls: ['./call-receiver.component.scss']
})
export class CallReceiverComponent implements OnInit {

  modalRef: BsModalRef;
  private callInfo: any;

  constructor(
    private modalService: BsModalService,
    private listener: ListenerService
  ) {}

  ngOnInit() {

    // Listening for calls
    this.callListener()
  }

  private callListener(){
    this.listener.call.subscribe((data: any) => {
      this.callInfo = data
      if(data.type == 'call'){
        console.log("Incoming call from: " + data.msg.caller.name)
        this.ring()
      }

    })
  }

  private ring(){
    this.callModal();
  }

  callModal() {
    let data = this.callInfo;
    const initialState = {
      title: "Incoming " + data.callType + " call",
      callType: data.callType,
      caller: {
        name: data.msg.caller.name,
        image: data.msg.caller.image
      },
      callInfo: data
    };
    this.modalRef = this.modalService.show(ReceiverModalComponent, {
      initialState,
      ignoreBackdropClick: true,
      class: 'modal-dialog-centered'
    })
  }

}
