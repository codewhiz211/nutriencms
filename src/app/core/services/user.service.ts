import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user';
import { environment } from '@env/environment';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }
    
    getAll() {
        return this.http.get<User[]>(`${environment.Setting["BaseAPIUrl"]}/users`);
    }

    getById(id: number) {
        return this.http.get(`${environment.Setting["BaseAPIUrl"]}/users/${id}`);
    }

    register(user: User) {
        return this.http.post(`${environment.Setting["BaseAPIUrl"]}/users/register`, user);
    }

    update(user: User) {
        return this.http.put(`${environment.Setting["BaseAPIUrl"]}/users/${user.UserID}`, user);
    }

    delete(id: number) {
        return this.http.delete(`${environment.Setting["BaseAPIUrl"]}/users/${id}`);
    }


    getDataByBody(url: string, data?: any): Observable<any> {
        const webUrl = `${environment.Setting["C2M_Console_API_URL"]}/${url}`;
        var body = JSON.stringify(data);
        return  this.http.post(webUrl, body,{ headers: new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' }) }).pipe(retry(0), catchError(this.handleError));
    }

    async getCascadingDropdown(bodyData?: any)  {
        const webUrl = `${environment.Setting["BaseAPIUrlLmk"]}/${"listview/getprocessdata"}`;
        const body=JSON.stringify(bodyData);
        const httpAllOptions = { headers: new HttpHeaders({ "AccessToken":localStorage.getItem('AccessToken'),"Content-Type":"application/json",'Accept': 'application/json', }) }
        return await this.http.post(webUrl, body,httpAllOptions).toPromise().catch(this.handleError);
    }


    AddUpdateUser(url: string, data?: any): Observable<any> {
        const webUrl = `${environment.Setting["BaseAPIUrlLmk"]}/${url}`;
        const httpAllOptions = { headers: new HttpHeaders({ "AccessToken":localStorage.getItem('AccessToken'),"Content-Type":"application/json" }) }
        return  this.http.post(webUrl,data,httpAllOptions).pipe(retry(0), catchError(this.handleError));
    }

    async GetRoleList(url: string, data?: any) {
        const webUrl = `${environment.Setting["C2M_Console_API_URL"]}/${url}`;
        var body = JSON.stringify(data);
        return await  this.http.post(webUrl, body,{ headers: new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' }) }).toPromise().catch(this.handleError);
    }

    async GetUserDetails(url: string,data?: any) {
        const webUrl = `${environment.Setting["BaseAPIUrlLmk"]}/${url}`;
        const body=JSON.stringify(data);
        const httpAllOptions = { headers: new HttpHeaders({ "AccessToken":localStorage.getItem('AccessToken'),"Content-Type":"application/json" }) }
        return await this.http.post(webUrl,body,httpAllOptions).toPromise().catch(this.handleError);
    }

    async GetDropdownDetails(url: string, data?: any) {
        const webUrl = `${environment.Setting["BaseAPIUrlLmk"]}/${url}`;
        const body = JSON.stringify(data);
        const httpAllOptions = { headers: new HttpHeaders({ "AccessToken": localStorage.getItem('AccessToken'), "Content-Type": "application/json" }) }
        return await this.http.post(webUrl,body,httpAllOptions).toPromise().catch(this.handleError);
    }

    async UploadFile(url: string, formData: FormData) {
        const webUrl = `${environment.Setting["C2M_Console_API_URL"]}/${url}`;
        return await this.http.post(webUrl, formData).pipe(retry(0), catchError(this.handleError)).toPromise();
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
}