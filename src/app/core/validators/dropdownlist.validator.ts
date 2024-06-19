import { AbstractControl } from '@angular/forms';

export function DropdownlistValidator(control: AbstractControl) {
    if (control.value !== null && control.value !== '' && control.value!=='Select...') {
        return null;
    }
    return { invalidSelection: true };
}