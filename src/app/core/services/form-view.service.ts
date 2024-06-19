import { Injectable } from '@angular/core';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class FormViewService {

  constructor(private api: ApiService) { }

  getBmWfJson(processName: string, viewName: string, transactionId?: string) {
    return this.api.get(`formview/getBmWfJson/${processName}/${viewName}`, {transactionId});
  }
}
