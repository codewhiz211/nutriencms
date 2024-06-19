import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ContentManagerService } from '@app/core/services/content-manager.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-add-edit-assest',
  templateUrl: './add-edit-assest.component.html',
  styleUrls: ['./add-edit-assest.component.scss']
})

export class AddEditAssestComponent implements OnInit {

  FileID = '';
  addEditData = {
    DataID: '',
    TempDataID: 0,
    Name: '',
    Status: 'Active',
    Description: '',
    Document: '',
    Category: '',
    AssetType: '',
    file: [
      {
        OriginalFileName: '',
        ModifiedFileName: '',
        Filesize: 0,
        ControlName: ''
      }
    ]
  };
  file: File = null;
  errorMsg: string='';
  fileName: string;
  processName: string;
  formVal = true;
  assetList: any;
  addEditAsset = 'Add Asset';
  isShowSave:boolean = true;
  constructor(
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private contentManager: ContentManagerService) { }

  ngOnInit() {
    this.contentManager.getAsset().subscribe(x => {
      this.assetList = x;
    });
  }

  onSubmit(val, userForm) {
    if (val) {
      if (this.addEditData.AssetType === 'Document') {
        this.upload();
      } else {
        this.post();
      }
    }
  }
  post() {
    this.contentManager.AddOrUpdate(this.addEditData).subscribe(Result => {
      if (Result.DataID) {
        this.toastr.success('Data saved successfully');
        this.activeModal.close(Result);
      }
    },
    err => {
      this.toastr.error(err.error.message);
      this.activeModal.close(0);
    });
  }
  handleFileInput(files: FileList) {      
      this.file = files.item(0);
      const ext = (this.file.name.split('.').pop()).toLowerCase();
      let MatchExt = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'vsd','vsdx'].includes(ext);
      if (MatchExt === true) {
        this.errorMsg = '';
        this.fileName = this.file.name;
      }
      else {
        this.errorMsg = 'The uploaded file format is not supported, supported formats are - .docx, .doc, .pdf, .xls, .xlsx, .ppt, .pptx, .vsd, .vsdx';
        this.file = null;
      }
    }
  upload(): boolean {
    if (this.file === null) {
      if (this.addEditData.DataID) {
        this.addEditData.file = [];
        this.post();
        return true;
      }
      this.errorMsg = 'Please select file';
      return false;
    }
    this.errorMsg = '';
    this.fileName = '';
    const formData = new FormData();
    const TempDataID = (Math.floor(Math.random() * 10) + 208);
    formData.append('uploadFile', this.file);
    this.contentManager.uploadFile('contentmanager/uploadDocumentContentManager' + '?dataID=' + this.addEditData.DataID +
      '&tempDataID=' + TempDataID, formData).subscribe(Result => {
      console.log(Result);
      if (Result) {
        this.addEditData.file[0].OriginalFileName = Result.OriginalFileName;
        this.addEditData.file[0].ModifiedFileName = Result.ModifiedFileName;
        this.addEditData.file[0].Filesize = this.file.size;
        this.addEditData.TempDataID = TempDataID;
        this.file = null;
        console.log('done');
        this.post();
        return true;
      } else {
        this.toastr.error(Result.Message, 'Error');
        return false;
      }
    }, error => { console.log(error); });
  }
  /*------------------- Download File -------------------*/
  downloadFile() {
    const fileData = {
       dataID: this.addEditData.DataID,
       fileID: this.FileID
    };
    this.contentManager.getFile(fileData).subscribe(data => {
      saveAs(data, this.fileName);
    }, err => {
    });
  }
}
