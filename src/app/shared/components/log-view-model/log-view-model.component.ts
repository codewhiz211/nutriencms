import { Component, OnInit,  Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApplicationService, IHeaderMap } from '@app/core';
import { GenericGirdService } from '@app/core/services/generic-gird.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { formatDate } from '@angular/common';
import { first  } from 'rxjs/operators';
import { UserDetail } from '@app/core/models/user-detail';
import { environment } from '@env/environment';

@Component({
  selector: 'app-log-view-model',
  templateUrl: './log-view-model.component.html',
  styleUrls: ['./log-view-model.component.scss']
})
export class LogViewModelComponent implements OnInit {

  @Input() bmoGuid: string;
  @Input() trnsctnId: any;

  lodData: any;
  mailData: any;

  constructor(private applicationService: ApplicationService,
              private route: ActivatedRoute,
              public gService: GenericGirdService,
              private modalService: NgbModal,
              private userDetail: UserDetail) { }

  ngOnInit() {
  }
  pageChange(event) {
    console.log(event);
    this.getLogData(event);
  }
  actionClick(event, mailView) {
    console.log(event);
    this.mailData = event;
    const re = /\;/gi;
    this.mailData.Mail_To = this.mailData.Mail_To.replace(re, '; ');
    this.modalService.open(mailView, { size: 'lg' });
  }


  getLogData(data) {
    switch (data.tableName) {
      case 'activitylog':
        this.applicationService.getLogData(null, null, this.trnsctnId, data.pageSize, data.currentPage)
          .pipe(first())
          .subscribe(
            Result => {
              this.gService.data.activitylog.gridData = Result.log;
            }
          );

        break;
      case 'history':
        this.applicationService.getHistoryLogData(null, null, this.trnsctnId, data.pageSize, data.currentPage)
          .pipe(first())
          .subscribe(
            Result => {
              this.gService.data.history.gridData = Result.json;
            }
          );

        break;
      case 'notification':
        this.applicationService.getNotificationLogData(null, null, this.trnsctnId, data.pageSize, data.currentPage)
          .pipe(first())
          .subscribe(
            Result => {
              this.gService.data.notification.gridData = Result.log;
            }
          );
        break;
      default:
        break;
    }
  }
  convertToLocalDataAndTime(value, format = environment.Setting.dateTimeFormatNoSeconds) {
    try {
      const zone = this.userDetail.TimeZone;
      const d = new Date(value); // val is in UTC
      const localOffset = zone * 60000;
      const localTime = d.getTime() - localOffset;
      d.setTime(localTime);
      return formatDate(d, format, 'en-US');
    } catch (error) {
      console.log('Datevalue-' + value + 'error' + error);
      return '';
    }
  }
}
