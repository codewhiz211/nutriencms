import { Injectable } from '@angular/core';
import { MessageComponent } from '@app/shared/components/message/message.component'
import { NgbModal, NgbCalendar, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
@Injectable({
    providedIn: 'root'
})
export class MessageService {
    constructor(private modalService: NgbModal) {

    }

	showMessage(type: MessageType, options: MessagePopup = {}) {
		options.header = options.header || type;
		if (options.isDelete)
			options.isConfirmation = true;
		options.cancelBtn = !!options.isConfirmation;

		const modalRef = this.modalService.open(MessageComponent, {backdrop: 'static', windowClass: 'Confirm_popup', size: options.size});
		const modalInstance: MessageComponent = modalRef.componentInstance;
		modalInstance.MessagePopup = modalRef;
		modalInstance.MessageHeader = options.header;
		modalInstance.Message = options.body;
		modalInstance.ButtonText = options.btnText;
		modalInstance.IsConfirmation = options.isConfirmation;
		modalInstance.isCancelabel = options.cancelBtn;
		modalInstance.CallBackMethod = options.callback;
		modalInstance.Caller = options.caller;
		modalInstance.ConfirmationText = options.checkboxText;
		modalInstance.IsDelete = options.isDelete;
		modalInstance.IsDefaultView = !options.isDelete;
		modalInstance.CancelButtonText = options.cancelBtnText || 'Cancel';
		modalInstance.AutoFocusOnConfirm = !!options.autoFocusOnConfirm;
		modalInstance.IsVersion = options.IsVersion;
		return modalRef;
	}
}

interface MessagePopup {
    header?: string;
    body?: string;
	btnText?: string;
	cancelBtn?: boolean;
	checkboxText?: string;
	callback?: Function;
	caller?: any;
	data?: any;
	isDelete?: boolean;
	isConfirmation?: boolean;
	size?: 'lg' | 'sm';
	cancelBtnText?: string;
	autoFocusOnConfirm?: boolean;
	IsVersion?:boolean;
}

type MessageType =
| 'Success'
| 'Warning'
| 'Fail';

