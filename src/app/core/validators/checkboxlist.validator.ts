import { AbstractControl, FormArray } from '@angular/forms';

export function CheckBoxListValidator(formArray: FormArray) {
    const selectedCount = formArray.controls
        .map(control => control.value)
        .reduce((prev, next) => next ? prev + next : prev, 0);

    return selectedCount >= 1 ? null : { notSelected: true };


    return { invalidSelection: true };
}