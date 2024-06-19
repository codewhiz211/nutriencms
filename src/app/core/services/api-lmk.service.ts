import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiLmkService {

  endpoint = environment.Setting.BaseAPIUrlLmk;
  endpointC2m = environment.Setting.C2M_Console_API_URL;
  endpointWf = environment.Setting.BaseAPIUrl;
  constructor(private http: HttpClient) { }

  setHeaders() {
    const accessToken = localStorage.getItem('AccessToken');
    const processName = sessionStorage.getItem('AppName');
    let headers;
    if (processName) {
      headers = new HttpHeaders({ accessToken, processName });
    } else {
      headers = new HttpHeaders({ accessToken });
    }
    return headers;
  }

  settingHeaders(head) {
    const accessToken = localStorage.getItem('AccessToken');
    let headers = new HttpHeaders({ accesstoken: accessToken});
    if (head) {
      for (const i in head) {
        if (head[i] != null) {
          headers = headers.append(i, head[i]);
        }
      }
    }
    return headers;
  }

  setParams(parameters) {
    let params = new HttpParams();
    if (parameters) {
      for (const i in parameters) {
        if (parameters[i] != null) {
          params = params.append(i, parameters[i]);
        }
      }
    }
    return params;
  }

  get(url: string, parameters?: any): Observable<any> {
    const headers = this.setHeaders();
    const params = this.setParams(parameters);

    return this.http.get<any>(`${this.endpoint}/${url}`, { headers, params });
  }

  post(url: string, data?: any, parameters?: any): Observable<any> {
    const headers = this.setHeaders();
    const params = this.setParams(parameters);
    return this.http.post<any>(`${this.endpoint}/${url}`, data, { headers, params });
  }
  postOnWf(url: string, data?: any, parameters?: any): Observable<any> {
    const headers = this.setHeaders();
    const params = this.setParams(parameters);
    return this.http.post<any>(`${this.endpointWf}/${url}`, data, { headers, params });
  }
  postUserDelete(url: string, user, parameters?: any): Observable<any> {
    const accessToken = localStorage.getItem('AccessToken');
    const headers = new HttpHeaders({ AccessToken: accessToken, username: user });
    const params = this.setParams(parameters);
    return this.http.post<any>(`${this.endpointC2m}/${url}`, null, { headers, params });
  }
  postWithHeader(url: string, UserName, Status): Observable<any> {
    const AccessToken = localStorage.getItem('AccessToken');
    return this.http.post<any>(`${this.endpointC2m}/${url}`, { AccessToken, UserName, Status }, {});
  }
  postGetFile(url: string, data: any, resultType: any): Observable<any> {
    const Headers = this.setHeaders();
    return this.http.post<any>(`${this.endpoint}/${url}`, data, { headers: Headers, responseType: resultType });
  }
  delete(url: string, objectId: string): Observable<any> {
    const headers = this.setHeaders();
    if (objectId === null) {
      return this.http.delete(`${this.endpoint}/${url}`, { headers });
    } else {
      return this.http.delete(`${this.endpoint}/${url}/${objectId}`, { headers });
    }
  }
  UploadFile(url: string, formData: FormData): Observable<any> {
    const Headers = this.setHeaders();
    return this.http.post<any>(`${this.endpoint}/${url}`, formData, { headers: Headers });
  }
  //Change for customer master sap data sending
  deleteGrid(url: string): Observable<any> {
    const headers = this.setHeaders();
    return this.http.delete(`${this.endpoint}/${url}`, {headers}).pipe();
  }
}
