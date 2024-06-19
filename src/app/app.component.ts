import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { LoaderComponent } from '@app/shared';
import { environment } from '@env/environment';
import { VersionCheckService } from './core/services/version-check.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'nutriencms';
  public loaderComponent = LoaderComponent;

  constructor(private titleService: Title, private versionCheckService: VersionCheckService, private router: Router) {}
  ngOnInit() {
    if (sessionStorage.getItem('DisplayName')) {
      const processtitle = sessionStorage.getItem('DisplayName');
      this.setDocTitle(processtitle);
    }
    // if(!localStorage.getItem('Current-Version')){for devops
    // localStorage.setItem('Current-Version',environment.timeStamp);}
    //this.versionCheckService.initVersionCheck(localStorage.getItem('Current-Version'));
    // this.versionCheckService.initVersionCheck((this.router.url).split('/')[0]+'/version.json');
  }

  ngAfterViewInit() {}

  setDocTitle(title: string) {
    this.titleService.setTitle('Nutrien | ' + title);
  }
}
