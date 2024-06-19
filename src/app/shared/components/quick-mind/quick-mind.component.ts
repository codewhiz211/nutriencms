import { Component, OnInit } from '@angular/core';
import { QuickMindService } from '@app/core/services/quick-mind.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-quick-mind',
  templateUrl: './quick-mind.component.html',
  styleUrls: ['./quick-mind.component.scss']
})
export class QuickMindComponent implements OnInit {

  keyword = 'QUES';
  data: any;

  constructor(
    private qmService: QuickMindService,
    private router: Router,
    private titleService: Title) {
  }

  ngOnInit() {
    this.setDocTitle('Quick Mind');
  }

  /*
   call when item select
 */
  selectEvent(item) {
    this.qmService.searchtxt = item.QUES;
    this.router.navigate(['quickminddetail']);
  }

  /*
 fetch remote data from here
 And reassign the 'data' which is binded to 'data' property.
  */
  onChangeSearch(val: string) {
    console.log(val);
    this.qmService.searchtxt = val;
    this.qmService.getQuickMindSearch(val).subscribe(Result => {
      this.data = Result;
    });
  }

  /*
  Call search method when click on search button.
  check input variable is blank then does not redirect
  */
  search(query) {
    if (query) {
      this.router.navigate(['quickminddetail']);
    }
  }

  setDocTitle(title: string) {
    this.titleService.setTitle('Nutrien | ' + title);
 }
}
