import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@app/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Component({
  selector: 'app-sso-page',
  templateUrl: './sso-page.component.html',
  styleUrls: ['./sso-page.component.scss']
})

export class SsoPageComponent implements OnInit {
  returnUrl: string;
  constructor(private routes: Router,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private httpclient: HttpClient) { }

  async ngOnInit(): Promise<void> {
    console.log(this.routes.url);
    this.SamlFileRequest();
  }

  async SamlFileRequest() {
    await this.CallSamlAuthenticateRequestURL();
  }

  async CallSamlAuthenticateRequestURL() {  
    let samlEndpointUrl = environment.Setting.samlEndpointUrl;
    let relayState = environment.Setting.relayState;
    this.authenticationService.getSamlAuthenticateRequestURL(samlEndpointUrl, relayState).subscribe(
      data => {  
        if (data) {
          this.returnUrl = data;
          window.location.href = this.returnUrl;
          //this.routes.navigateByUrl(this.returnUrl);
        }
      },
      error => {
       console.log(error.message);
       alert(error.message);
      });
  }

}
