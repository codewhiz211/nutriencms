import { Injectable } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '@env/environment';
import { formatDate } from '@angular/common';

function padNumber(value: number) {
    if (isNumber(value)) {
        return `0${value}`.slice(-2);
    } else {
        return '';
    }
}

function isNumber(value: any): boolean {
    return !isNaN(toInteger(value));
}

function toInteger(value: any): number {
    return parseInt(`${value}`, 10);
}


@Injectable()
export class NgbDateFRParserFormatter extends NgbDateParserFormatter {
    parse(value: string): NgbDateStruct {
        if (value && environment.Setting.dateFormat == 'dd/MM/yyyy') {
            const dateParts = value.trim().split('/');
            if (dateParts.length === 1 && isNumber(dateParts[0])) {                
                return { day: toInteger(dateParts[0]), month: null, year: null };
            } else if (dateParts.length === 2 && isNumber(dateParts[0]) && isNumber(dateParts[1])) {              
               return {
                day: toInteger(dateParts[0]),
                month: toInteger(dateParts[1]),
                year: null
              };
            } else if (dateParts.length === 3 && isNumber(dateParts[0]) && isNumber(dateParts[1]) && isNumber(dateParts[2])) {
                return {
                    day: toInteger(dateParts[0]),
                    month: toInteger(dateParts[1]),
                    year: toInteger(dateParts[2])
                };
            }
        }
        else if (value && environment.Setting.dateFormat == 'MM/dd/yyyy') {
            const dateParts = value.trim().split('/');
            if (dateParts.length === 1 && isNumber(dateParts[0])) {
                return {year: toInteger(dateParts[0]), month: null, day: null};                
            } else if (dateParts.length === 2 && isNumber(dateParts[0]) && isNumber(dateParts[1])) {
                return {year: toInteger(dateParts[1]), month: toInteger(dateParts[0]), day: null};               
            } else if (dateParts.length === 3 && isNumber(dateParts[0]) && isNumber(dateParts[1]) && isNumber(dateParts[2])) {
                return {year: toInteger(dateParts[2]), month: toInteger(dateParts[0]), day: toInteger(dateParts[1])};                
            }
        }
        return null;
    }

    format(date: NgbDateStruct): string {
        if (date) {
            const bootstrapSucks = `${date.month}/${date.day}/${date.year}`;
            const format = environment.Setting.dateFormat;
            return formatDate(bootstrapSucks, format, 'en-AU');
        } else return '';
    }
}
