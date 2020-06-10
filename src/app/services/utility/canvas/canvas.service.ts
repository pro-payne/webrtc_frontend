import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {

  private frameRate = 60;
  constructor() { }

  init(video: any, type: string) {

    let canvasType = "localCanvas",
      streamType = (type == 'local') ? 'outgoing' : 'incoming',
      viewPort = document.getElementById(streamType + '-stream'),
      canvasW = 180,
      canvasH = 135;
    if (type == 'remote') {
      canvasType = "remoteCanvas";
      canvasW = viewPort.clientWidth;
      canvasH = this.ratio(viewPort.clientWidth);
    }

    let canvas: any = document.getElementById(canvasType)
    canvas.width = canvasW;
    canvas.height = canvasH;
    let context = canvas.getContext('2d');
    // context.scale(-1,1)
    this.draw(video, canvas, context)

  }

  draw(video: any, canvas: any, context: any) {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (!video.paused) {
      setTimeout(() => {
        this.draw(video, canvas, context)
      }, this.frameRate);
    }
  }

  private ratio(width: number) {
    let ratio = 4/3; // 4:3
    return width / ratio;
  }
}
