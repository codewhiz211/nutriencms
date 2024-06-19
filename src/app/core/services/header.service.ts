import { Injectable, Output, EventEmitter, Directive } from '@angular/core';
import { ApiService } from './api.service';
import { of } from 'rxjs';
@Directive()
@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  Count: number;
  constructor(private api: ApiService) { }

  @Output() change: EventEmitter<number> = new EventEmitter();

  get CountValue(): number {
    return parseInt(localStorage.getItem('NotificationCount'));
  }
  CheckNotificationCount() {
    this.getNotificationCount().subscribe(
      Result => {
        if(Result){
          localStorage.setItem('NotificationCount', Result);
          this.Count = Result;
          this.change.emit(Result);
        }else{
          return of([]);
        }       
      }
    )
  }

  getNotificationCount() {
    return this.api.get('application/getAnnouncementNotificationCount?processName=' + sessionStorage.AppName);
  }

  getNotification(flag, pageFrom) {
    return this.api.get('application/getAnnouncements?processName=' + sessionStorage.AppName + '&flag=' + flag +
     '&pageSize=10&pageFrom=' + pageFrom);
  }
  readNotification(Key: string) {
    this.Count = this.Count - 1;
    localStorage.setItem('NotificationCount', this.Count.toString());
    return this.api.deleteGrid('application/markAsRead?processName=' + sessionStorage.AppName + '&announcementIDs=' + Key);
  }
}
