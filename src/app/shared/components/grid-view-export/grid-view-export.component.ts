import { Component, OnInit, Input } from '@angular/core';
import { ListviewService, MessageService } from '@app/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MessageComponent } from '../message/message.component';
import { saveAs } from 'file-saver';
import { UserDetail } from '@app/core/models/user-detail';
@Component({
  selector: 'app-grid-view-export',
  templateUrl: './grid-view-export.component.html',
  styleUrls: ['./grid-view-export.component.scss']
})
export class GridViewExportComponent implements OnInit {
  ExportPopup: NgbModalRef;
  ExportType: string;
  CheckedCount = 0;
  IsAllChecked: boolean;
  ExportColumnList: any = [];
  ExportColumnList_DMOG: any=[];
  dist_ExportColumnList_DMOG : any=[];
  IsMiscChecked:boolean;
  IsMisHidden:boolean=true;
  CanvasType = null;

  objDMO:{Name:'', GUID: '',IsChecked:false, IsHidden:boolean, DataModelObjectGroup:{Name:'', GUID: ''}};
  // DownloadFileURL are use for get stream file from remote, please assign with endpoint exp : http://192.168.0.149:82/my-download-file-url
  ExternalCall = { FromURL: false, displayValue: 'DisplayName', GUID: 'GUID', DownloadFileURL: ''}
  // File setting is used to change your file name from external call
  FileSetting = {
    IsChangeFileName: false,
    FileName: ''
  };
  FileExtension = { EXCEL: '.xlsx', PDF: 'pdf' };

  ExportUserData = {
    ManageUsers: '', SortColumn: '-1', SortOrder: '-1', ProcessName: '', TimeZone: 0, ColumnList: '', GridFilters: [], TransactionIDs: '', ParentTransactionID: '', UserIds: '', TransactionID: '',
    ViewName:'',
    columns:[],
    configFor:''
  };

  constructor(
    private listviewService: ListviewService,
    private msg: MessageService,
    private modalService: NgbModal,
    private userDetail: UserDetail
  ) {
    this.IsAllChecked = false;
    this.ExportUserData.TimeZone = this.userDetail.TimeZone;
  }


  SetExportInstance(modalInstance: any) {
    this.ExportPopup = modalInstance;
  }

  getDMOList() {
    if (sessionStorage.getItem('processName')  === 'LMKOpportunities') {
      this.CanvasType = 'View4';
      this.ExportUserData.ViewName = this.CanvasType;
    }
    this.listviewService.dmoListOrderByDMO(this.ExportUserData.ProcessName,this.CanvasType)
      .subscribe(
        data => {
          if(!!data){
            this.setDmoList(data);
          }
        }
      );
  }

  setDmoList(data: any) {
    this.ExportColumnList = data;
    this.ExportColumnList.forEach(dmo => {

      let IsHiddenDMOG =true;
      //Export to excel should have visible columns checked by default    

      if(this.ExportUserData.columns.length == 0){
        dmo.IsChecked = true; 
        IsHiddenDMOG=false;
        this.CheckedCount++;
        this.IsAllChecked =true;
      }
      else if(this.ExportUserData.columns.filter(d => d.datafield === dmo.GUID).length >0){
        dmo.IsChecked = true; 
        IsHiddenDMOG=false;
        this.CheckedCount++;
      }
      else{
        dmo.IsChecked = false; 
      }

      //dmo.IsChecked = false;   
      dmo.DMOGGUID = dmo.DataModelObjectGroup === undefined? '': dmo.DataModelObjectGroup.GUID;
      if (dmo.BusinessModelObject != undefined && dmo.DataModelObjectGroup != undefined  ) {  
        this.objDMO = {Name:dmo.BusinessModelObject.Name, GUID:dmo.BusinessModelObject.GUID, 
          IsChecked:false,IsHidden:IsHiddenDMOG,
          DataModelObjectGroup:{Name:dmo.DataModelObjectGroup.Name, GUID:dmo.DataModelObjectGroup.GUID}} ;     
          this.ExportColumnList_DMOG.push(this.objDMO);
      }
    });

    let Disp_DMOG = this.ExportColumnList_DMOG.filter(d=> d.IsHidden === false).filter((thing, i, arr) =>
    arr.findIndex(t => t.DataModelObjectGroup.GUID === thing.DataModelObjectGroup.GUID) === i
   );

    this.dist_ExportColumnList_DMOG = this.ExportColumnList_DMOG.filter((thing, i, arr) =>
     arr.findIndex(t => t.DataModelObjectGroup.GUID === thing.DataModelObjectGroup.GUID) === i
    ); 

    this.dist_ExportColumnList_DMOG.forEach(dmo => {
      if(Disp_DMOG.filter(d => d.DataModelObjectGroup.GUID  === dmo.DataModelObjectGroup.GUID).length >0){
        dmo.IsHidden = false; 
      }
    });

    if(this.ExportColumnList.filter(d => d.IsChecked === true && d.DataModelObjectGroup === undefined).length > 0){
      this.IsMisHidden = false;
    }
  }
  
