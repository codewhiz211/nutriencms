import { Pipe, PipeTransform, Injectable } from '@angular/core';
import { PostalInfo } from '@app/core/services/search.service';

@Pipe({name: 'filter'})
export class FilterPipe implements PipeTransform {
  transform(arr: PostalInfo[], filterString?: string): any {
    if (!arr || !filterString)
      return arr;
    const results: PostalInfo[] = [];
    for (let i = 0; i <= arr.length; i++) {
      for (const prop in arr[i]) {
        if (filterString && arr[i][prop].toString().toLowerCase().includes(filterString.toLowerCase())) {
          if (!results.find(item => item.postcode === arr[i].postcode))
            results.push(arr[i])
        }
      }
    }
    return results;
  }
}

@Pipe({
  name: 'filterCustom'
})
@Injectable()
export class FilterCustomPipe implements PipeTransform {
  transform(items: any[], field : string, value : string): any[] {  
    if (!items) return [];
    if (!value || value.length == 0) return items;
    return items.filter(it => 
    it[field].toLowerCase().indexOf(value.toLowerCase()) !=-1);
  }
}