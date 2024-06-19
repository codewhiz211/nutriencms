export interface IGridFilter {
    DataField: string;
    FirstCondtion: string;
    FirstValue: string;
    LogicalConditon: string;
    SecondCondtion: string;
    SecondValue: string;
}

export interface IGridData {
    ProcessName: string;
    GridGuid: string;
    ViewName: string;
    SortColumn: string;
    SortOrder: string;
    PageNumber: string;
    PageSize: string;
    TimeZone: string;
    ColumnList: string;
    LstGridFilter: IGridFilter[];
}

export class GridConfig implements IGridData {
    ProcessName: string;
    GridGuid: string;
    ViewName: string;
    SortColumn: string;
    SortOrder: string;
    PageNumber: string;
    PageSize: string;
    TimeZone: any;
    ColumnList: string;
    LstGridFilter: IGridFilter[];
    ShowSelectAll: boolean;
    PageCount: any;
    HasGlobalSearch: boolean;
    IsSubProcess: boolean;
    ParentTransactionId: string;
    ParentDmoValue: string;
    ChildDmoGuid: string;
    SubProcessChild: any;//Entity related code- Nidhi
    ParentFormDmoValue:any;//Entity related code- Nidhi
    HideDeleteActionIcon: boolean;
    HideDisplayName: boolean;
    ShowBulkUpdateButton: boolean;
    CanAddNewRow: boolean;
    TriggerName: string;
    canInlineEdit: boolean;
    DmoColumnName: string;
    IsOtherAPICall: boolean;
    IsAddCopyRecPermissionChildPro:boolean;
}

export interface IHeaderMap {
    config: {
        header: {
            columns: any[];
            action: any;
            columnFilter?: any
        };
        paging: boolean;
    };
}
export class ColumnType {
    objectKey: string;
    displayName: string;
    dataType?: string;
    format?: string;
    timeZone?: string;
    width?: string;
    Color: string;
    Condition: string; // 'equal', 'notEqual' and contains
    CompareWith: string;
}

export type Condition =
| 'CONTAINS'
| 'DOES_NOT_CONTAIN'
| 'EMPTY'
| 'ENDS_WITH'
| 'STARTS_WITH'
| 'EQUAL'
| 'EQUAL_CASE_SENSITIVE'
| 'GREATER_THAN'
| 'GREATER_THAN_OR_EQUAL'
| 'LESS_THAN'
| 'LESS_THAN_OR_EQUAL'
| 'NOT_EMPTY'
| 'NOT_EQUAL'
| 'NULL'
| 'NOT_NULL';

export type FilterType =
| 'Alph_Filter'
| 'Column_Filter'
| 'Custom_Filter'
| 'Date_Filter'
| 'DMO_Filter'
| 'Global_Search'
| 'MyRecord'
| 'State_Filter'
| 'Stage_Filter'
| 'Transaction_Filter';

export interface GridCondition {
    Condition: Condition;
    ConditionValue: string;
}
export interface GridFilter {
    DataField?: string;
    LogicalOperator?: 'Or' | 'And';
    FilterType?: FilterType;
    GridConditions?: GridCondition[];
}
export interface GridConfiguration {
    ProcessName: string;
    ColumnList: string;
    TransactionId?: string;
    PageSize?: number;
    PageNumber?: number;
    ParentTransactionID?: string;
    SortColumn?: string;
    SortOrder?: string;
    TimeZone?: number;
    ViewName?: string;
    GridFilters?: GridFilter[];
    SeparatorCondition?:string;
    IsColumnListOnly?: boolean;
    IsDistinct?:boolean;
    RefererProcessName?:string;
}
