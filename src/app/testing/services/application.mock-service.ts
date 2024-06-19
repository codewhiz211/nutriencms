import { of } from 'rxjs';

export class ApplicationMockService {
    getProcess() {
        return of([]);
    }

    getBatchUpdateDetails(processName: string) {
        return of({});
    }

    batchUpdate(data, processName: string) {
        return of({});
    }

    insertApplication(data) {
        return of({success: true});
      }
}
