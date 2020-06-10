import { Component } from '@angular/core';
import { ResizeService } from './services/utility/resize/resize.service';

@Component({
  selector: '.app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private resizeWin: ResizeService){
    resizeWin.resize();
  }

  onResize(){
    this.resizeWin.resize();
  }
}
