import { Component, OnInit, Input, ElementRef } from '@angular/core';

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class TabComponent implements OnInit {
  @Input() title: string;
  @Input() active = false;
  @Input() hasInvalidForm = false;
  @Input() bmodisplay: boolean;
  @Input() trnsctnId: any;
  @Input() ChildProcessName: string;
  @Input() ParentDmoValue: any;
  @Input() ChildDmoGuid: any;
  @Input() ProcessType: any;

  constructor(
    public el: ElementRef
  ) { }

  ngOnInit() {
  }

}
