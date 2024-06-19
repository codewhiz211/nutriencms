import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { MessageService } from './message.service';
import { SpinnerVisibilityService } from 'ng-http-loader';

@Injectable()
export class VersionCheckService {

    //private currentHash = environment.timeStamp;
    private currentHash = '{{POST_BUILD_ENTERS_HASH_HERE}}';
    checkOpenPopup = 0;
    private http: HttpClient;
    constructor(private msg: MessageService,private spinner: SpinnerVisibilityService,handler: HttpBackend) {
        this.http = new HttpClient(handler);
        // this.spinner.hide();
    }
    
    public initVersionCheck(url, frequency = 1000 * 60*2) {
        // setInterval(() => {
        //     this.spinner.hide();
        //     this.checkVersion(url);
        //     this.spinner.hide();
        // }, frequency);
        this.checkVersion(url);
    }
    private checkVersion(url) {
        // timestamp these requests to invalidate caches
        this.spinner.hide();
        this.http.get(url + '?t=' + new Date().getTime())
            .subscribe(
                (response: any) => {
                    this.spinner.hide();
                    const hash = response.hash;
                    const hashChanged = this.hasHashChanged(this.currentHash, hash);
                    // If new version, do something
                    if (hashChanged) {
                        if(this.checkOpenPopup === 0){
                            this.checkOpenPopup = 1;
                            this.msg.showMessage('Warning', {
                            header: 'Latest version of the application available.',
                            body: 'It is required to use the latest version in order to avoid errors. This page will refresh automatically after 20 seconds to get the latest version.',
                            btnText: 'OK ',
                            IsVersion: true,
                            callback: this.pageReloadConfirmation,
                            caller: this,
                          })
                        }
                        localStorage.setItem('Current-Version',this.currentHash);
                        this.checkOpenPopup = 0;
                        setTimeout(function(){
                            window.location.reload();
                          },20000);
                    }
                    this.currentHash = hash;
                },
                (err) => {
                    console.error(err, 'Could not get version');
                }
            );
    }
    private hasHashChanged(currentHash, newHash) {
        if (!currentHash || currentHash === '{{POST_BUILD_ENTERS_HASH_HERE}}') {
            return false;
        }
        return currentHash !== newHash;
    }
    pageReloadConfirmation() {
        localStorage.setItem('Current-Version',environment.timeStamp);
        this.checkOpenPopup = 0;
        window.location.reload();
    }
}