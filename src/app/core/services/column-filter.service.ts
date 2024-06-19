import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColumnFilterService {
  private columnFilterData: any = {
    TextboxTypes: [
      {
        key: 'CONTAINS',
        value: 'Contains'
      },
      // {
      //   key: 'CONTAINS_CASE_SENSITIVE',
      //   value: 'Contains Case Sensitive'
      // },
      {
        key: 'DOES_NOT_CONTAIN',
        value: 'Does Not Contain'
      },
      // {
      //   key: 'DOES_NOT_CONTAIN_CASE_SENSITIVE',
      //   value: 'Does not contain case sensitive'
      // },
      // {
      //   key: 'Empty',
      //   value: 'Empty'
      // },
      {
        key: 'ENDS_WITH',
        value: 'Ends with'
      },
      // {
      //   key: 'ENDS_WITH_CASE_SENSITIVE',
      //   value: 'Ends with case sensitive'
      // },
      // {
      //   key: 'EQUAL_CASE_SENSITIVE',
      //   value: 'Equal case sensitive'
      // },
      {
        key: 'EQUAL',
        value: 'Equal'
      },
      {
        key: 'STARTS_WITH',
        value: 'Starts With'
      },
      {
        key: 'NOT_NULL',
        value: 'Not Empty '//Entities related Code -Nidhi
      },
      {
        key: 'NULL',
        value: 'Empty'//Entities related Code -Nidhi
      },
      {
        key: 'IN',
        value: 'In'
      },
      {
        key: 'NOT_IN',
        value: 'Not In'
      }
      // {
      //   key: 'STARTS_WITH_CASE_SENSITIVE',
      //   value: 'Starts With Case Sensitive'
      // }
    ],
    DateFieldTypes: [
      {
        key: 'GREATER_THAN',
        value: 'Greater Than'
      },
      {
        key: 'GREATER_THAN_OR_EQUAL',
        value: 'Greater Than or Equal'
      },
      {
        key: 'LESS_THAN',
        value: 'Less Than'
      },
      {
        key: 'LESS_THAN_OR_EQUAL',
        value: 'Less Than or Equal'
      },
      {
        key: 'NOT_EQUAL',
        value: 'Not Equal'
      },
      {
        key: 'EQUAL',
        value: 'Equal'
      },
      {
        key: 'NOT_NULL',
        value: 'Not Null'
      },
      {
        key: 'NULL',
        value: 'Null'
      },
      {
        key: 'IN',
        value: 'In'
      },
      {
        key: 'NOT_IN',
        value: 'Not In'
      },
      {
        key: 'RANGE',
        value: 'Range'
      },
    ]
  };
  public condition: any = {
    TextboxTypes: ['CountryList', 'CreatedBy', 'CurrentStage', 'EmailEditBox', 'ID', 'LastUpdatedBy', 'Paragraph', 'RoleType', 'PhoneTextBox', 'TextArea', 'TextBox', 'UrlTextBox', 'USAStateList'],
    DateFieldTypes: ['DateEditBox', 'DateTimeZone', 'DateWithCalendar', 'CreatedDate', 'CreatedDateTime', 'LastUpdatedDate', 'LastUpdatedDateTime', 'CRTDON', 'MODFON', 'DateTimeBox', 'StaticDateBox'],
    OptionTypes: ['CheckBoxList', 'ColorCodeStatus', 'DropDownList', 'RadioButtonList', 'ListBox', 'MultiSelectDropDownList'],
    dataTypes:['integer', 'integer_validate', 'dollar', 'float']
  };

  constructor() { }

  public GetFilterByDataType(dataType: string, dmoValuedataType?: string): any[] {
    if (this.condition.OptionTypes.includes(dataType)) {
      return [];
    } else if (this.condition.DateFieldTypes.includes(dataType)) {
      return this.columnFilterData.DateFieldTypes;
    } else if (dataType.toLowerCase() === "textbox" && dmoValuedataType!=undefined &&  this.condition.dataTypes.includes(dmoValuedataType.toLowerCase())) { // #CRMI-1036 - Custom column filter, add dropdown options for Dollar, Interger, Decimal etc for numeric datatype.
      return this.columnFilterData.DateFieldTypes;
    }
    else {
      return this.columnFilterData.TextboxTypes;
    }
  }
}
