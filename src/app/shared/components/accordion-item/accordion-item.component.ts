import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { trigger, state, transition, animate, style, group } from '@angular/animations';
import { Subscription } from 'rxjs';

import { ApplicationService } from '@app/core';

@Component({
  selector: 'app-accordion-item',
  templateUrl: './accordion-item.component.html',
  styleUrls: ['./accordion-item.component.scss'],
  animations: [
    trigger('accordionItemContentAnimation', [
      state('isOpen', style({height: '*', overflow: 'visible'})),
      state('isClose', style({height: 0, overflow: 'hidden'})),
      transition('isClose => *', [animate('.5s', style({height: '*', overflow: 'hidden'}))]),
      transition('* => isClose', [animate('0s', style({height: '*', overflow: 'hidden'})),
                                  animate('.5s', style({height: 0, overflow: 'hidden'}))]),
    ]),
  ]
})
export class AccordionItemComponent implements OnInit, OnDestroy {
  public state = 'isClose';
  checkValidationSub: Subscription;
  hasInvalidForm = false;

  isOpened: boolean;
  get isOpen(): boolean {
    return this.isOpened;
  }

  @Input('isOpen')
  set isOpen(value: boolean) {
    this.isOpened = value;
    this.state = this.isOpened ? 'isOpen' : 'isClose';
  }

  @Input() title: string;
  @Output() Toggle: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private el: ElementRef,
    private applicationService: ApplicationService
  ) { }


  ngOnInit() {
    this.checkValidationSub = this.applicationService.checkValidation.subscribe((isCheck: boolean) => {
      if (isCheck) {
        setTimeout(() => {
          this.makeValidate();
        });
      }
    });
  }

  ngOnDestroy() {
    this.checkValidationSub.unsubscribe();
  }

  makeValidate() {
    const invalidElement = this.el.nativeElement.querySelector('.invalid-feedback');
    if (invalidElement) {
      this.hasInvalidForm = true;
    } else {
      this.hasInvalidForm = false;
    }
  }


  public onClickHeader() {
    this.isOpen = this.isOpen ? false : true;
    this.Toggle.emit(this.isOpen);
  }
}