  ngOnInit() {
    if (!this.ExternalCall.FromURL) {
      this.getDMOList();
    }
  }
  closeAllModal() { }
  CheckUncheck(Item: any) {   
    Item.IsChecked = !Item.IsChecked;
    if(Item.DMOGGUID == ""){
    if(this.ExportColumnList.filter(d=> d.DMOGGUID === '' && d.IsChecked == true).length === 
    this.ExportColumnList.filter(d=> d.DMOGGUID === '').length){
      this.IsMiscChecked = true;
    }
    else {
      this.IsMiscChecked = false;
    }
  }
  else{
    if(this.ExportColumnList.filter(d=> d.DMOGGUID === Item.DMOGGUID && d.IsChecked == true).length === 
    this.ExportColumnList.filter(d=> d.DMOGGUID === Item.DMOGGUID).length){
      this.dist_ExportColumnList_DMOG.filter(d=> d.DataModelObjectGroup.GUID === Item.DMOGGUID)[0].IsChecked = true;
    }
    else{
      this.dist_ExportColumnList_DMOG.filter(d=> d.DataModelObjectGroup.GUID === Item.DMOGGUID)[0].IsChecked = false;
    }
  }

    if (Item.IsChecked) {
      this.CheckedCount++;
    }
    else { this.CheckedCount--; }

    if (this.ExportColumnList.length === this.CheckedCount) {
      this.IsAllChecked = true;
    }
    else {
      this.IsAllChecked = false;
    }


  }
  CheckUncheckALL() {
    this.IsAllChecked = !this.IsAllChecked;
    this.IsMiscChecked =  this.IsAllChecked ;

    this.dist_ExportColumnList_DMOG.forEach(chkItem => {
      chkItem.IsChecked = this.IsAllChecked;
    });

    this.ExportColumnList.forEach(chkItem => {
      chkItem.IsChecked = this.IsAllChecked;
    });
    if (this.IsAllChecked) {
      this.CheckedCount = this.ExportColumnList.length;
    }
    else {
      this.CheckedCount = 0;
    }
  }

  CheckUncheckDMOG(Item: any) {  
    Item.IsChecked = !Item.IsChecked;

    if(Item.DataModelObjectGroup.GUID != undefined){
      this.ExportColumnList.filter(d=> d.DMOGGUID === Item.DataModelObjectGroup.GUID).forEach(chkItem => {
        chkItem.IsChecked = Item.IsChecked;

        if (Item.IsChecked) {
          this.CheckedCount++;
        }
        else { this.CheckedCount--; }
      });
    }

    if (this.ExportColumnList.length === this.CheckedCount) {
      this.IsAllChecked = true;
    }
    else {
      this.IsAllChecked = false;
    }   
  }

  CheckUncheckMisc() {  
    this.IsMiscChecked = !this.IsMiscChecked;
    
    this.ExportColumnList.filter(d=> d.DMOGGUID === '').forEach(chkItem => {
      chkItem.IsChecked = this.IsMiscChecked;
      if (chkItem.IsChecked) {
        this.CheckedCount++;
      }
      else { this.CheckedCount--; }
    });

    if (this.ExportColumnList.length === this.CheckedCount) {
      this.IsAllChecked = true;
    }
    else {
      this.IsAllChecked = false;
    }   
  }


