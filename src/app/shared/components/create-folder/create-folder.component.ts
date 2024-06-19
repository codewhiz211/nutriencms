import { Component, OnInit } from '@angular/core';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentViewComponent } from '../document-view/document-view.component';
// import { MessageComponent } from '../message/message.component';
import { MessageService } from '@app/core';

@Component({
  selector: 'app-create-folder',
  templateUrl: './create-folder.component.html',
  styleUrls: ['./create-folder.component.scss']
})
export class CreateFolderComponent implements OnInit {
  caller: DocumentViewComponent;
  folderName = '';
  popup: NgbModalRef;
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
  CreateFolder(txtFolder: any) {
    if (txtFolder.value !== '') {
       this.caller.CreateDocFolder(txtFolder.value);
    } else {
      this.msg.showMessage('Warning', {body: 'Folder name required'});
      // this.showErrorMessage('Folder Name Required!', 'Warning !');
    }
  }
}
