import { Injectable } from '@angular/core';
import { WebsocketService } from "../websocket/websocket.service";
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Message } from 'src/app/interface/message';

@Injectable({
  providedIn: 'root'
})

export class ChatService {

  public messages: Subject<any>;

  constructor(private wsService: WebsocketService) {
    this.messages = <Subject<any>>wsService.connect().pipe(
      map((response: any): any =>{
        return response
      })
    )
  }

  public send(message: Message) {
    this.messages.next(message)
  }

  public close() {
    this.wsService.close()
  }
}
