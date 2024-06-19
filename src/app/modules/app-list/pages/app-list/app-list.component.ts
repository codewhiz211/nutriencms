import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '@env/environment';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { HeaderService, ApplicationService, ApiESaleyardService,AuthenticationService } from '@app/core';
import { UserDetail } from '@app/core/models/user-detail';
import { currentUser } from '@app/testing';

@Component({
  selector: 'app-app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.scss']
})
export class AppListComponent implements OnInit, OnDestroy {
  hasUserGridRight = "false";
  loadTitle;
  AppList: any;
  ParentAllList: any;
  ImageEndpoint = environment.Setting.C2M_MediaApp_Url;
  private unsubscribe: Subscription[] = [];
  currentUser: any;
  topLineAdminRoles = ['lmktoplineinsuranceadmin', 'lmktoplinewooladmin', 'lmktoplinelivestockadmin'];

  constructor(
    private apiESaleyardService: ApiESaleyardService,
    private hdsrv: HeaderService,
    private applicationService: ApplicationService,
    private titleService: Title,  
    private authenticationService: AuthenticationService,
    private userDetail: UserDetail) {

    
  }
  ngOnInit() {
    setTimeout(() => {
      if (!this.ParentAllList) {
        this.LoadGrid();
      }
    }, 500);
    localStorage.removeItem('NotificationCount');
    sessionStorage.setItem('DisplayName', 'Dashboard');
    this.loadTitle = sessionStorage.getItem('DisplayName');
    this.setDocTitle(this.loadTitle);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }

  OpenApp(objApp: any): void {                        
    if (objApp.Name === 'LMKToplineWool' || objApp.Name === 'LMKToplineInsurance' 
    || objApp.Name === 'LMKToplineLivestock' || objApp.Name === 'MyFeeds' || objApp.Name === 'MyDashboards' || objApp.Name === 'PublicThings') {
      this.redirectDashboard(objApp);
      return;
    } 
    if (objApp.Name === 'LMKESaleyardListings') {
      sessionStorage.AppName = 'LMKOpportunities';
      sessionStorage.setItem('DisplayName', objApp.DisplayName);
    }
     else if (objApp.Name === 'LMKCRMEContractsRecords') {
      sessionStorage.AppName = 'LMKOpportunities';
      sessionStorage.setItem('DisplayName', objApp.DisplayName);
    } else {
      sessionStorage.AppName = objApp.Name;
      sessionStorage.setItem('DisplayName', objApp.DisplayName);
    }

    if (objApp.Name === 'Announcement') {
      window.open('/announcement', '_blank');      
    } else if (objApp.Name === 'QuickMind') {
      window.open('/quickmindlist', '_blank');
    } else if (objApp.Name === 'LMKESaleyardUsers') {
      window.open('/e-saleyard/grid', '_blank');
    } else if (objApp.Name === 'LMKESaleyardContentManager') {
      window.open('/content_manager/banner', '_blank');
    } else if (objApp.Name === 'LMKCRMEContractsRecords') {
      window.open('/crm/e-contract/LMKCRMEContractsRecords', '_blank');
    } else if (objApp.Name === 'LMKInsuranceSales') {
      window.open('/insurance/search', '_blank');
    } else if (objApp.Name === 'LMKWoolSales') {
      window.open('/wool/search', '_blank');
    } else if (objApp.Name === 'LMKLivestockSearch') {
      window.open('/livestock/search', '_blank');
    } else if (objApp.Name === 'Users') {
      window.open('/users/grid', '_blank');
    } else if (objApp.Name === 'LMKCRMCommissionAdjustment') {
      window.open('/crm/commissionadjustment/LMKCRMCommissionAdjustment', '_blank');
    } else if (objApp.Name === 'LMKAgencyCommStatement') { // #254 - Agency Commission Statement - Add New component
      window.open('/crm/agency-comm-statement', '_blank');
    } else {
      if (localStorage.getItem('AccessToken') !== null){
        this.hdsrv.CheckNotificationCount();
        }
      if (objApp.Name === 'LMKLivestockSales') {
        window.open('/crm/sales', '_blank');
      } else {
        window.open(`/process_control/${objApp.Name}`, '_blank');
      }
    }
  }

