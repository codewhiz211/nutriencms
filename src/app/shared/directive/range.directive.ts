import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appRange]'
})
export class RangeDirective {

   private regex: RegExp = new RegExp('^[0-9]*[.]?[0-9]{0,6}?-?[0-9]*[.]?[0-9]{0,6}?$');
   
   private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
 
   constructor(private el: ElementRef) {}

   @HostListener('keydown', ['$event'])
   onKeyDown(event: KeyboardEvent) {
     if (this.specialKeys.indexOf(event.key) !== -1) {
       return;
     }
     const current: string = this.el.nativeElement.value;
     const position = this.el.nativeElement.selectionStart;
     const next: string = [current.slice(0, position), event.key == 'Decimal' ? '.' : event.key, current.slice(position)].join('');
     if (next && !String(next).match(this.regex)) {
       event.preventDefault();
     }
   }

}