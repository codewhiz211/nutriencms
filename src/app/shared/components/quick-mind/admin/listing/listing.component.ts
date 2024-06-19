import { Component, OnInit, ElementRef } from '@angular/core';
import { NgbModal, NgbCalendar, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ListingDetailComponent } from '../../../../../shared/components/quick-mind/admin/listing-detail/listing-detail.component';
import { ListviewService, MessageService } from '@app/core';
import { MessageComponent } from '../../../message/message.component';
import { NgbAccordionConfig, NgbAccordion, } from '@ng-bootstrap/ng-bootstrap';
import { NgbPaginationConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UserManagementService } from '@app/core/services/user-management.service';


@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss']
})
export class ListingComponent implements OnInit {

  processData;
  processName;
  processDisplayName;
  activeIds: string[] = [];
  allQuickMind = [];
  allQuickMindForPaging: any[] = [];
  cIds = [];
  checkedQuickID = '';
  closePannel = false;
  pageIndex = 1;
  pageSize = 10;
  startIndex = 1;
  maxIndex = 1;
  recordCount;
  pageCount;
  NextCount = 0;
  showAnswer = true;
  showTag = false;
  lastCount = 0;
  Activtab = '';
  answerStatus = true;
  tagStatus = false;
  elRef: ElementRef;
  dropdownProcessValidateMessage;
  appRoleCheck = 0;
  constructor(
    private msg: MessageService,
    private modalService: NgbModal,
    private listviewService: ListviewService,
    private config: NgbAccordionConfig,
    elRef: ElementRef,
    private toastr: ToastrService,
    private titleService: Title,
    private router: Router,
    private usermgt:UserManagementService
  ) {
    this.elRef = elRef;
  }

  ngOnInit() {
    const url = (this.router.url).split('/');
    if (url[1] === 'quickmindlist') {
      this.usermgt.checkBuyerRole('QuickMind').subscribe(data => {
        this.appRoleCheck = data;
        if(this.appRoleCheck > 0){
          this.getProcessData();
          this.config.closeOthers = true;
        }
      });
    }
    this.setDocTitle('Quick Mind');      
  }

  /*------------------- Open Popup -------------------*/
  openlistingDetailPopup(item) {
    if(this.processDisplayName===undefined ||this.processDisplayName==="")
    {
     this.dropdownProcessValidateMessage='Process is required';
    }

    else{
    const modalRef = this.modalService.open(ListingDetailComponent, { size: 'lg' });
    const modalInstance: ListingDetailComponent = modalRef.componentInstance;
    modalInstance.processName = this.processName;
    if (item !== null) {
      modalInstance.questionDetail.QmindId = item.QMID;
      modalInstance.questionDetail.Question = item.QUES;
      modalInstance.questionDetail.Answer = item.ANSW;
      modalInstance.questionDetail.Tag = item.TAG;
    }
    modalRef.result.then(Result => {
      if (Result > 0) {
        this.getAllQuestions(this.processName);
      }
    });


  }
  }

  /*------------------- Get Process Data -------------------*/
  getProcessData() {
    this.listviewService.getProcess()
      .subscribe(
        data => {
          if(!!data){
            this.processData = data;
            console.log('process data', data);
          }       
        }
      );
  }

  /*------------------- Load QuickMind on change Process -------------------*/
  setProcessName(event) {    
    this.dropdownProcessValidateMessage='';
    if (!!event) {
    this.processName = event.Name;
    this.processDisplayName = event.DisplayName;
    this.getAllQuestions(this.processName);
    this.activeIds = [];
    } else {
      this.allQuickMind = [];
      this.pageIndex = 1;
      this.setPageData();
    }
  }

  /*------------------- Get Checkbox IDs -------------------*/
  checkedBoxes(checkedID, event) {
    if (event.target.checked) {
      this.cIds.push(checkedID);
      this.checkedQuickID = this.cIds.toString();
      console.log('checked value', this.checkedQuickID);
    } else {
      for (let i = 0; i < this.cIds.length; i++) {
        if (this.cIds[i] == checkedID) {
          this.cIds.splice(i, 1);
          this.checkedQuickID = this.cIds.toString();
          console.log('checked value', this.checkedQuickID);
        }
      }
    }
  }


