import { AbstractControl, ValidationErrors } from "@angular/forms"

export const PasswordStrengthValidator = function (control: AbstractControl): ValidationErrors | null {

  let value: string = control.value || '';

  if (!value) {
    return null
  }
  let specialCharacters = /^(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,50}$/
  if (specialCharacters.test(value) === false) {
    return { passwordStrength: true };
  }
  return null;
}