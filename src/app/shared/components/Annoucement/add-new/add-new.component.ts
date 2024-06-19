import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AnnoucementService } from '@app/core/services/annoucement.service';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { environment } from '@env/environment';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-add-new',
  templateUrl: './add-new.component.html',
  styleUrls: ['./add-new.component.scss']
})
export class AddNewComponent implements OnInit {
  
  Editor = ClassicEditor;
  dateFormat;  
  Status = [{ value: 'Active' }, { value: 'Inactive' }];
  processDetail;
  IsInternalShow = false;
  IsExternalShow = false;
  ExternalInternal = false;
  public formVal = true;
  announceData = {
    AnnouncementID: '',
    Title: '',
    StartDate: '',
    EndDate: '',
    Status: 1,
    ProcessIds: '',
    IsInternalShow: 0,
    IsExternalShow: 0,
    Description: ''
  };

  announceIDData;
  announceIDProcess;
  Statusvalue;
  ProcessIds;
  setProcessID;
  stratDateobj: NgbDateStruct;
  endDateobj: NgbDateStruct;
  AnnouncementID;
  rowID;
  CurrentDateobj;
  sendCurrentDate;
  appRoleCheck = 0;  

  constructor(
    private annoucementService: AnnoucementService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public location: Location,
    private titleService: Title
  ) {
    this.dateFormat = environment.Setting.dateFormat;
    const CurrentDate = new Date();
    this.CurrentDateobj = { year: CurrentDate.getFullYear(), month: (CurrentDate.getMonth() + 1), day: CurrentDate.getDate() };
    this.stratDateobj = this.CurrentDateobj;
    this.endDateobj = this.CurrentDateobj;
    const sDay = this.CurrentDateobj.day;
    const sMonth = this.CurrentDateobj.month;
    const sYear = this.CurrentDateobj.year;
    this.sendCurrentDate = sMonth + '/' + sDay + '/' + sYear;
  }
  ngOnInit() {
    const url = (this.router.url).split('/');
    if (url[2] === 'announcement' && url[3] === 'add_new') {
      this.annoucementService.checkAppRole('Announcement').subscribe(data => {
        this.appRoleCheck = data;
        if(this.appRoleCheck > 0){
            this.setDocTitle('Announcement');
            this.processData();
        }
      });
    }

  }
  /*------------------- Get Process Data -------------------*/
  processData() {
    this.annoucementService.getProcessData()
      .subscribe(
        data => {
          this.processDetail = data;
          this.rowID = this.activatedRoute.snapshot.params.ID;
          if (this.rowID) {
            this.getannounceData();
          }
        }
      );
  }
  /*------------------- Set Process ID -------------------*/
  processName(event: any) {
    this.announceData.ProcessIds = event.Id;
    this.ProcessIds = event.DisplayName;
  }

  /*------------------- Set Status Value -------------------*/
  setStatus(val: string) {
    if (val === 'Active') {
      this.announceData.Status = 1;
    } else {
      this.announceData.Status = 0;
    }
  }

  /*------------------- Set Start Date -------------------*/
  getStartDate(dateobj) {
    if (dateobj != undefined) {
      const sDay = dateobj.day;
      const sMonth = dateobj.month;
      const sYear = dateobj.year;
      const sFullDate = sMonth + '/' + sDay + '/' + sYear;
      this.announceData.StartDate = sFullDate;
      console.log('start date', sFullDate);
    }
  }

  /*------------------- Set End Date -------------------*/
  getEndDate(dateobj) {
    if (dateobj != undefined) {
      const sDay = dateobj.day;
      const sMonth = dateobj.month;
      const sYear = dateobj.year;
      const sFullDate = sMonth + '/' + sDay + '/' + sYear;
      this.announceData.EndDate = sFullDate;
      console.log('start date', sFullDate);
    }
  }

  /*------------------- Add New Announcement -------------------*/
  onSubmit(val, userForm) {
    if (val) {
      this.announceData.IsInternalShow = this.IsInternalShow ? 1 : 0;
      this.announceData.IsExternalShow = this.IsExternalShow ? 1 : 0;
      this.announceData.AnnouncementID = this.rowID ? this.rowID : '';
      this.announceData.StartDate = this.announceData.StartDate ? this.announceData.StartDate : this.sendCurrentDate;
      this.announceData.EndDate = this.announceData.EndDate ? this.announceData.EndDate : this.sendCurrentDate;
      this.annoucementService.addAnnouncement(this.announceData)
        .subscribe(
          data => {
            console.log('announce data', data);
            this.router.navigate(['/announcement']);
          },
          error => {
          }
        );
    } else {
      return;
    }
}

  /*------------------- Get Announcement Data -------------------*/
  getannounceData() {
    this.annoucementService.getAnnouncement(this.rowID)
      .subscribe(
        data => {
          this.announceIDData = data.AnnouncementDetail[0];
          this.announceIDProcess = data.AnnouncementProcess[0].PeId;
          this.announceData.Title = this.announceIDData.Title;
          this.announceData.StartDate = this.announceIDData.StartDate;
          this.announceData.EndDate = this.announceIDData.EndDate;
          this.announceData.Status = this.announceIDData.Status;
          this.announceData.ProcessIds = this.announceIDProcess;
          if (this.announceIDProcess) {
            this.processDetail.filter((prop) => {
              if (prop.Id == this.announceIDProcess) {
                this.ProcessIds = prop;
              }
            });
          }

          this.announceData.IsInternalShow = this.announceIDData.IsInternalShow;
          this.announceData.IsExternalShow = this.announceIDData.IsExternalShow;
          if (this.announceIDData.IsExternalShow || this.announceIDData.IsInternalShow) {
            this.ExternalInternal = true;
          }
          this.announceData.Description = this.announceIDData.Description;
          const lstStartDate = this.announceIDData.StartDate.toString().split('/');
          this.stratDateobj = {year: parseInt(lstStartDate[2], 0), month: parseInt(lstStartDate[0], 0), day: parseInt(lstStartDate[1], 0) };
          const lstEndtDate = this.announceIDData.EndDate.toString().split('/');
          this.endDateobj = { year: parseInt(lstEndtDate[2], 0), month: parseInt(lstEndtDate[0], 0), day: parseInt(lstEndtDate[1], 0) };
          if (this.announceIDData.Status === 1) {
            this.Statusvalue = 'Active';
          } else {
            this.Statusvalue = 'Inactive';
          }
          this.announceIDData.IsInternalShow === 1 ? this.IsInternalShow = true : this.IsInternalShow = false;
          this.announceIDData.IsExternalShow === 1 ? this.IsExternalShow = true : this.IsExternalShow = false;
          console.log('announce data', data);
        },
        error => {
        }
      );
  }
  canceldata() {
    this.announceData.AnnouncementID = '';
    this.announceData.Title = '';
    this.announceData.Description = '';
    this.IsInternalShow = false;
    this.IsExternalShow = false;
    this.ProcessIds = '';
    this.Statusvalue = '';
    const CurrentDate = new Date();
    // const CurrentDateobj = { year: CurrentDate.getFullYear(), month: (CurrentDate.getMonth() + 1), day: CurrentDate.getDate() };
    this.stratDateobj = this.CurrentDateobj;
    this.endDateobj = this.CurrentDateobj;
  }

  go_back() {
    this.router.navigate(['/announcement']);
  }
  AssignValue() {
    if (this.IsExternalShow || this.IsInternalShow) {
      this.ExternalInternal = true;
    } else {
      this.ExternalInternal = false;
    }
  }

  setDocTitle(title: string) {
    this.titleService.setTitle('Nutrien | ' + title);
 }
}
