import { Component, OnInit } from '@angular/core';

@Component({
  selector: '.register.grey_bg',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  valueCheck(input: any): any {
    let _this = input.target,
      _parent = _this.parentNode;    
    if (_this.value.length != 0) {
      _parent.classList.add('valid')
    } else {
      _parent.classList.remove('valid')
    }
  }

}
