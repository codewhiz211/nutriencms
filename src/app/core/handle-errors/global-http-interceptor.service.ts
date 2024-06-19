import { Injectable, Injector, NgZone } from '@angular/core';
import { HttpEvent, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { environment } from '@env/environment';
import { isNullOrUndefined } from 'util';

@Injectable({
    providedIn: 'root'
})
export class GlobalHttpInterceptorService {

    constructor(
        private router: Router,
        private zone: NgZone,
        private injector: Injector) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        let nextReq;
        if (!(req.url.includes(environment.Setting.C2M_Console_API_URL))) {

            nextReq = req.clone({
                headers: req.headers.set('Cache-Control', 'no-cache')
                    .set('Pragma', 'no-cache')
            });
        }
        else {

            nextReq = req;
        }

        return next.handle(nextReq)
            .pipe(
                catchError((error: HttpErrorResponse) => {                    
                    const toastr = this.injector.get(ToastrService);
                    if (error instanceof HttpErrorResponse && error.error instanceof Blob && error.error.type === "application/json") {                        
                        return new Promise<any>((resolve, reject) => {
                            let reader = new FileReader();
                            reader.onload = (e: Event) => {
                                try {
                                    const errmsg = JSON.parse((<any>e.target).result);
                                    reject(new HttpErrorResponse({
                                        error: errmsg,
                                        headers: error.headers,
                                        status: error.status,
                                        statusText: error.statusText,
                                        url: error.url
                                    }));
                                    toastr.error(errmsg, 'Bad Request', { timeOut: 10000 });                                   
                                } catch (e) {
                                    reject(error);
                                }
                            };
                            reader.onerror = (e) => {
                                reject(error);
                            };
                            reader.readAsText(error.error);
                        });
                    }
                    if (error.error instanceof ErrorEvent) {
                        // client-side error
                        console.log(`Error: ${error.error.message}`);
                    } else {
                        
                        // server-side error                       
                        if (!navigator.onLine) {
                            // No Internet connection
                            this.zone.run(() => {
                                toastr.warning('No internet Connection.', 'Warning', { timeOut: 10000 });
                            });
                        } else if (error.status === 500) { // Internal Server Error                            
                            if (error.error && error.error.message === 'Record already exists in Active State') {
                                this.zone.run(() => {
                                    toastr.warning(error.error.message);
                                });
                            } else if (error.error && error.error.message === 'Record already exists') {
                                this.zone.run(() => {
                                    toastr.warning(error.error.message);
                                });
                            } else if (error.error && error.error.message === 'Your account is inactive.') {
                                this.zone.run(() => {
                                    toastr.warning('Account Invalid, Please contact your local Nutrien branch for more information.');
                                });
                            } else {
                                this.zone.run(() => {
                                    toastr.error(error.error ? error.error.message : error.message, 'Internal Server Error', { timeOut: 10000 });
                                });
                            }
                        } else if (error.status === 400) { // Bad Request
                            this.zone.run(() => {                                
                               // this.router.navigate(['/auth/error']);                             

                                if (error.error.message !== null && error.error.message !== undefined && error.error.message.includes('Unauthorized Access')) {
                                    this.router.navigate(['/auth/error']);
                                }
                                else {
                                    toastr.error(error.error ? error.error.message : error.message, 'Bad Request', { timeOut: 10000 });
                                }

                            });
                        } else if (error.status === 401) { // Not Authorized devops
                            this.zone.run(() => {
                                toastr.error(error.error ? error.error.message : error.message, 'Not Authorized', { timeOut: 10000 });
                                this.router.navigate(['/auth/login']);
                            });
                        } else if (error.status === 403) { // Not Authorized
                            this.zone.run(() => {
                                if (typeof error.error == 'string' && error.error === 'You do not have permissions to delete the records.') {
                                    toastr.error('You do not have permissions to delete records in this section.', 'Not Authorized', { timeOut: 10000 });
                                } else {
                                    toastr.error(typeof error.error == 'string' ? error.error : error.error.message, 'Not Authorized', { timeOut: 10000 });
                                }
                            });
                        } else {
                            this.zone.run(() => {
                                toastr.error(error.error ? error.error.message : error.message, 'Error', { timeOut: 10000 });
                            });
                        }
                    }

                    return throwError(error);
                })
            );
    }
}
