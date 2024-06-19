import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-approve-buyer-account-confirm-modal',
  templateUrl: './approve-buyer-account-confirm-modal.component.html',
  styleUrls: ['./approve-buyer-account-confirm-modal.component.scss']
})
export class ApproveBuyerAccountConfirmModalComponent implements OnInit {

  firstName: string;
  lastName: string;
  landmarkAccountNumber: number;

  constructor(
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
  }

}
