import { of } from 'rxjs';
import { FormGroup } from '@angular/forms';


export class DmoControlMockService {


    public toAdminViewFormGroup(dmos: any[], data: any = {}) {
        const group: any = {};


        return new FormGroup(group);
    }

    public toFormViewGroup(dmos: any[]) {
        const group: any = {};

        return new FormGroup(group);
    }

    public sanitizeFormValue(dmos: any[], formValue: any = {}) {

        return formValue;
    }

    GetCountry() {
        return of({});
    }

    GetState() {
        return of({});
    }

    GetDDLOption(
        dataSrc: string,
        processName: string,
        transactionId: string,
        identifierName: string,
        parentvalue: string,
        timeZone: string,
        userId: string,
        language: string,
        selecedValue: string
    ) {
        return of({});
    }
    GetPlasmaId(dmoName: string) {
        return of({});
    }
    UploadFile(url: string, formData: FormData) {
        return of({});
    }
    DeleteFile(url: string, formData: FormData) {
        return of({});
    }
    downloadfile(url: string, formData: FormData) {
        return of({});
    }
}
