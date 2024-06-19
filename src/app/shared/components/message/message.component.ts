import { Component, OnInit, Input, PipeTransform, Pipe } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  IsDefaultView: boolean;
  MessagePopup: NgbModalRef;
  MessageHeader = 'Confirmation';
  Message: string;
  CallBackMethod: any;
  IsConfirmation: boolean;
  Caller: any;
  ButtonText: string;
  isCancelabel = true;
  IsDelete: boolean;
  ConfirmationText: string;
  CancelButtonText: string;
  AutoFocusOnConfirm: boolean;
  IsVersion: boolean = false;
  countDown: Subscription;
  counter = 20;
  tick = 1000;
  constructor() {
    this.ButtonText = 'Ok';
  }
  ngOnInit() {
    this.countDown = timer(0, this.tick).subscribe(() => { 
      if(this.counter <= 0){
      }
      else{
      --this.counter
      }
    });
  }
  ngOnDestroy(){
    this.countDown=null;
  }
  Continue() {
    if (this.CallBackMethod) {
      this.CallBackMethod(this.MessagePopup, this.Caller);
      this.MessagePopup.close(true);
    } else {
      this.MessagePopup.close(true);
    }
  }

  CloseErrorMsg() {
    this.MessagePopup.close(false);
  }

  // Function execute when user click on X button for close the popup.
  // And pass null value for not execute IF and ELSE statement.
  CloseFromTop() {
    this.MessagePopup.close(null);
  }
  setIsDefaultView() {
    this.IsDefaultView = !this.IsDefaultView;
    console.log('check status', this.IsDefaultView);
  }

}
