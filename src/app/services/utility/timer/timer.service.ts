import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimerService {

  private seconds = 0;
  private minutes = 0;
  private hours = 0;
  private time: any;

  constructor() {
  }

  private add() {
    let media_state = document.querySelector('.media-state');
    this.seconds++;
    if (this.seconds >= 60) {
      this.seconds = 0;
      this.minutes++;
      if (this.minutes >= 60) {
        this.minutes = 0;
        this.hours++;
      }
    }

    media_state.textContent = (this.hours ? (this.hours > 9 ? this.hours : "0" + this.hours) : "00") + ":" + (this.minutes ? (this.minutes > 9 ? this.minutes : "0" + this.minutes) : "00") + ":" + (this.seconds > 9 ? this.seconds : "0" + this.seconds);
    this.timer()
  }

  public start() {
    this.timer()
  }

  private timer() {
    this.time = setTimeout(() => {
      this.add()
    }, 1000);
  }

  public stop() {
    clearTimeout(this.time)
    let media_state = document.querySelector('.media-state');
    media_state.textContent = "00:00:00";
    this.seconds = 0; this.minutes = 0; this.hours = 0;
  }
}
