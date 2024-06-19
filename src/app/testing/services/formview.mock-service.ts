import { of } from 'rxjs';

export class FormViewMockService {

    getBmWfJson(processName: string, transactionId?: string) {
      return of({});
    }
}