  // showErrorMessage(ErrorMsg: string, HeaderMsg: string,) {
  //   const errorPop = this.modalService.open(MessageComponent, { backdrop: 'static', windowClass: 'Confirm_popup' });
  //   const modalInstance: MessageComponent = errorPop.componentInstance;
  //   modalInstance.Message = ErrorMsg;
  //   modalInstance.MessagePopup = errorPop;
  //   modalInstance.IsConfirmation = false;
  //   modalInstance.CallBackMethod = null;
  //   modalInstance.Caller = this;
  //   modalInstance.MessageHeader = HeaderMsg;
  // }

  setSelectedColumn(): boolean {
    const selectedColumns = [];
    this.ExportColumnList.forEach(dmo => {
      if (dmo.IsChecked) {
        selectedColumns.push(dmo[this.ExternalCall.GUID]);
      }
    });
    if (selectedColumns.length === 0) {
      this.msg.showMessage('Warning', {body: 'Please select a column'});
      // this.showErrorMessage('Please select the column.', 'Warning !');
      return false;
    } else if (selectedColumns.length > 10 && this.ExportType === 'PDF') {
      /* Verbiage in this popup could be improved */
      this.msg.showMessage('Warning', {body: 'More than 10 columns are not allowed for export type PDF'}); 
      // this.showErrorMessage('More than 10 columns is not allowed for export type PDF.', 'Warning !');
      return false;
    }
    this.ExportUserData.ColumnList=selectedColumns.join(',');

    return true;
  }
  Export() {
    if (this.ExportType === 'EXCEL') {
      this.exportToFile();
    }
    else if (this.ExportType === 'PDF') {
      this.exportToFile();
    }
    else {
      this.msg.showMessage('Warning', {body: 'Export type is missing'});
      // this.showErrorMessage('Export Type is missing.', 'Warning !');
      return false;
    }
  }
  SaveExportFile(FileData: any) {
    const curDate = new Date();
    let fileName = '';
    if (this.FileSetting.IsChangeFileName) {
      fileName = this.FileSetting.FileName +
        '_' + (curDate.getMonth() + 1).toString()
        + '_' + curDate.getDate()
        + '_' + curDate.getFullYear()
        + '_' + curDate.getHours()
        + '_' + curDate.getMinutes()
        + '_' + curDate.getSeconds()
        + this.FileExtension[this.ExportType];
    }
     else {
      fileName = this.ExportUserData.ProcessName +
        '_' + (curDate.getMonth() + 1).toString()
        + '_' + curDate.getDate()
        + '_' + curDate.getFullYear()
        + '_' + curDate.getHours()
        + '_' + curDate.getMinutes()
        + '_' + curDate.getSeconds()
        + this.FileExtension[this.ExportType];
    }
    saveAs(FileData, fileName);

    this.CloseExport();
  }
  exportToFile() {
    if (!this.ExternalCall.FromURL) {
      if (this.setSelectedColumn()) {
        if (this.ExportType === 'EXCEL') {
          this.listviewService.ExportToExcel(this.ExportUserData)
            .subscribe(
              (resultBlob: Blob) => {
                this.SaveExportFile(resultBlob);
              }
            );
        } else if (this.ExportType === 'PDF') {
          this.listviewService.ExportToPDF(this.ExportUserData)
            .subscribe(
              (resultBlob: Blob) => {
                this.SaveExportFile(resultBlob);
              }
            );
        }
      }
    } else {
      if (this.setSelectedColumn()) {
        this.listviewService.ExportFileWithEndPointURL(this.ExportUserData, this.ExternalCall.DownloadFileURL)
          .subscribe(
            (resultBlob: Blob) => {
              this.SaveExportFile(resultBlob);
            }
          );
      }
    }
  }
  CloseExport() {
    this.ExportPopup.close();
  }

  hideFilter(event, newValue){
    newValue.IsHidden = !newValue.IsHidden;

    if(newValue.DataModelObjectGroup.GUID != undefined){
      this.ExportColumnList.filter(d=> d.DMOGGUID === newValue.DataModelObjectGroup.GUID).forEach(chkItem => {
        chkItem.IsHidden = newValue.IsHidden;       
      });
    }
  }  

  hideMisFilter(){
    this.IsMisHidden = !this.IsMisHidden;    
  }  
}


