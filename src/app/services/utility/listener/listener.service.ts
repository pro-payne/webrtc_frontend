import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Message } from 'src/app/interface/message';

@Injectable({
  providedIn: 'root'
})
export class ListenerService {

  private callBehavior = new Subject<Message>();
  public call = this.callBehavior.asObservable();

  constructor() { }

  makeCall(data: Message){
  	this.callBehavior.next(data);
  }

}