  /*------------------- Delete Quickmind -------------------*/
  deleteQuestions() {
    if (this.checkedQuickID != '') {
      // this.showConfirmMessage('Warning', 'Are you want to delete !');
      this.listviewService.deleteQuickmind(this.processName, this.checkedQuickID)
        .subscribe(
          data => {
            if (data === true) {
              this.toastr.success('Data deleted successfully');
              this.getAllQuestions(this.processName);
              this.cIds = [];
              this.checkedQuickID = '';
            }
            console.log('select for delete', data);
          },
          err => {
            this.toastr.error(err.error.message);
          }
        );
    } else {
      this.msg.showMessage('Warning', {body: 'No row selected'});
      // this.showErrorMessage('Delete', 'No row selected');
    }
  }


  /*------------------- Delete Popup -------------------*/
  // showErrorMessage(header: string, ErrorMsg: string) {
  //   const errorPop = this.modalService.open(MessageComponent, { backdrop: 'static' });
  //   const modalInstance: MessageComponent = errorPop.componentInstance;
  //   modalInstance.Message = ErrorMsg;
  //   modalInstance.MessageHeader = header;
  //   modalInstance.MessagePopup = errorPop;
  //   modalInstance.IsConfirmation = true;
  //   modalInstance.Caller = this;
  //   modalInstance.isCancelabel = false;
  // }

  // showConfirmMessage(header: string, ErrorMsg: string) {
  //   const errorPop = this.modalService.open(MessageComponent, { backdrop: 'static' });
  //   const modalInstance: MessageComponent = errorPop.componentInstance;
  //   modalInstance.Message = ErrorMsg;
  //   modalInstance.MessageHeader = header;
  //   modalInstance.MessagePopup = errorPop;
  //   modalInstance.IsConfirmation = true;
  //   modalInstance.Caller = this;
  //   modalInstance.isCancelabel = false;
  // }

  setPageData() {
    this.allQuickMindForPaging = [];
    this.recordCount = this.allQuickMind.length;
    const excessCount = this.recordCount % this.pageSize;
    this.pageCount = ((this.recordCount - excessCount) / this.pageSize) + ((excessCount > 0) ? 1 : 0);

    this.maxIndex = this.pageIndex * this.pageSize;
    let seekIndex = this.maxIndex - this.pageSize;
    if (this.maxIndex > this.recordCount) {
      this.maxIndex = this.recordCount;
    }
    this.startIndex = seekIndex + 1;
    while (seekIndex < this.maxIndex) {
      this.allQuickMindForPaging.push(this.allQuickMind[seekIndex]);
      seekIndex++;
    }

    if (this.allQuickMindForPaging.length > this.pageSize) {
      const deleteCount = this.allQuickMindForPaging.length - this.pageSize;
      this.allQuickMindForPaging.splice(this.pageSize, deleteCount);
    }
    // this.closePannel = false;
  }
  /*------------------- Get All Quickmind -------------------*/
  getAllQuestions(process) {
    this.listviewService.getAllQuickMind(process)
      .subscribe(
        data => {
          if (!!data && data.length) {
            if (data.length >= 5) {
              this.lastCount = 5;
            } else {
              this.lastCount = data.length;
            }
            console.log('All QuickMind', data);
            this.allQuickMind = data;
            this.setPageData();
          } else {
            this.allQuickMindForPaging = [];
            this.allQuickMind = [];
          }
        }
      );
  }
  /*------------------- Paging -------------------*/
  pageChanged(event) {
    this.pageIndex = parseInt(event, 0);
    this.setPageData();
    this.activeIds = [];
  }

  /*------------------- Toggle Accordian -------------------*/
  toggleAccordian(event) {      
    this.closePannel = false;
    const rowId = event.panelId;
    const keyIndex = this.activeIds.indexOf(rowId);
    if (keyIndex !== -1) {
      this.activeIds.splice(keyIndex, 1);
    } else {
      this.activeIds.push(rowId);
    }
  }

  /*------------------- Open All Accordian -------------------*/
  openAll() {            
    this.closePannel = false;
    this.activeIds = [];
    this.allQuickMindForPaging.forEach(element => {
      this.activeIds.push('QM'+element.QMID);
    });
    console.log(this.activeIds);
  }
  GetClass(QMID: string): string {    
      const keyIndex = this.activeIds.indexOf(QMID);
      return (keyIndex > -1) ? 'arrow-down' : 'arrow-right';      
  }

  /*------------------- Close All Accordian -------------------*/
  closeAll() {
    this.activeIds = [];
  }

  showHideTabs(tabValue, index) {
    this.Activtab = tabValue + index;
    if (this.Activtab == ('tag' + index)) {
      this.answerStatus = false;
      this.tagStatus = true;
    } else {
      this.answerStatus = true;
      this.tagStatus = false;
    }
  }

  setDocTitle(title: string) {
    this.titleService.setTitle('Nutrien | ' + title);
 }
}
