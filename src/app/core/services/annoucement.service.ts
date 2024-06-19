import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ApiESaleyardService } from '@app/core';

@Injectable({
  providedIn: 'root'
})
export class AnnoucementService {

  constructor(private api: ApiService,private apiESaleyardService: ApiESaleyardService) { }

  getAnnouncemnetList(bodyData) {
    return this.api.post('listview/GetAnnouncementList', bodyData);
  }

  addAnnouncement(announcementData) {
    return this.api.post(`listview/AnnouncementAddEdit`, announcementData);
  }

  getAnnouncement(id) {
    return this.api.get(`listview/GetAnnouncementDetail/` + '?AnnouncementID=' + id);
  }
  deleteData(id: string) {

    const BodyParam = { ListAnnouncementID: id };
    return this.api.post('listview/AnnouncementDelete', BodyParam);
  }
  getProcessData() {
    return this.api.getProcessData();
  }

  getColumns() {
    return this.api.post('listview/getAnnouncementColumns', null);
  }

  getEndPoint(ExportType: string): string {
    if (ExportType === 'excel') {
      return this.api.endpoint + '/listview/ExportToExlAnncmntData';
    } else {
      return this.api.endpoint + '/listview/ExportToPDFAnncmntData';
    }
  }
  checkAppRole(processName:string){
    return this.apiESaleyardService.post('user/CheckAppRole?processName='+processName);
  }
}
