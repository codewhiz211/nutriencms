import { Component, OnInit } from '@angular/core';
import { AnnoucementService } from '@app/core/services/annoucement.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-show-detail',
  templateUrl: './show-detail.component.html',
  styleUrls: ['./show-detail.component.scss']
})
export class ShowDetailComponent implements OnInit {
  processDetail:any;
  AnncementId:any;
  constructor(private annoucementService: AnnoucementService , private router: Router, private route: ActivatedRoute,
    private titleService: Title) { }

  ngOnInit() {
    this.setDocTitle('Announcement');
    this.route.paramMap.subscribe(params => {    
        this.AnncementId = params.get('ID');     
    });
    this.annoucementService.getAnnouncement(this.AnncementId)
      .subscribe(
        data => {
          this.processDetail = data.AnnouncementDetail[0];
          console.log(this.processDetail);
        },
        error => {
        }
      );
  
  }
  setDocTitle(title: string) {
    this.titleService.setTitle('Nutrien | ' + title);
 }
}
