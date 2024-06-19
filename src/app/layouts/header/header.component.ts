import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService, AuthenticationService } from '@app/core';
import { environment } from '@env/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  userFullName: string;
  isUserLoggedIn = false;
  flag = 'unread';

  isOpen = false;
  notificationList: any[] = [];

  modalScrollDistance = 2;
  modalScrollThrottle = 50;
  pageFrom = 0;

  showItemLoading = true;
  isMarkAsRead = false;
  isQuickMind=false;
  hideGlobalLogo: boolean=false;
  constructor(
    public headerService: HeaderService,
    private authenticationService: AuthenticationService,
    private router: Router
  ) {
    //this.userFullName = userDetail.FullName;
    this.isUserLoggedIn = true;
    this.authenticationService.currentUser.subscribe(user => {
      if (user && user.FirstName) {
        this.isUserLoggedIn = true;
        this.userFullName = user.FirstName + ' ' + user.LastName;
      } else {
        this.isUserLoggedIn = false;
        this.userFullName = '';
      }
    });
  }

  ngOnInit() {      
    let fullurl = window.location.href;   
    let url = (window.location.href).split('/');   
    if(url[4] !== undefined && (url[4] === 'quickmind' || url[4] === 'quickmindlist')) {
      this.isQuickMind = true;
    }
    else if(!!fullurl && fullurl.includes('e-contract-legal-process/sign')){
        this.hideGlobalLogo = true;
     }
    else{
      this.hideGlobalLogo = false;
      this.isQuickMind = false;
    }
  }

  gotoQuickmind(){
   localStorage.setItem('quickMindAppName',sessionStorage.getItem('AppName'));       
   window.open('/quickmind', '_blank');
  }

  toggle(flag) {    
    this.showItemLoading = false;
    if (!!this.notificationList && this.notificationList.length === 0) {
      this.headerService.getNotification(flag, 0).subscribe(
        result => {          
          this.notificationList = result;
          this.isMarkAsRead = this.notificationList.filter(x => x.ReadStatus == 0).length > 0;
          this.showItemLoading = true;
        }
      );
    } else {
      this.showItemLoading = true;
    }
    this.isOpen = !this.isOpen;
  }

  show(event) {
    this.showItemLoading = false;
    if (event.currentTarget.innerHTML === 'Show all') {
      event.currentTarget.innerHTML = 'Show only unread';
      this.flag = 'all';
      this.pageFrom = 0;
      this.headerService.getNotification(this.flag, this.pageFrom).subscribe(
        result => {
          this.notificationList = result;
          this.showItemLoading = true;
        }
      );
    } else {
      event.currentTarget.innerHTML = 'Show all';
      this.flag = 'unread';
      this.pageFrom = 0;
      this.headerService.getNotification(this.flag, this.pageFrom).subscribe(
        result => {
          this.notificationList = result;
          this.showItemLoading = true;
        }
      );
    }
  }

  markRead(key, index) {
    this.headerService.readNotification(key).subscribe(
      result => {
        if (this.headerService.Count === 0) {
          this.isOpen = !this.isOpen;
        }
      }
    );
    this.notificationList[index].ReadStatus = 1;
  }

  openDetailPage(announcementId: any) {
    window.open('/announcement/showdetail/' + encodeURIComponent(announcementId), '_blank');
  }

  markAllAsRead() {
    const keys = this.notificationList.filter(x => x.ReadStatus == 0).map(x => x.ID).join(',');
    this.notificationList.filter(x => x.ReadStatus == 0).map(x => x.ReadStatus = 1);

    this.headerService.readNotification(keys).subscribe(
      result => {
        if (this.headerService.Count === 0) {
          this.isOpen = !this.isOpen;
        }
      }
    );
  }


  onModalScrollDown() {    
    this.showItemLoading = false;
    if(!!this.notificationList){
      this.pageFrom = this.notificationList.length;
    }else{
         this.pageFrom = 0;
    }    
    this.headerService.getNotification(this.flag, this.pageFrom).subscribe(
      result => {
        result.forEach(element => {
          this.notificationList.push(element);
        });
        this.showItemLoading = true;
      }
    )
  }

  logout() {   
    if (localStorage.getItem("loginType") && localStorage.getItem("loginType").toLowerCase().toString() == "normaluser") {
      this.authenticationService.logout()
        .subscribe(res => {
          //this.router.navigate(['/auth/login']);
          window.location.href ='/auth/login';
        });
    } else {
      this.authenticationService.logout()
        .subscribe(res => {
          window.location.href = environment.Setting.logoutUrl.toString();
        }); 
    }
  }
   goToUserProfile(){
    window.open('/users/user-profile?uName='+encodeURIComponent('myprofile=user'), '_blank');
  }
}
