import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchColumn'
})
export class SearchColumnPipe implements PipeTransform {

  transform(value: any, searchText: any,key:any): any {
    if(searchText == null) return value;
    return value.filter((item)=>{
      let txt = String(item[key]);
      return txt.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
    })
  }

}

@Pipe({
  name: 'searchDMO'
})
export class SearchDMOPipe implements PipeTransform {

  transform(value: any, searchText1: any,key:any): any {
    if(searchText1 == null) return value;
    return value.filter((item)=>{
      let txt = String(item[key]);
      return txt.toLowerCase().indexOf(searchText1.toLowerCase()) > -1;
    })
  }

}



@Pipe({
    name: 'striphtml'
})
export class StripHtmlPipe implements PipeTransform {
    transform(value: string): any {
        return value.replace(/<.*?>/g, ''); // replace tags
    }
}

@Pipe({
  name: 'searchRow',
  pure: false
})
export class SearchRowPipe implements PipeTransform {
  transform(arr: any[] = [], filterString: string, key: string = 'DataValue'): any[] {
    if (!arr || !filterString)
      return arr;
    const results: any[] = [];
    if (arr.length > 0) {
      for (let i = 0; i <= arr.length; i++) {
        // console.log(arr[i]);
        if (filterString && arr[i][key].toString().toLowerCase().includes(filterString.toLowerCase()))
            results.push(arr[i])
      }
    }
    return results;
  }
}


@Pipe({
    name: 'myfilter'
})
export class ListFilterPipe implements PipeTransform {

  transform(items: any[], searchText: string, fieldName: string, fieldName1: string ): any[] {  
     if (!items) { return []; }

    searchText = searchText.toLowerCase();  
   return items.filter(DMOG => DMOG.DMOGGUID.toLowerCase() === searchText);
 }
}

