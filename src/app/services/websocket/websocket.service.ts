import { Injectable } from '@angular/core';
import { Observable, Subject, Observer } from 'rxjs';
import { environment } from '../../../environments/environment';
// import { Message } from 'src/app/interface/message';

const url = environment.ws;
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private subject: Subject<MessageEvent>;
  private ws: WebSocket;

  constructor() { }

  public connect(): Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create();
    }
    return this.subject;
  }

  private create(): Subject<MessageEvent> {
    this.ws = new WebSocket(url);

    this.ws.addEventListener('error', (err: any) => {
     let readyState = err.target.readyState;
      console.error('Server error: ', err); // unexpected server response (521)
      console.info('Re-trying to connect')
      // document.getElementById('connection-status').innerHTML = "Unable to connect"
    });

    this.ws.addEventListener('open', () => {
       console.info('Successfully connected')
      //  document.getElementById('connection-status').innerHTML = "Connected"
     });
    let observable = Observable.create((obs: Observer<MessageEvent>) => {

      this.ws.onmessage = obs.next.bind(obs);
      this.ws.onerror = obs.error.bind(obs);
      this.ws.onclose = obs.complete.bind(obs);

      return this.ws.close.bind(this.ws);
    });
    let observer = {
      next: (data: Object) => {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(data));
        }
      }
    };
    return Subject.create(observer, observable);
  }


  public close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
