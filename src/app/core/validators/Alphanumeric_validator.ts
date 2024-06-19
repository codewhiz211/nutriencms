import { AbstractControl } from '@angular/forms';

export function Alphanumeric_validator(control: AbstractControl) {

    const Exp =  new RegExp(/^[a-zA-Z0-9]*$/);
    if (control.value == null ||
        control.value === '' ||
        Exp.test(control.value)) {
            return null;
    }
    return { invalidstring: true };
}
