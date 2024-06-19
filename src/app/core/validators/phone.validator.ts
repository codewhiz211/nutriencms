import { AbstractControl } from '@angular/forms';

export function phoneNumberValidator(control: AbstractControl) {
    const US_PHONE_REGEXP = /^\([0-9]{3}\) [0-9]{3}-[0-9]{4}$/;
    const PHONE_12_DIGIT_REGEXP = /^\+\d{2} \d{10}$/;
    const PHONE_10_DIGIT_REGEXP = /[0-9]{9}/;
    if (control.value == null ||
        control.value === '' ||
        US_PHONE_REGEXP.test(control.value) ||
        PHONE_12_DIGIT_REGEXP.test(control.value) ||
        PHONE_10_DIGIT_REGEXP.test(control.value)) {
            return null;
    }
    return { invalidPhoneNumber: true };
}
