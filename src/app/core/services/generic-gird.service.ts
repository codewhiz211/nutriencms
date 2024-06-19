import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class GenericGirdService {

  config: any = {
    header: {
      columns: {},
      action: false,
    },
    paging: true
  };

  data: any = {};

  constructor(private api: ApiService) {}


  getBidsColumns() {
    return this.api.postForLMK('bidding/getBidsColumns', null);
  }

  getEndPoint(ExportType: string): string {
    if (ExportType === 'excel') {
      return this.api.LMKendpoint + '/bidding/exportToExcelBidsHistory';
    } else {
      return this.api.LMKendpoint + '/bidding/exportToPDFBidsHistory';
    }
  }
}
