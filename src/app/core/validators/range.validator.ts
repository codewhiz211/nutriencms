import { ValidationErrors, AbstractControl } from '@angular/forms';

export function rangeValidator(control: AbstractControl): ValidationErrors | null {      
  // const fromControl = form.get(dmo.Name + 'From');
  // const toControl = form.get(dmo.Name + 'To');

  // const from = +fromControl.value;
  // const to = +toControl.value;

  // if (from !== null && to !== null && from <= to) {
  //   fromControl.setErrors(true);
  //   toControl.setErrors(true);
  //   return null;
  // }

  // fromControl.setErrors({range: true});
  // toControl.setErrors({range: true});
  const ageval = control.value;
  const decimalregex = new RegExp('^[0-9]{0,2}([.][1-9]{1,1})?$');
  const numberregex = new RegExp('^[0-9]{0,2}?$');
  if (ageval === undefined || ageval === null || ageval === '') {
    return null;
  }
  if (ageval !== null && ageval.includes('-')) {
    var range = ageval.split('-');
    if (range[0] && range[0].includes('.')) {
      if(!decimalregex.test(range[0])){
        return { invalidRange: true };
      }
    }else{
      if(range[0] && !numberregex.test(range[0])){
        return { invalidRange: true };
       }
    } if (range[1] !== '' && range[1].includes('.')) {
      if(!decimalregex.test(range[1])){
        return { invalidRange: true };
      }
    }else{
      if(range[1] && !numberregex.test(range[1])){
        return { invalidRange: true };
       }
    }
    if (range[0] !== '' && range[1] !== '') {
      const from = parseFloat(range[0]);
      const to = parseFloat(range[1]);

      if (from > to) {
        return { invalidRange: true };
      }
      if (from === 0 && to === 0) {
        return { invalidRange: true };
      }
    }
    else {
      return { invalidRange: true };
    }
  }  
  else if (ageval.includes('.')) {     
    if(!decimalregex.test(ageval)){
      return { invalidRange: true };
    }
  }
  else if (parseFloat(ageval) === 0 || parseFloat(ageval) < 0 || parseFloat(ageval) < 1) {
    return { invalidRange: true };
  }
  else if (!ageval.includes('.') && !ageval.includes('-')) {
    if(ageval && !numberregex.test(ageval)){
      return { invalidRange: true };
     }
  }
  return null;
}