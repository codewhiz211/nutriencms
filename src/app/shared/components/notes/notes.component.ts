import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ListviewService } from '@app/core';
import { saveAs } from 'file-saver';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})

@Injectable({
  providedIn: 'root'
})
export class NotesComponent implements OnInit {

  @Input() IsShowSendMessage = false;
  @Input() transactionId: string;

  dateFormat: string = environment.Setting.dateFormatInNotes;
  dateFormatRegEx = /\./g;
  isOn = false;
  msgText: string;
  btnDisable = true;
  notesData;

  userListDisabled = true;
  processName = this.route.snapshot.params.process != null ? this.route.snapshot.params.process : sessionStorage.getItem('AppName');
  userListData = [];

  userMentionConfig = {
    items: this.userListData,
    triggerChar: '@',
    maxItems: 10,
    labelKey: 'UserFullName',
    mentionSelect: this.userSelectFormat,
    dropUp: true
  };
  upfile;
  hasFile = true;

  selectedFileName = '';
  selectedFile = '';
  fullFileName;
  fileTYpe: string;
  showFileType;
  checkMessageField = true;

  /*------------------- Send Notes Data  -------------------*/
  notesDetail = {
    Identifier: {
      Name: '',
      Value: '',
      TrnsctnID: ''
    },
    CommentType: 'DiscussionBoard',
    Comment: '',
    Files: [
      {
        OriginalFileName: '',
        ModifiedFileName: '',
        FileSize: ''
      }
    ]
  };

  constructor(
    private route: ActivatedRoute,
    public listviewService: ListviewService,
    private toastr: ToastrService,
    private router: Router) { }

  ngOnInit() {
    if (!this.transactionId) {
      this.transactionId = this.route.snapshot.params.id;
    }

    this.notesDetail.Identifier.TrnsctnID = this.transactionId;

    if (this.processName == null) {
      const url = (this.router.url).split('/');
      this.processName = url[2];
    }
    // await this.getNotesData();
    //this.getUserData();
    // this.notescomponent.getNotesData(transID);
  }

  /*------------------- Get Users Data  -------------------*/
  getUserData(term = null) {
    if(this.userListData == null || this.userListData == undefined ||  this.userListData.length <= 0) {
    const userData = {
      processname: this.processName,
      searchtext: '@'
    };
    this.listviewService.userList(userData)
    .subscribe(
      data => {
        this.userListData = data;
        this.userMentionConfig = {
          items: this.userListData,
          triggerChar: '@',
          maxItems: 10,
          labelKey: 'UserFullName',
          mentionSelect: this.userSelectFormat,
          dropUp: true
        };
      }, err => {
        console.log(err);
      }
    );
    // this.userListData = this.listviewService.userList(userData).toPromise();
    }

  }

   /*------------------- Get Notes Data  -------------------*/
   getNotesData(transID) {
    this.listviewService.noteMessage(transID)
      .subscribe(
        data => {
          this.notesData = data;
          this.notesData = this.notesData.reverse();
          this.listviewService.notesShowData = [];
          this.notesData.filter((prop, index) => {
            if (prop.Files.length > 0) {
              this.fullFileName = prop.Files[0].OriginalFileName;
              this.fileTYpe = this.fullFileName.substring(this.fullFileName.lastIndexOf('.') + 1).toLowerCase();
              if (this.fileTYpe === 'png') {
                this.showFileType = 'far fa-image';
              } else if (this.fileTYpe === 'txt') {
                this.showFileType = 'far fa-file';
              } else {
                this.showFileType = 'far fa-file';
              }
            }
            this.listviewService.notesShowData.push(
              { fileDetail: prop, filename: this.showFileType ? this.showFileType : '', fileFullName: this.fullFileName });
            // this.notesShowData = this.notesShowData.reverse();
            console.log("notes data", this.listviewService.notesShowData);
            this.showFileType = '';
          });
        }, err => {
          console.log(err);
        }
      );
    // this.notesData = this.listviewService.noteMessage(transID).toPromise();
    // this.notesData = this.notesData.reverse();
  }

  userSelectFormat(item: any) {
    return '@' + item.UserName + ' ';
  }

  /*------------------- Show popup -------------------*/
  toggle() {
    if(this.IsShowSendMessage)return;
    this.isOn = !this.isOn;
  }

  /*------------------- hide popup -------------------*/
  close() {
    this.isOn = false;
    this.notesDetail.Comment = '';
    this.selectedFileName = '';
    this.hasFile = true;
    this.upfile = null;
  }

  upload(UploadEvent: Event) {
    if (UploadEvent.currentTarget['files'].length === 0) {
      return;
    }
    this.selectedFile = UploadEvent.currentTarget['files'][0].name;
    const formData = new FormData();
    formData.append('uploadFile', UploadEvent.currentTarget['files'][0]);
    this.listviewService.uploadFiles('application/uploadFileDiscussionBoard' + '?processName=' + this.processName + '&transactionID=' + this.transactionId, formData)
      .subscribe(
        data => {
          this.selectedFileName = this.selectedFile;
          console.log('file data', data);
          this.upfile = data;
          this.hasFile = false;
          // if (data) {
          //   this.notesDetail.Files[0].FileSize = data.FileSize;
          //   this.notesDetail.Files[0].ModifiedFileName = data.ModifiedFileName;
          //   this.notesDetail.Files[0].OriginalFileName = data.OriginalFileName;
          //   this.notesDetail.Identifier.Name = this.processName;
          // }
        }, err => {
          console.log(err);
          this.toastr.error(err.error.message, 'Error');
        },
        () => UploadEvent.target['value'] = '',
      );
  }

  showHideIocn() {
    this.notesDetail.Comment === '' ? (this.checkMessageField = true) : (this.checkMessageField = false);
    this.checkMessageField=this.checkMessageField==false?this.IsShowSendMessage==true?true:false:true;
  }

/*------------------- Send Notes Comment -------------------*/
  sendNotesData() {
    if (!this.upfile && !this.notesDetail.Comment) {
      return;
    }
    if (!this.upfile) {
      this.notesDetail.Files = [];
    } else {
      this.notesDetail.Files = [
        {
          OriginalFileName: this.upfile.OriginalFileName,
          ModifiedFileName: this.upfile.ModifiedFileName,
          FileSize: this.upfile.FileSize
        }];
    }
    this.listviewService.sendNoteMessage(this.notesDetail)
      .subscribe(
        data => {
          this.getNotesData(this.transactionId);
          this.notesDetail.Comment = '';
          this.notesDetail.Files = [];
          this.upfile = null;
          this.isOn = false;
          this.selectedFileName = '';
          if (data > 0) {
            this.close();
            this.hasFile = true;
            this.checkMessageField = true;
          }
        },
        err => {
          this.isOn = false;
          if (err.error) {
            this.toastr.error(err.error.message, 'Error');
          } else {
            this.toastr.error(err.statusText, 'Error');
          }
        }
      );   
  }

  /*------------------- Download File -------------------*/
  downloadNotesFile(fileData) {
    const downloadRequire = {
      transactionid: this.transactionId,
      fileid: fileData.fileDetail.Files[0].FileID
    };
    this.listviewService.downloadFile(downloadRequire)
      .subscribe(
        (resultBlob: Blob) => {
          saveAs(resultBlob, fileData.fileFullName);
        }, err => {
          console.log(err);
        }
      );
  }
}
