import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { catchError, retry } from 'rxjs/operators';
import { UserDetail } from '../models/user-detail';

@Injectable({
  providedIn: 'root'
})
export class ApiESaleyardService {
  eSaleyardendpoint = environment.Setting.eSaleyardApiUrl;
  endpoint = environment.Setting.BaseAPIUrlLmk;
  endpointC2m = environment.Setting.C2M_Console_API_URL;
  userByRoleApiKey =  environment.Setting.userByRoleApiKey;
  isBuyerAccess: boolean = false;
  constructor(private http: HttpClient,private userDetail: UserDetail) { }

  get hasBuyerFullAccess(){
    return this.checkBuyerRolesAccess();
  }

  setHeaders(head?: any) {
    const accessToken = localStorage.getItem('AccessToken');
    const processName = sessionStorage.getItem('AppName');
    const headerParams: any = {};
    if (processName) {
      headerParams.processName = processName;
    }
    if (accessToken) {
      headerParams.accessToken = accessToken;
    }

    if (head) {
      for (const i in head) {
        if (head[i] != null) {
          headerParams[i] = head[i];
        }
      }
    }

    const headers = new HttpHeaders(headerParams);
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

  getWithoutToken(url: string, parameters?: any): Observable<any> {
    const params = this.setParams(parameters);
    return this.http.get<any>(`${this.endpoint}/${url}`, { params });
  }

  post(url: string, data?: any, parameters?: any): Observable<any> {
    const headers = this.setHeaders();
    const params = this.setParams(parameters);
    return this.http.post<any>(`${this.endpoint}/${url}`, data, { headers, params });
  }

  postESaleyardapi(url: string, data?: any, parameters?: any): Observable<any> {
    const headers = this.setHeaders();
    const params = this.setParams(parameters);
    return this.http.post<any>(`${this.eSaleyardendpoint}/${url}`, data, { headers, params });
  }

  postWithoutToken(url: string, data: any, parameters?: any): Observable<any> {
    const params = this.setParams(parameters);
    return this.http.post<any>(`${this.endpoint}/${url}`, data, { params });
  }

  postUserDelete(url: string, user, apiEndpoint): Observable<any> {
    const accessToken = localStorage.getItem('AccessToken');
    const headers = new HttpHeaders({ AccessToken: accessToken, username: user, apiEndpoint:apiEndpoint });    
    return this.http.post<any>(`${this.endpoint}/${url}`,{body:null}, { headers });
  }
  postWithHeader(url: string, UserName, Status, apiEndpoint): Observable<any> {
      const AccessToken = localStorage.getItem('AccessToken');   
      const headers = new HttpHeaders({ AccessToken: AccessToken, username: UserName, apiEndpoint: apiEndpoint });
      return this.http.post<any>(`${this.endpoint}/${url}`, { AccessToken, UserName, Status }, { headers:  headers});
  }
  postGetFile(url: string, data: any, resultType: any, header?: any): Observable<any> {
    const Headers = this.setHeaders(header);
    return this.http.post<any>(`${this.endpoint}/${url}`, data, { headers: Headers, responseType: resultType });
  }
  postGetFileWithoutToken(url: string, data: any, resultType: any, header?: any): Observable<any> {
    const headers = new HttpHeaders(header);
    return this.http.post<any>(`${this.endpoint}/${url}`, data, { headers, responseType: resultType });
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

 //add by sanju  on 11-Nov-2019
  postC2M(url: string, apiEndpoint: string, data?: any): Observable<any> {
    const weburl = `${this.endpoint}/${url}`;     
      const accessToken = localStorage.getItem('AccessToken');
      const headerParams: any = {};
      if (accessToken) {
          headerParams.accessToken = accessToken;
      }
      headerParams.apiEndpoint = apiEndpoint;
      const Headers = new HttpHeaders(headerParams);
    //var body = JSON.parse(data);
    return this.http.post<any>(weburl, data, { headers: Headers });
  }

   //add by sanju  on 11-Nov-2019  
    async GetExportData(url: string, apiEndpoint: string, data?: any) {
        const weburl = `${this.endpoint}/${url}`;
        const accessToken = localStorage.getItem('AccessToken');
        const headerParams: any = {};
        if (accessToken) {
            headerParams.accessToken = accessToken;
        }
        headerParams.apiEndpoint = apiEndpoint;
        const Headers = new HttpHeaders(headerParams);
        // var body = JSON.stringify(data);
        return await this.http.post(weburl, data, { headers: Headers }).toPromise().catch(this.handleError);
    }
//add by Biresh  on 26-June-2020 - #966
postC2MGetUser(url: string, data?: any): Observable<any> {
  const AccessToken = localStorage.getItem('AccessToken');
  const apiKey = `${this.userByRoleApiKey}`;
  const weburl=`${this.endpoint }/${url}`;
  const apiEndpoint = 'api/GetUserDetailByRoles';
  //var body = JSON.stringify(data);

  const headers = new HttpHeaders({ 
  'apiEndpoint':apiEndpoint,
  'accessToken': AccessToken,'apikey':apiKey});

  return this.http.post(weburl, data,{ headers}).pipe(retry(0), catchError(this.handleError));
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


checkBuyerRolesAccess(){
  const userRoles = this.userDetail.ListRole;
     const buyerRoles = environment.Setting.buyerFARoles.split(',');
     if(userRoles.length>0){
       for (const role of buyerRoles) {
         if (userRoles.includes(role)) {
            this.isBuyerAccess = true;
           break;
         }
       }
       return this.isBuyerAccess;
     }
}

}
