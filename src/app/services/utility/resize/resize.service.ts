import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResizeService {

  constructor() { }

  resize() {
    let windowH = window.innerHeight,
      main: any = document.querySelector('.resize'),
      header = document.querySelector('header'),
      contacts = document.querySelector('.contact-list');

      if(main != null){
        main.style.height = windowH;
      }

    console.log(windowH)
  }
}
