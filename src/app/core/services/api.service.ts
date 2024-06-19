import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  endpoint = environment.Setting.BaseAPIUrl;
  C2MIceAPIUrl = environment.Setting.C2MIceAPIUrl;
  signoutendpoint = environment.Setting.C2M_Console_API_URL;
  LMKendpoint = environment.Setting.BaseAPIUrlLmk;
  constructor(private http: HttpClient) { }

  setHeaders(parameters?: any) {    
    let processName = null;
    if (parameters && parameters.ProcessName) {
      processName = parameters.ProcessName;
    } else {
      processName = sessionStorage.getItem('AppName');
    }

    let headers;
    const accessToken = localStorage.getItem('AccessToken');
    if (processName != null && accessToken !== null) {
      headers = new HttpHeaders({ accessToken, processName });
    } 
    else{
      //resolved Raygun Error
      if(accessToken !== null){
        headers = new HttpHeaders({ accessToken });
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
    const headers = this.setHeaders(parameters);
    const params = this.setParams(parameters);
    return this.http.get<any>(`${this.endpoint}/${url}`, { headers, params });
  }

 async postAdvanceSearch(url: string, data: any,  parameters?: any){    
    const httpAllOptions = { headers: new HttpHeaders({ "AccessToken":localStorage.getItem('AccessToken'),"Content-Type":"application/json" }) }     
    return await  this.http.post(`${url}`, data, httpAllOptions).toPromise().catch(this.handleError);
  }

  handleError(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
        //client side error
        errorMessage = `Error: ${error.error.message}`;
    }
    else {
        // server-side error
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    //window.alert(errorMessage);
    return throwError(errorMessage);
}

  post(url: string, data: any, parameters?: any): Observable<any> {
    const headers = this.setHeaders(data);
    const params = this.setParams(parameters);
    return this.http.post<any>(`${this.endpoint}/${url}`, data, { headers, params });
  }
  post_ice(url: string, data: any, apiEndpoint:string): Observable<any> {
    return this.http.post(`${this.LMKendpoint}/${url}`, data, {headers: {apiEndpoint}});
  }

  postForLMK(url: string, data: any, parameters?: any): Observable<any> {
    const headers = this.setHeaders(data);
    const params = this.setParams(parameters);
    return this.http.post<any>(`${this.LMKendpoint}/${url}`, data, { headers, params });
  }

  postSignout(url: string, data: any, parameters?: any): Observable<any> {
    const headers = this.setHeaders(data);
    const params = this.setParams(parameters);
    return this.http.post<any>(`${this.signoutendpoint}/${url}`, data, { headers, params });
  }

  postGetFile(url: string, data: any, resultType: any): Observable<any> {    
    const Headers = this.setHeaders();
    return this.http.post<any>(`${this.endpoint}/${url}`, data, { headers: Headers, responseType: resultType });
  }

  postGetFileforSignature(url: string, data: any, resultType: any): Observable<any> {      
    return this.http.post<any>(`${this.LMKendpoint}/${url}`, data, {responseType: resultType });
  }

  postGetFileWithEndPoint(url: string, data: any, resultType: any): Observable<any> {
    const Headers = this.setHeaders();
    return this.http.post<any>(url, data, { headers: Headers, responseType: resultType });
  }
  put(url: string, data: any): Observable<any> {
    const headers = this.setHeaders();
    return this.http.put<any>(`${this.endpoint}/${url}`, data, {headers});
  }

  update(url: string, objectId: string, data: any): Observable<any> {
    const headers = this.setHeaders();
    return this.http.patch<any>(`${this.endpoint}/${url}/${objectId}`, data, {headers});
  }

  delete(url: string, objectId: string): Observable<any> {
    const headers = this.setHeaders();
    return this.http.delete(`${this.endpoint}/${url}/${objectId}`, {headers});
  }
  deleteGrid(url: string): Observable<any> {
    const headers = this.setHeaders();
    return this.http.delete(`${this.endpoint}/${url}`, {headers}).pipe();
  }
  UploadFile(url: string, formData: FormData): Observable<any> {
    let query = {
      ProcessName: formData.get('processName')
    }
    const Headers = this.setHeaders(query);
    return this.http.post<any>(`${this.endpoint}/${url}`, formData, { headers: Headers });
  }

  DeleteFile(url: string, formData: FormData): Observable<any> {
    const Headers = this.setHeaders();
    return this.http.post<any>(`${this.endpoint}/${url}`, formData, { headers: Headers });
  }

  downloadfile(url: string, formData: FormData, resultType: any): Observable<any> {
    const Headers = this.setHeaders();
    //Headers['Content-Type'] = 'application/octet-stream';

    return this.http.post<any>(`${this.endpoint}/${url}`, formData, { headers: Headers, responseType: resultType });
  }
  getProcessData() {
    return this.get(`application/processList`);
  }
  GetDataFromIceAPI(url: string, resultType: any): Observable<any> {
    return this.http.get<any>(`${this.C2MIceAPIUrl}/${url}`, { responseType: resultType });
  }
  user_post(url: string, data: any): Observable<any> {
    return this.http.post(`${this.signoutendpoint}/${url}`, data);
  }
}