  async redirectDashboard(objApp: any) {
    this.currentUser = this.userDetail;
    const userRoles = this.currentUser.ListRole;
    const form = document.createElement('form');
    form.method = 'post';
    form.action = environment.Setting.dashboard.GatewayUrl;
    form.target = '_blank';
    const C2MTokenElement = document.createElement('input');
    C2MTokenElement.name = 'C2MToken';
    C2MTokenElement.value = '';
    C2MTokenElement.type = 'hidden';
    //Added By Nidhi    
    const finalJson = {
      C2Mattuid: '',
      C2Maccesstoken: this.userDetail.token,
      C2Mrefreshtoken: this.userDetail.token,
      ReturnUrl: '',
      ProcessID: environment.Setting.dashboard.ProcessID,
      AppName: environment.Setting.dashboard.AppName,
      AppType: environment.Setting.dashboard.AppType,
      C2Mtokenexpirytime: ''
    }
    if (objApp.Name === 'MyDashboards') {
      finalJson.C2Mtokenexpirytime = 'Buuvr0V4H5I5yt3NEEcvBA==';
      form.action = `${environment.Setting.dashboard.DashboardDomainUrl}/DashboardLandingPage.aspx?pg=myview.aspx`;
      finalJson.ReturnUrl = `${environment.Setting.dashboard.DashboardDomainUrl}/DashboardLandingPage.aspx?pg=myview.aspx`;
      C2MTokenElement.value = await this.applicationService.getEncryptedJSON(finalJson).toPromise();
      form.appendChild(C2MTokenElement);
      document.body.appendChild(form);
      console.log(form);
      form.submit();
    }
    else if (objApp.Name === 'MyFeeds') {
      finalJson.ReturnUrl = `${environment.Setting.C2M_Console_URL}/myThings.aspx`;
      C2MTokenElement.value = await this.applicationService.getEncryptedJSON(finalJson).toPromise();      
      form.appendChild(C2MTokenElement);
      document.body.appendChild(form);
      console.log(form);
      form.submit();      
    }
    else if(objApp.Name === 'PublicThings'){        
      finalJson.ReturnUrl = `${environment.Setting.C2M_Console_URL}/public-things.aspx`;      
      C2MTokenElement.value = await this.applicationService.getEncryptedJSON(finalJson).toPromise(); 
      form.appendChild(C2MTokenElement);    
      document.body.appendChild(form);
      console.log(form);
      form.submit();      
    }
    else{         
      //finalJson.ReturnUrl = `${environment.Setting.dashboard.DashboardDomainUrl}/DashboardLandingPage.aspx?pg=dashboard_view.aspx&View=${environment.Setting.dashboard[objApp.Name]}&visibility=${environment.Setting.dashboard.VisibilityKey}`;   
      let dashboardType = '';
      if (objApp.Name === 'LMKToplineLivestock') {
        dashboardType = 'livestock';
      }else  if (objApp.Name === 'LMKToplineWool') {
        dashboardType = 'wool';
      }else if(objApp.Name === 'LMKToplineInsurance'){
        dashboardType = 'insurance';
      }
      const getSearchQuerySubr = this.apiESaleyardService.postGetFile('user/ToplineReportsFilter?dashboardType='+dashboardType, null, 'json')
      .subscribe(searchQuerydata => {      
        C2MTokenElement.value = searchQuerydata;   
        form.appendChild(C2MTokenElement);
        document.body.appendChild(form);
        console.log(form);
        form.submit();
      });
      this.unsubscribe.push(getSearchQuerySubr);
    }
  }


  LoadGrid() {
    sessionStorage.removeItem('AppName');
    sessionStorage.removeItem('DisplayName');
    const getProcessSubr = this.applicationService.getProcess().subscribe(data => {
      this.AppList = data;
      const result = [];
      for (const key in this.AppList) {
        if (this.AppList.hasOwnProperty(key)) {
          result.push({
            id: key,
            name: key
          });
          if (this.AppList[key]) {
            if (this.AppList[key].find(x => x.dId == environment.Setting.userGridAppID)) {
              this.hasUserGridRight = "true";
            }
          }
        }
      }
      this.ParentAllList = result;
      localStorage.setItem('hasUserGridRight', this.hasUserGridRight);
    });
    this.unsubscribe.push(getProcessSubr);
  }

  getChildList(id: string): any {
    return this.AppList[id];
  }

  setDocTitle(title: string) {
    this.titleService.setTitle('Nutrien | ' + title);
  } 
  

}
