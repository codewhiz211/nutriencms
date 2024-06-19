import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ApiESaleyardService } from './api-e-saleyard.service';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  constructor(private api: ApiESaleyardService) { }

  getUserList(bodyData) {
    return this.api.post('listview/getUsers', bodyData);
  }
  deleteUser(userName: string) {
    const apiEndpoint = 'api/DeleteUser';
    return this.api.postUserDelete('user/icewebapi', userName, apiEndpoint);
  }
  ChangeUserStatus(UserName, Status) {
    const apiEndpoint = 'api/SetUserStatus';
    return this.api.postWithHeader('user/icewebapi', UserName, Status, apiEndpoint);
  }
  getColumns() {
    return this.api.post('listview/getColumns', null);
  }

  getUserColumns() {
    return this.api.post('user/getusercolumns', null);
  }

  getUserEndPoint(ExportType: string): string {
    if (ExportType === 'excel') {
   return this.api.endpoint + '/user/exportToExcel';
    } else {
   return this.api.endpoint + '/user/exportToPDF';
    }
  }

  getEndPoint(ExportType: string): string {
    if (ExportType === 'excel') {
      return this.api.endpoint + '/listview/exportToExcel';
    } else {
      return this.api.endpoint + '/listview/exportToPDF';
    }
  }
  getUserGridList(bodyData) {
    //const apiEndpoint = 'api/GetAllManageUserList';
    const apiEndpoint ='api/GetAllManageUserListByApikey';
    return this.api.postC2M('user/icewebapi', apiEndpoint, bodyData);
  }

  // add by sanju for get all data for export 
  GetExportData(bodyData) {
    const apiEndpoint = 'api/GetAllManageUserList';
    return this.api.GetExportData('user/icewebapi', apiEndpoint,  bodyData);
  }
  validatePhone(event: any) {   
    var specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'Del', 'Delete'];
    if (specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    var val = event.target.value + event.key;
    const regex = '^[0-9+]*$';
    if (!val.match(regex)) {
      event.preventDefault();
    }
  }
  checkBuyerRole(processName:string){
      return this.api.post('user/CheckAppRole?processName='+processName);
  }
}
