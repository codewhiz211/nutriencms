import { Component, OnInit } from '@angular/core';
import { environment } from '@env/environment';
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  currentApplicationVersion = environment.timeStamp;
  copyRight = new Date().getFullYear();
  hideGlobalLogo: boolean = false;
  constructor() { }

  ngOnInit() {
    let fullurl = window.location.href;  
   if(!!fullurl && fullurl.includes('e-contract-legal-process/sign')){
      this.hideGlobalLogo = true;
   }
  else{
    this.hideGlobalLogo = false;
  }
  }

}
