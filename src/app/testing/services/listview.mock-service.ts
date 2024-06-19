import { of } from 'rxjs';

export class ListviewService {

  GridConfig(objGridData) {
    return of({});
  }

  GridData(userData: any) {
    return of({});
  }

  DMOData(ProcessName: string, dmoName: string) {
    return of({});
  }

  sendGridConfig(gridData: any) {
    return of({});
  }

  stateList(processData) {
    return of({});
  }

  stageList(processData) {
    return of({});
  }

  dmoList(processData) {
    return of({});
  }
  dmoListOrderByDMO(processData) {
    return of({});
  }

  deleteGridData(id: string) {
    return of({});
  }
  ExportToExcel(userData: any) {
    return of({});
  }
  ExportToPDF(userData: any) {
    return of({});
  }
  deleteGridConfigData(configData) {
    return of({});
  }

  // listview/exportToExcel

  noteMessage(id) {
    return of({});
  }
  sendNoteMessage(message) {
    return of({});
  }

  userList(userData) {
    return of({});
  }
}
