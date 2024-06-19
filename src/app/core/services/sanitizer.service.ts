import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SanitizerService {
  constructor(private sanitizer: DomSanitizer) {}

  public sanitize(item: any) {
    if (typeof item === 'string') {
      return this._sanitizeString(item);
    } else if (typeof item === 'object') {
      return this._sanitizeObject(item);
    }
    return item;
  }

  private _sanitizeObject(obj: {[key: string]: any}) {
    
    const sanitizedObj = {};
    for (const prop in obj) {
      if (typeof obj[prop] === 'string')
        sanitizedObj[prop] = this._sanitizeString(obj[prop]);
      else 
        sanitizedObj[prop] = obj[prop];
    }
    return sanitizedObj;
  }

  private _sanitizeString(str: string) {
    if (str.includes('localStorage') || str.includes('document.')) {
      str = str.replace(/localStorage/, '');
      str = str.replace(/document./, '');
    }
    return this.sanitizer.sanitize(SecurityContext.HTML, str)
  }
}