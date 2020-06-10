import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { ListenerService } from 'src/app/services/utility/listener/listener.service';

@Component({
  selector: '.receiver-modal',
  templateUrl: './receiver-modal.component.html',
  styleUrls: ['./receiver-modal.component.scss']
})
export class ReceiverModalComponent implements OnInit {

  public title: string;
  public caller: [] = [];
  private callInfo: any;

  constructor(
    public modalRef: BsModalRef,
    private listener: ListenerService
    ) { }

  ngOnInit() {
    this.listener.call.subscribe((data: any) => {
      if (data.type == 'closeModal') {
        this.modalRef.hide()
      }
    })
  }


  public callRespond(response: string){
    let message = {
      msg: {
        response: response,
        caller: []
      },
      callType: '',
      type: 'response'
    };
    if(response == 'accept'){
      message.msg.caller = this.callInfo.msg.caller;
      message.callType = this.callInfo.callType;
    }

    this.modalRef.hide()
    this.listener.makeCall(message)
  }

}
