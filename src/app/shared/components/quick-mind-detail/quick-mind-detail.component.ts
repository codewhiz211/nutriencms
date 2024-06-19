import { Component, OnInit } from '@angular/core';
import { NgbAccordionConfig } from '@ng-bootstrap/ng-bootstrap';
import { QuickMindService } from '@app/core/services/quick-mind.service';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-quick-mind-detail',
  templateUrl: './quick-mind-detail.component.html',
  styleUrls: ['./quick-mind-detail.component.scss']
})
export class QuickMindDetailComponent implements OnInit {

  keyword = 'QUES';
  data: any;
  listData: any;
  activeId = '';
  constructor(config: NgbAccordionConfig, private qmService: QuickMindService,
              public location: Location,
              private titleService: Title) {
    // customize default values of accordions used by this component tree
    config.closeOthers = true;
    // config = true;
    // config.type = 'info';
  }

  ngOnInit() {
    this.setDocTitle('Quick Mind');
    if (this.qmService.searchtxt) {
     this.search();
    }
  }

  // perform when item selected from autocomplete.
  selectEvent(item) {
    this.qmService.searchtxt = item.QUES;
    this.listData = this.data;
    this.activeId = '';
  }

   /*
 fetch remote data from here
 And reassign the 'data' which is binded to 'data' property.
  */
  onChangeSearch(val: string) {
    this.qmService.searchtxt = val;
    this.qmService.getQuickMindSearch(val).subscribe(Result => {
      this.data = Result;
    });
  }

  /*
  set actived id when page change.
  */
  toggleAccordian(event) {
    this.activeId = this.activeId === event.panelId ? '' : event.panelId;
  }

   /*
  Call search method when click on search button.
  and get data from remote.
  */
  search() {
    this.activeId = '';
    this.qmService.getQuickMindSearch(this.qmService.searchtxt).subscribe(Result => {
      this.listData = Result;
    });
  }

  setDocTitle(title: string) {
    this.titleService.setTitle('Nutrien | ' + title);
 }
}
