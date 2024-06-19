import { Component, OnInit } from '@angular/core';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentViewComponent } from '../document-view/document-view.component';
import { MessageComponent } from '../message/message.component';
import { MessageService } from '@app/core';

@Component({
  selector: 'app-create-folder',
  templateUrl: './rename-file-folder.component.html',
  styleUrls: ['./rename-file-folder.component.scss']
})
export class RenameFileFolderComponent implements OnInit {
  caller: DocumentViewComponent;
  folderName = '';
  popup: NgbModalRef;
  row;
  constructor(private modalService: NgbModal, private msg: MessageService) { }

  ngOnInit() {
  }

  Close() {
    this.caller.modalRef.close();
  }

  // showErrorMessage(ErrorMsg: string, HeaderMsg: string) {
  //   const errorPop = this.modalService.open(MessageComponent, { backdrop: 'static', windowClass: 'Confirm_popup' });
  //   const modalInstance: MessageComponent = errorPop.componentInstance;
  //   modalInstance.Message = ErrorMsg;
  //   modalInstance.MessagePopup = errorPop;
  //   modalInstance.MessageHeader = HeaderMsg;
  //   modalInstance.IsConfirmation = false;
  //   modalInstance.CallBackMethod = null;
  //   modalInstance.Caller = this;
  // }
  RenameFileFolder(form: any) {
    if (form.folderName.value !== '') {
       this.caller.RenameDocFolder(form.folderName.value, form.documentType ? form.documentType.value : undefined);
    } else {
      this.msg.showMessage('Warning', {body: 'File/Folder name required'});
      // this.showErrorMessage('File/Folder Name Required!', 'Warning !');
    }
  }
}
