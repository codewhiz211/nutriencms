import { Component, OnInit } from '@angular/core';
import { environment } from '@env/environment';

@Component({
  selector: 'app-not-authorize',
  templateUrl: './not-authorize.component.html',
  styleUrls: ['./not-authorize.component.scss']
})
export class NotAuthorizeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  logOutUser() {
    window.location.href = environment.Setting.logoutUrl.toString(); 
  }

}
