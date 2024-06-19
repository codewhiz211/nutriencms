import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class QuickMindService {

  searchtxt: string;
  constructor(private api: ApiService) { }

  getQuickMindSearch(searchText) {
    return this.api.get('quickmind/getsearchqmind?processName=' + localStorage.getItem('quickMindAppName') + '&searchText=' + searchText);
  }
  /**
   * add new reoced or updete existing record.
   * @param data data is a model for save or update on remote.
   * @param processName processName in which data you want to save.
   */
  AddOrUpdate(data, processName) {
    return this.api.post('quickmind/saveqmind?processName=' + processName, data);
  }
}
