import { AbstractControl, ValidatorFn } from '@angular/forms';

export function existsValidator(control: AbstractControl, dmo: any, found: boolean): ValidatorFn | null {
    if (found) {
        control.clearValidators();
        control.setErrors(null);
        return null;
    } else {
        control.setErrors({notExists: true, message: `${dmo.DisplayName} does not exist`});    
    }
 }