import { of } from 'rxjs';

export class HeaderMockService {
    getProcess() {
        return of([]);
    }
    CheckNotificationCount() {
        this.getNotificationCount().subscribe(
          result => {

          }
        );
    }

    getNotificationCount() {
        return of([]);
    }
}
