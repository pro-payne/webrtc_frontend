import { Component, OnInit } from '@angular/core';

@Component({
  selector: '.login.grey_bg',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

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
