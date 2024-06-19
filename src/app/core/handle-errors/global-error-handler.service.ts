import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import * as rg4js from 'raygun4js';
import { environment } from '@env/environment';

import { MessageService } from '../services/message.service';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {

    constructor(
        private zone: NgZone,
        private injector: Injector) {
    }

    handleError(error: Error | HttpErrorResponse) {
        const messageService = this.injector.get(MessageService);

        const chunkFailedMessage = /Loading chunk [\d]+ failed/;

        // force app to reload if chunks failed error occurs
        if (chunkFailedMessage.test(error.message)) {
            window.location.reload();
        } else {
            if (error instanceof Error) {
                if (environment.production) {
                    // If production environment, send errors to Raygun Error Monitoring
                    rg4js('send', {error});
                } else {
                    // If development environment, just show the error message to developers
                    this.zone.run(() => {
                        messageService.showMessage('Fail', {body: error.message});
                    });
                }
            }
        }
        // Log the error anyway - devops job
        console.error(error);

    }

}
