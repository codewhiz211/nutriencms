import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApplicationService, FormViewService } from '@app/core';
import { Location } from '@angular/common';


@Component({
  selector: 'app-e-lot-detail',
  templateUrl: './e-lot-detail.component.html',
  styleUrls: ['./e-lot-detail.component.scss']
})
export class ELotDetailComponent implements OnInit {

  processName = 'LMKOPECESLot';

  parentId: string;
  transactionId: string;
  isNew = false;
  submitted = false;
  currentUser: any;
  BMJSON: any = {};
  applicationData: any = {};
  topCornerDetails = [];
  constructor(
    private route: ActivatedRoute,
    // private authenticationService: AuthenticationService,
    private applicationService: ApplicationService,
    private formViewService: FormViewService,
    public location: Location
  ) { }

  ngOnInit() {
   // this.currentUser = this.authenticationService.currentUserValue;
    this.route.paramMap.subscribe(params => {
      this.parentId = params.get('sale_id');
      this.transactionId = params.get('id');
      this.setValues();
    });
  }

  setValues() {
    this.formViewService.getBmWfJson(this.processName, 'AdminView', this.transactionId).subscribe(response => {
      this.BMJSON = response.BM.BusinessModelObjectGroup.AdminView;
      this.applicationService.getApplicationData(null, null, 'AdminView', this.transactionId).subscribe(data => {
        this.applicationData = data;
        this.applicationService.getTopCornerDetail(null, null, 'AdminView', this.transactionId).subscribe(topDetails => {
          if(topDetails){            
          topDetails.forEach(element => {
            this.topCornerDetails[element.DisplayName] = element.Value;
          });
          }
          if (data.DataInformation.lmkoeelotdmovdombrch && data.DataInformation.lmkoeelotdmovdombrch.DMOVAL.indexOf('~~~') > -1) {
            this.topCornerDetails['Vendor Domiclled Branch'] = data.DataInformation.lmkoeelotdmovdombrch.DMOVAL.split('~~~')[1];
          }
          if (data.DataInformation.lmkoeelotdmobuybrch && data.DataInformation.lmkoeelotdmobuybrch.DMOVAL.indexOf('~~~') > -1) {
            this.topCornerDetails['Buyer Branch'] = data.DataInformation.lmkoeelotdmobuybrch.DMOVAL.split('~~~')[1];
          }
          if (data.DataInformation.lmkoeelotdmovendcompname && data.DataInformation.lmkoeelotdmovendcompname.DMOVAL.indexOf('~~~') > -1) {
            this.topCornerDetails['Vendor Company Name'] = data.DataInformation.lmkoeelotdmovendcompname.DMOVAL.split('~~~')[0];
          }
          if (data.DataInformation.lmkoeelotdmobuycompname && data.DataInformation.lmkoeelotdmobuycompname.DMOVAL.indexOf('~~~') > -1) {
            this.topCornerDetails['Buyer Company Name'] = data.DataInformation.lmkoeelotdmobuycompname.DMOVAL.split('~~~')[0];
          }
        });
      });
    });
  }
}

