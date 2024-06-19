import { Input, OnInit, ElementRef, Directive } from '@angular/core';
import { IGridData, IGridFilter } from '@app/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { formatDate } from '@angular/common';
import { environment } from '@env/environment';
import { Subject } from 'rxjs';
import { unionBy } from 'lodash';
import { ToastrService } from 'ngx-toastr';

@Directive()
export abstract class BaseGrid implements OnInit, IGridData {
    SelectedRecordIds: Array<string> = [];
    ProcessName: string;
    GridGuid: string;
    ViewName: string;
    PageSize: string;
    TimeZone: string;
    ShowSelectAll: any;
    PageCount: any;
    SortColumn = '-1';
    SortOrder = '-1';
    PageNumber: string;
    ColumnList: string;
    LstGridFilter: IGridFilter[];
    showActionCol = false;
    gridConfigData: any;
    columns: any = [];
    dataAdapter: any;
    filters: any = {};
    _bodyData: any = {};
    hideFooter = false;
    FilterCondition: {};
    showItemLoading = false;
    selectedAll = false;
    keyColumn = 'TRNSCTNID';
    gridConfig = {};
    TableInfo: any = {
        PageNumber: -1,
        PageSize: -1,
        Recordes: -1,
        PageCount: -1
    };
    sortColumnName = '-1';
    isDefaultView = false;
    activeStateFilter = [];
    StateFilter: any[];
    StageFilter: any[];
    selectedDmoFilter = { All: 'All' };
    selectedCustomFilter = 'Custom Filter(s)';
    selectedAllMyRecordFilter = 'All Record';
    colSpan = 0;
    viewList = [];
    public DMOField: any[] = [];
    public DMOData: any = {};
    public DMODataFilter = [];
    public CustomFilter = {};
    transactionId: string;
    public ColumnData: any = {};
    submitted = false;
    model: any = {};
    // Column dragable
    pageX: any;
    curCol: any;
    nxtCol: any;
    curColWidth: any;
    nxtColWidth: any;
    HasGlobalSearch = true;
    file: File = null;
    IsValidFile = false;
    fileName = '';
    errorMsg = '';
    IsSubProcess = false;
    ParentTransactionId: string;
    HideDeleteActionIcon = false;
    HideDisplayName = false;
    ShowBulkUpdateButton = false;
    ChildCustomfilters: any = {};
    ParentDmoValue: string;
    ChildDmoGuid: {};
    dateFormat = '';
    dateTimeFormat = '';
    dateTimeFormat2 = '';
    calender = ['DateEditBox', 'DateWithCalendar', 'StaticDateBox'];
    colorCode = ['ColorCodeStatus'];
    textBox = ['TextBox', 'UrlTextBox', 'PhoneTextBox', 'EmailEditBox'];
    dropDown = ['DropDownList', 'CountryList', 'USAStateList'];
    dropDownWithCheckbox = ['CheckBoxList', 'RadioButtonList', 'MultiSelectDropDownList', 'ListBox'];
    roleType = ['RoleType'];
    newRow: any = {};
    dmoMapping: any = {};
    CanAddNewRow = false;
    TriggerName = '';
    canInlineEdit = false;
    systemFields = ['TRNSCTNID', 'PTRNSCTNID', 'BMVERSION', 'CRTDBY', 'CRTDON', 'MODFBY', 'MODFON', 'WFODISPNAME', 'WFOSDISPNAME', 'WFVERSION'];
    UrlProcessName: string;
    // Metrics for Lot summary data grid
    metricsData = {};
    IsDeletionAllow = false;
    IsCopyAllow = false;
    IsBulkUpdateAllow = false;
    IsBulkUploadAllow = false;
    IsNewEntryAllow = false;
    IsExcelAllow = false;
    IsPDFAllow = false;
    IsViewAllow = false;
    // for link column
    DmoColumnName: string;
    IsOtherAPICall = false;
    tableDataOther: any = [];
    datemodel;
    isFinilised = false;
    elRef: ElementRef;
    toastr: ToastrService;
    @Input() resetFormSubject: Subject<boolean> = new Subject<boolean>();
     //Entity related code – Nidhi
     SubProcessChild:any;
     ParentFormDmoValue:any;
     IsAddCopyRecPermissionChildPro: boolean;
    isFilterClick: boolean = true;
    constructor(elRef: ElementRef,toastr: ToastrService) {
        this.elRef = elRef;
        this.dateFormat = environment.Setting.dateFormat;
        this.dateTimeFormat = environment.Setting.dateTimeFormat;
        this.dateTimeFormat2 = environment.Setting.dateTimeFormat2;
        this.toastr = toastr;
    }

    tableData: any = [];
    cachedData: any = [];

    arrayOne(n: number = 0): any[] {
        if (n > 0) {
            return Array(n);
        }
        return [];
    }
    ngOnInit() {
        this.resetFormSubject.subscribe(response => {
            if (response) {
                this.getGridData();
            }
        });
        this._bodyData = {
            ProcessName: this.ProcessName,
            PageSize: this.PageSize,
            PageNumber: +this.PageNumber,
            SortColumn: this.SortColumn,
            SortOrder: this.SortOrder,
            TimeZone: this.TimeZone,
            ColumnList: this.ColumnList,
            GridFilters: this.LstGridFilter
        };
        if (this.IsSubProcess) {
            this._bodyData.ParentTransactionId = this.ParentTransactionId;
        }     
        if (this.ProcessName === '' || this.ProcessName === 'commissionadjustment' || this.ProcessName === 'LMKOPECESLot') {
            this.openLinkFromUrl();
            this.getGridConfigData();
        } else {
            this.getGridConfigData();
        }
        const el = this.elRef.nativeElement.querySelector('#tableHeadRow');

        window.addEventListener('mouseup', (event: any) => { this.mouseUp(event); });
        el.addEventListener('mousemove', (event: any) => { this.mouseMove(event); });
        el.addEventListener('mousedown', (event: any) => { this.mouseDown(event); });
    }

    onPageChange(action) {
        if (action === 'prev') {
            this._bodyData.PageNumber = (+this._bodyData.PageNumber - 1) > -1 ? (+this._bodyData.PageNumber - 1) :
                this.TableInfo.PageCount - 1;
        } else if (action === 'next') {
            this._bodyData.PageNumber = (+this._bodyData.PageNumber + 1) < this.TableInfo.PageCount ?
                (+this._bodyData.PageNumber + 1) : 0;
        }
        this.getGridData();

    }
    sortDefault() {
        this.onSort(this.SortColumn, this.SortOrder);
    }
    sortColumn(columnName: string) {
        let sortOrder = 'asc';
        if (this._bodyData.SortColumn === columnName && this._bodyData.SortOrder === 'asc') {
            sortOrder = 'desc';
        }
        this.onSort(columnName, sortOrder);
    }
    isEmptyObject(obj: any): boolean {
        return Object.keys(obj).length > 0 ? false : true;
    }
    onSort(columnName, order) {
        const htmlObj = this.elRef.nativeElement.querySelector('.grid-filter-wrap .show');
        if (htmlObj) { htmlObj.classList.toggle('show'); }
        if (columnName && order) {
            this._bodyData.SortColumn = columnName;
            this.sortColumnName = this.gridConfigData.Columns[columnName].DisplayName;
            this._bodyData.SortOrder = order;
        } else {
            this._bodyData.SortColumn = this.SortColumn;
            this._bodyData.SortOrder = this.SortOrder;
        }
        this.getGridData();
        sessionStorage.setItem(sessionStorage.getItem('processName').toString() +'gridsort', JSON.stringify({
            column: this._bodyData.SortColumn,
            displayName: this.sortColumnName,
            order: this._bodyData.SortOrder
        }));
    }

    onFilter(form, columnName, filterType, value, dataType = undefined) {
        this.isFilterClick = true;
        this.submitted = true;
        let filter: any = {};
        this._bodyData.PageNumber = 0;
        if (filterType === 'Global_Search') {
            if (form.globalSearch.value === '') {
                delete this.filters[filterType + '~$~' + columnName];
            } else {
                //#887 - #382 - ETKT - #360 - All App-Generic -Global search for Date should with DD/MM/YYYY format
                let RegDateExpressin = /^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
                let globalSearchValue = form.globalSearch.value;

                if (RegDateExpressin.test(form.globalSearch.value) === true && environment.Setting.dateFormat === "dd/MM/yyyy") {
                    let dateArray = form.globalSearch.value.split("/");
                    globalSearchValue = dateArray[1].toString() + '/' + dateArray[0].toString() + '/' + dateArray[2].toString();
                }

                filter = {
                    GridConditions: [{
                        Condition: 'CONTAINS',
                        ConditionValue: globalSearchValue,
                        dataType: filterType,
                        RowValue:form.globalSearch.value
                    }
                    ],
                    DataField: columnName,
                    LogicalOperator: 'Or',
                    FilterType: filterType
                };
            }
            // columnName = filterType;
        } else if (filterType === 'DMO_Filter') {
            // For Key Value Search Box Ticket No. #1038
            if(dataType === 'KeyValueSearchBox' && value !== 'All'){
                filter = {
                    GridConditions: [{
                        Condition: 'CONTAINS',
                        ConditionValue: value.indexOf('(') > -1 ? value.split('(')[0].replace(')', '').trim() : value
                    }
                    ],
                    DataField: columnName+'_val',
                    LogicalOperator: 'Or',
                    FilterType: 'DMO_Filter',
                    DataType: 'KeyValueSearchBox'
                },
                this.selectedDmoFilter[columnName] = value;
            }
            else {
                if (value === 'All') {
                    delete this.filters[filterType + '~$~' + columnName.GUID];
                    this.selectedDmoFilter = { All: 'All' };
                } else {
                    if(columnName === 'dmocrmheaderinfocmpcode'){
                            
                    filter = {
                        GridConditions: [{
                            Condition: 'CONTAINS',
                            ConditionValue: value.indexOf('(') > -1 ? value.split('(')[1].replace(')', '').trim() : value
                        }
                        ],
                        DataField: columnName,
                        LogicalOperator: 'Or',
                        FilterType: 'DMO_Filter'
                    };
                    }
                    else{
                            
                    filter = {
                        GridConditions: [{
                            Condition: 'CONTAINS',
                            ConditionValue: value
                        }
                        ],
                        DataField: columnName,
                        LogicalOperator: 'Or',
                        FilterType: 'DMO_Filter'
                    };
                    }
                    this.selectedDmoFilter[columnName] = value;
                }
            }
        } else if (filterType === 'State_Filter') {
            if (columnName === 'All') {
                for (const item of form) {
                    delete this.filters[filterType + '~$~' + item];
                }
                this.activeStateFilter = [];
            } else if (this.activeStateFilter.indexOf(columnName) > -1) {
                this.activeStateFilter.splice(this.activeStateFilter.indexOf(columnName), 1);
                delete this.filters[filterType + '~$~' + columnName];
            } else {
                filter = {
                    GridConditions: [{
                        Condition: 'CONTAINS',
                        ConditionValue: columnName
                    }
                    ],
                    DataField: columnName,
                    LogicalOperator: 'Or',
                    FilterType: 'State_Filter'
                };
                this.activeStateFilter.push(columnName);
            }
        } else if (filterType === 'Stage_Filter') {
            if (columnName === 'All') {
                for (const item of form) {
                    delete this.filters[filterType + '~$~' + item];
                }
                this.activeStateFilter = [];
            } else if (this.activeStateFilter.indexOf(columnName) > -1) {
                this.activeStateFilter.splice(this.activeStateFilter.indexOf(columnName), 1);
                delete this.filters[filterType + '~$~' + columnName];
            } else {
                filter = {
                    GridConditions: [{
                        Condition: 'CONTAINS',
                        ConditionValue: columnName
                    }
                    ],
                    DataField: columnName,
                    LogicalOperator: 'Or',
                    FilterType: 'Stage_Filter'
                };
                this.activeStateFilter.push(columnName);
            }
        } else if (filterType === 'Custom_Filter') {
            if (value === 'Custom Filter(s)') {
                delete this.filters[filterType + '~$~' + columnName];
            } else {
                filter = {
                    GridConditions: [{
                        ConditionValue: value
                    }
                    ],
                    DataField: value,
                    LogicalOperator: 'Or',
                    FilterType: 'Custom_Filter'
                };
            }
            this.selectedCustomFilter = value;
        } else if (filterType === 'Column_Filter') {
            if (!this.validate(form)) {
                return;
            }
            if (dataType === 'KeyValueSearchBox') {
                filter = {
                    GridConditions: [{
                        Condition: form.ConditionOpt1.value,
                        ConditionValue: form.filterValue1.value.lastIndexOf('(') > -1 ? form.filterValue1.value.split('(')[0].trim() : form.filterValue1.value
                    }
                    ],
                    DataField: columnName + '-' + columnName,
                    LogicalOperator: form.logicalOpt.value,
                    FilterType: filterType,
                    DataType: dataType
                }

            }

            value = {};
            value.submitted = true;
            // this.elRef.nativeElement.querySelector('.grid-filter-wrap .show').classList.toggle('show');
            const htmlObj = this.elRef.nativeElement.querySelector('.grid-filter-wrap .show') ;
            if (htmlObj) {
                { htmlObj.classList.toggle('show'); }
            }
            if (dataType === 'CheckBoxList' || dataType === 'RadioButtonList' || dataType === 'DropDownList' || dataType === 'ColorCodeStatus') {
                filter = {
                    GridConditions: [
                    ],
                    DataField: columnName,
                    FilterType: 'Column_Filter'
                };
            } else {
                if (dataType !== 'KeyValueSearchBox') {
                    filter = {
                        GridConditions: [
                        ],
                        DataField: columnName,
                        LogicalOperator: form.logicalOpt.value,
                        FilterType: 'Column_Filter'
                    };
                }
            }
            const allInput = form.getElementsByTagName('input');
            for (const input of allInput) {
                if (input.type === 'checkbox' && input.checked === true) {
                    if(input.value === 'EMPTY'){
                        filter.GridConditions.push({
                            Condition: 'NULL',
                            ConditionValue: 'NULL'
                        });
                        filter.GridConditions.push({
                            Condition: 'EMPTY',
                            ConditionValue: 'EMPTY'
                        });
                    }else if(input.value === 'NOT_EMPTY'){
                        filter.GridConditions.push({
                            Condition: 'NOT_NULL',
                            ConditionValue: 'NOT_NULL'
                        });
                        filter.GridConditions.push({
                            Condition: 'NOT_EMPTY',
                            ConditionValue: 'NOT_EMPTY'
                        });
                    }
                    else{
                        filter.GridConditions.push({
                            Condition: 'CONTAINS',
                            ConditionValue: input.value
                        });
                    }                  
                }
            }
        } else if (filterType === 'All_Filter') {
            if (value === 'MyRecord') {
                filter = {
                    GridConditions: [{
                        ConditionValue: 'My Record'
                    }
                    ],
                    FilterType: value
                };
                this.selectedAllMyRecordFilter = 'My Record';
            } else {
                this.selectedAllMyRecordFilter = 'All Record';
                delete this.filters[filterType + '~$~' + columnName];
            }

        }
        if (form.filterValue1 && form.filterValue1.value !== '') {
            let val = form.filterValue1.value;
            if (dataType && (['DateEditBox', 'DateWithCalendar', 'CreatedDate', 'LastUpdatedDate', 'StaticDateBox'].indexOf(dataType) > -1)) {
                if(['IN', 'NOT_IN', 'RANGE'].indexOf(form.ConditionOpt1.value) > -1){
                    val = this.formateDateForSqubQuery(val, 'MM/dd/yyyy HH:mm:ss', 0, form.ConditionOpt1.value);
                }
                else
                {
                    val = this.convertToSystemDataAndTime(val, 'MM/dd/yyyy HH:mm:ss', 0, form.ConditionOpt1.value);
                }

            }
            if (dataType && (['CreatedDateTime', 'LastUpdatedDateTime', 'DateTimeZone', 'CRTDON', 'MODFON', 'DateTimeBox'].indexOf(dataType) > -1)) {
                if(['IN', 'NOT_IN', 'RANGE'].indexOf(form.ConditionOpt1.value) > -1){
                    val = this.formateDateForSqubQuery(val, 'MM/dd/yyyy HH:mm:ss', 0, form.ConditionOpt1.value);
                }
                else
                {
                    val = this.convertToSystemDataAndTime(val, 'MM/dd/yyyy HH:mm:ss', 0, form.ConditionOpt1.value);
                }
            }
            if (filterType === 'Column_Filter' && dataType === 'KeyValueSearchBox') {
                //Entities related Code Start-Nidhi
                if(form.ConditionOpt1.value === 'NULL'){
                    filter.GridConditions.push({
                        Condition: 'EMPTY',
                        ConditionValue: 'EMPTY',
                        dataType: dataType,
                        RowValue: 'EMPTY'
                    });
                }
                if(form.ConditionOpt1.value === 'NOT_NULL'){
                    filter.GridConditions.push({
                        Condition: 'NOT_EMPTY',
                        ConditionValue: 'NOT_EMPTY',
                        dataType: dataType,
                        RowValue: 'NOT_EMPTY'
                    });
                }
                //Entities related Code End-Nidhi
            }
            else {
                filter.GridConditions.push({
                    Condition: form.ConditionOpt1.value,
                    ConditionValue: val,
                    dataType: dataType,
                    RowValue: form.filterValue1.value
                });
                //Entities related Code Start-Nidhi
                if(form.ConditionOpt1.value === 'NULL'){
                    filter.GridConditions.push({
                        Condition: 'EMPTY',
                        ConditionValue: 'EMPTY',
                        dataType: dataType,
                        RowValue: 'EMPTY'
                    });
                }
                if(form.ConditionOpt1.value === 'NOT_NULL'){
                    filter.GridConditions.push({
                        Condition: 'NOT_EMPTY',
                        ConditionValue: 'NOT_EMPTY',
                        dataType: dataType,
                        RowValue: 'NOT_EMPTY'
                    });
                }
                //Entities related Code End-Nidhi
            }
        }
        if (form.filterValue2 && form.filterValue2.value !== '') {
            let val = form.filterValue2.value;
            if (dataType && (['DateEditBox', 'DateWithCalendar', 'CreatedDate', 'LastUpdatedDate', 'StaticDateBox'].indexOf(dataType) > -1)) {
                if(['IN', 'NOT_IN', 'RANGE'].indexOf(form.ConditionOpt1.value) > -1){
                    val = this.formateDateForSqubQuery(val, 'MM/dd/yyyy HH:mm:ss', 0, form.ConditionOpt2.value);
                }
                else
                {
                    val = this.convertToSystemDataAndTime(val, 'MM/dd/yyyy HH:mm:ss', 0, form.ConditionOpt2.value);
                }
            }
            if (dataType && (['CreatedDateTime', 'LastUpdatedDateTime', 'DateTimeZone', 'CRTDON', 'MODFON', 'DateTimeBox'].indexOf(dataType) > -1)) {
                if(['IN', 'NOT_IN', 'RANGE'].indexOf(form.ConditionOpt1.value) > -1){
                    val = this.formateDateForSqubQuery(val, 'MM/dd/yyyy hh:mm a', 0, form.ConditionOpt2.value);
                }
                else
                {
                    val = this.convertToSystemDataAndTime(val, 'MM/dd/yyyy hh:mm a', 0, form.ConditionOpt2.value);
                }
            }

            filter.GridConditions.push({
                Condition: form.ConditionOpt2.value,
                ConditionValue: val,
                dataType:dataType,
                RowValue: form.filterValue2.value
            });
        }


        if (filter && Object.keys(filter).length !== 0) {
            this.filters[filterType + '~$~' + columnName] = filter;
        }
        this.getGridData();
        sessionStorage.setItem(sessionStorage.getItem('processName').toString() + 'gridFlters', JSON.stringify(this.filters));
    }
    validate(form): boolean {

        if(form.ConditionOpt1 && (form.ConditionOpt1.value == 'NOT_NULL' || form.ConditionOpt1.value == 'NULL')){
            form.filterValue1.value = form.ConditionOpt1.value;
            return true;
        }
        if(form.ConditionOpt2 && (form.ConditionOpt2.value == 'NOT_NULL' || form.ConditionOpt2.value == 'NULL')){
            form.filterValue1.value = form.ConditionOpt2.value;
            return true;
        }
        if (form.ConditionOpt1 && (form.ConditionOpt1.value == '' || form.ConditionOpt1.value == 'Select...')) {
            return false;
        } else if (form.logicalOpt && (form.logicalOpt.value == '' || form.logicalOpt.value == 'Select...')) {
            return false;
        } else if (form.filterValue1 && form.filterValue1.value == '') {
            return false;
        }
        else {
            return true;
        }
    }
    onFilterClear(columnName, filterType, item = undefined) {
        this.isFilterClick = true;
        this._bodyData.PageNumber = 0;
        if (filterType === 'sort') {
            this._bodyData.SortColumn = '-1';
            sessionStorage.removeItem(sessionStorage.getItem('processName').toString() +'gridsort');
        }
        if (filterType === 'Global_Search') {
            const globalSearch = this.elRef.nativeElement.querySelector('#globalSearch');
            globalSearch.value = '';
            delete this.filters[filterType + '~$~' + columnName];
        } else if (filterType === 'DMO_Filter') {
            if (item && item.value['DataType'] === 'KeyValueSearchBox') {
                delete this.filters[filterType + '~$~' + columnName.replace('_val', '')];
            } else {
                delete this.filters[filterType + '~$~' + columnName];
            }
            this.selectedDmoFilter = { All: 'All' };
        } else if (filterType === 'State_Filter' || filterType === 'Stage_Filter') {
            if (columnName === 'All') {
                this.activeStateFilter = [];
            } else if (this.activeStateFilter.indexOf(columnName) > -1) {
                this.activeStateFilter.splice(this.activeStateFilter.indexOf(columnName), 1);
                delete this.filters[filterType + '~$~' + columnName];
            }
        } else if (filterType === 'Custom_Filter') {
            delete this.filters[filterType + '~$~Custom Filter(s)'];
            this.selectedCustomFilter = 'Custom Filter(s)';
        } else if (filterType === 'Column_Filter') {
            if (item && item.value['DataType'] === 'KeyValueSearchBox') {
                const formkv = this.elRef.nativeElement.querySelector('#frm_' + columnName.split('-')[0]);
                formkv.reset();
                delete this.filters[filterType + '~$~' + columnName.split('-')[0]];
            } else{
            const query = this.elRef.nativeElement.querySelector('.grid-filter-wrap .show');
            if (query) {
                query.classList.toggle('show');
            }
            const form = this.elRef.nativeElement.querySelector('#frm_' + columnName);
            if(form.logicalOpt!=undefined){
                if (form.logicalOpt.type === 'hidden') {
                    const allInput = form.getElementsByTagName('input');
                    for (let i = 0; i < allInput.length; i++) {
                        if (allInput[i].type === 'checkbox' && allInput[i].checked === true) {
                            allInput[i].checked = false;
                        }
                    }
                } else {
                   // this.submitted = true;
                    form.reset();
                    if(form.filterValue2.hasAttribute('ngbdatepicker')){
                        form.logicalOpt.value = 'OR';
                        form.filterValue1.value = '';
                        form.filterValue2.value = '';
                        form.ConditionOpt1.value = 'GREATER_THAN';
                        form.ConditionOpt2.value = 'GREATER_THAN';
                    }
                    else{
                        form.logicalOpt.value = 'OR';
                        form.filterValue1.value = '';
                        form.filterValue2.value = '';
                        form.ConditionOpt1.value = 'CONTAINS';
                        form.ConditionOpt2.value = 'CONTAINS';
                    }

                }
            }
            delete this.filters[filterType + '~$~' + columnName];}
        } else if (filterType === 'MyRecord') {
            delete this.filters['All_Filter~$~'];
        }
        delete this.filters[filterType + '~$~' + columnName];
        sessionStorage.setItem(sessionStorage.getItem('processName').toString() + 'gridFlters', JSON.stringify(this.filters));
        this._bodyData.PageNumber = 0;
        this.getGridData();
    }
    goToPage(pageNumberControl) {
        if (pageNumberControl.value <= this.TableInfo.PageCount) {
            const curPage = parseInt(pageNumberControl.value);
            if(pageNumberControl.value === "0" || pageNumberControl.value === "" || pageNumberControl.value ===  null){
                this.toastr.warning('Value must be greater than or equal to 1.');
                const currentPageValue =  pageNumberControl.value;
                pageNumberControl.value = 1;
                this._bodyData.PageNumber = currentPageValue - 0;
            } else if(curPage < 1){
                this.toastr.warning('Value must be greater than or equal to 1.');
                pageNumberControl.value = 1;
                this._bodyData.PageNumber = 1 - 1;
            } else{
            this._bodyData.PageNumber = pageNumberControl.value - 1;
        }
            this.getGridData();
        }
    }
    changePageSize(pageSizeControl) {
        this._bodyData.PageNumber = 0;
        this._bodyData.PageSize = pageSizeControl;
        this.getGridData();
    }

    checkIfAllSelected(event, item) {
        item.selected = event.currentTarget.checked;
        if (sessionStorage.AppName === 'LMKLivestockSales') {
            const selecteItem = this.tableData.filter(x => x.selected === true);
            if (selecteItem.length === 1 && selecteItem[0].WFODISPNAME !== 'Finalised') {
                this.isFinilised = false;
            } else {
                this.isFinilised = true;
            }
        }
        const recordID = item[this.keyColumn].toString();
        if (item.selected) {
            this.SelectedRecordIds.push(recordID);
            this.selectedAll = this.tableData.every(chkItem => {
                return chkItem.selected === true;
            });
        } else {
            this.selectedAll = false;
            const ItemIndex = this.SelectedRecordIds.indexOf(recordID);
            this.SelectedRecordIds.splice(ItemIndex, 1);
        }
    }

    SelectAllCheckBox(that) {
        const checked = that.currentTarget.checked;
        for (const i of this.tableData) {
            i.selected = checked;
        }

        this.SelectedRecordIds = [];
        if (checked) {
            for (const item of this.tableData) {
                this.SelectedRecordIds.push(item[this.keyColumn].toString());
            }
        }
    }

     BindData(data) {
        if(!!data && !!data.Data){
            this.tableData = data.Data;
            this.cachedData = unionBy(this.cachedData, this.tableData, this.keyColumn);
            this.tableData.forEach((item: any) => {
                if (this.SelectedRecordIds.includes(item[this.keyColumn].toString())) {
                    item.selected = true;
                }
                item.edit_value = { ...item };
                for (const prop of this.systemFields) {
                    delete item.edit_value[prop];
                }
            });
        }     
                this.hideFooter = true;                 
    }
    drop(event: CdkDragDrop<string[]>) {
        if (event.previousIndex !== event.currentIndex) {
            const columnList = this.gridConfigData.ColumnList.split(',');
            moveItemInArray(columnList, event.previousIndex, event.currentIndex);
            this.gridConfigData.ColumnList = columnList.join(',');
            this.setConfigData(this.gridConfigData);
            this.saveGridConfig();
        }
    }

    // Column Resize
    // @HostListener('#ProcessName:mousemove', ['$event'])
    mouseMove(e) {

        if (this.curCol) {
            const diffX = e.pageX - this.pageX;

            if (this.nxtCol) {
                this.nxtCol.style.width = (this.nxtColWidth - (diffX)) + 'px';
            }
            this.curCol.style.width = (this.curColWidth + diffX) + 'px';
        }

    }
    mouseDown(e) {
        if (!e.currentTarget.classList.contains('fa-grip-lines-vertical')) {
            return;
        }
        this.curCol = e.target.parentElement.parentElement;
        this.nxtCol = this.curCol.nextElementSibling;
        this.pageX = e.pageX;
        this.curColWidth = this.curCol.offsetWidth;
        if (this.nxtCol) {
            this.nxtColWidth = this.nxtCol.offsetWidth;
        }
    }

    mouseUp(event) {
        let flg = false;
        const tr = document.activeElement.querySelectorAll('#tableHeadRow');
        if(!!tr[0] && !!this.curCol){
            const th = tr[0]['childNodes'];
            this.setTooltips(document.activeElement);
            if (th) {
                th.forEach(element => {
                    if(element['classList']){
                        if (element['classList'].contains('ColResize') && element["style"].width !== '') {
                            this.gridConfigData.Columns[element['id']].Width = element["style"].width;
                            flg = true;
                        }
                    }              
                });
                if (flg) {
                    this.saveGridConfig();
                }
            }
        }
        this.curCol = undefined;
        this.nxtCol = undefined;
        this.pageX = undefined;
        this.nxtColWidth = undefined;
        this.curColWidth = undefined;
    }

    setTooltips(event) {
        setTimeout(() => {
            const arr = event.querySelectorAll('.content-text');
            arr.forEach(elem => {
                if (elem.offsetWidth < elem.scrollWidth) {
                    elem.setAttribute('title', elem.textContent);
                } else {
                    elem.removeAttribute('title');
                }
            });
        }, 500);
    }

    ClearFilters() {
        this.isFilterClick = true;
        this.sortColumnName = this._bodyData.SortColumn = this.SortColumn;
        this._bodyData.SortOrder = this.SortOrder;
        this.submitted = false;
        const globalSearch = this.elRef.nativeElement.querySelector('#globalSearch');
        if (globalSearch) {
            globalSearch.value = '';
        }
        this.filters = {};
      //this.selectedDmoFilter.All = 'All';
      this.selectedDmoFilter = { All: 'All' };
        this.activeStateFilter = [];
        this.selectedCustomFilter = 'Custom Filter(s)';
        this.selectedAllMyRecordFilter = 'All Record';
        for (const objColumn of this.gridConfigData.ColumnList.split(',')) {
            const form = this.elRef.nativeElement.querySelector('#frm_' + objColumn);
            if (form) {
                if(form.logicalOpt!=undefined){
                    if (form.logicalOpt.type === 'hidden') {
                        const allInput = form.getElementsByTagName('input');
                        for (let i = 0; i < allInput.length; i++) {
                            if (allInput[i].type === 'checkbox' && allInput[i].checked === true) {
                                allInput[i].checked = false;
                            }
                        }
                    } else {
                        form.reset();
                        form.submitted = false;
                        this.submitted =false;
                        if(form.filterValue1.hasAttribute('ngbdatepicker')){
                            form.logicalOpt.value = 'OR';
                            form.filterValue1.value = '';
                            form.filterValue2.value = '';
                            form.ConditionOpt1.value = 'GREATER_THAN';
                            form.ConditionOpt2.value = 'GREATER_THAN';
                        }
                        else {
                            form.logicalOpt.value = 'OR';
                            form.filterValue1.value = '';
                            form.filterValue2.value = '';
                            form.ConditionOpt1.value = 'CONTAINS';
                            form.ConditionOpt2.value = 'CONTAINS';
                        }
                    }
                }
                else{
                    const allInput = form.getElementsByTagName('input');
                        for (let i = 0; i < allInput.length; i++) {
                            if (allInput[i].type === 'checkbox' && allInput[i].checked === true) {
                                allInput[i].checked = false;
                            }
                        }
                }
            }
        }
        this._bodyData.PageNumber = 0;
        if (sessionStorage.getItem(sessionStorage.getItem('processName').toString() + 'gridFlters')) {
            sessionStorage.removeItem(sessionStorage.getItem('processName').toString() + 'gridFlters');
        }
        if (sessionStorage.getItem(sessionStorage.getItem('processName').toString() + 'gridsort')) {
            sessionStorage.removeItem(sessionStorage.getItem('processName').toString() + 'gridsort');
        }
        if (sessionStorage.getItem('ViewName')) {
            sessionStorage.removeItem('ViewName');
        }
        this.getGridData();
    }
    getDateForCalender(value) {
        const d = value ? new Date(value) : new Date();
        return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
    }

    convertToSystemDataAndTime(value, format, zone, ConditionOption) {
        if (value == null || value === '') {
          return null;
        }
        try
        {
            let modifiedDateValue;
            let dateArray = value.split("/");
            if (environment.Setting.dateFormat === "dd/MM/yyyy") {
              modifiedDateValue = dateArray[1].toString() + '/' + dateArray[0].toString() + '/' + dateArray[2].toString();
            } else {
               modifiedDateValue = dateArray[0].toString() + '/' + dateArray[1].toString() + '/' + dateArray[2].toString();
            }
            let timeZone;
            if (!zone) {
              timeZone = this.TimeZone;
            } else {
              timeZone = zone;
            }
            const d = new Date(modifiedDateValue);
            const localOffset = timeZone * 60000;

            if(['GREATER_THAN', 'LESS_THAN_OR_EQUAL'].indexOf(ConditionOption) > -1){
                d.setHours(23,59,59,999);
            }
            else{
                d.setHours(0,0,0,0);
            }

            //covert to UTC fotmate
            const localTime = d.getTime()+ localOffset;
            d.setTime(localTime);
            return formatDate(d, format, 'en-US');
        }
        catch (error) {
          console.log('Datevalue-' + value + 'error' + error);
          return '';
        }
      }

    convertToLocalDataAndTime(value, format, zone) {
        if (value == null || value === '') {
            return null;
        }
        try {
            const d = new Date(value); // val is in UTC
            let timeZone;
            if (!zone) {
                timeZone = this.TimeZone;
            } else {
                timeZone = zone;
            }
            const localOffset = timeZone * -60000;
            const localTime = d.getTime();// - localOffset;
            d.setTime(localTime);
            return formatDate(d, format, 'en-US');
        } catch (error) {
            // console.log('Datevalue-' + value + 'error' + error);
            return '';
        }
    }

    abstract setConfigData(gridConfig: any): void;
    abstract getGridData(): void;
    abstract BindDMODropDown(dmoGuid): void;
    abstract getGridConfigData(gridviewName?): void;
    abstract getDMOsMapping(): void;
    abstract saveGridConfig(): void;
    abstract openLinkFromUrl(): void;
    abstract getprocessDataCount(data):void;

    hideBulkUpdateButton() {
        if (this.SelectedRecordIds.length === 0) {
            return true;
        } else {
            if (this.ShowBulkUpdateButton) {
                return false;
            } else {
                return !this.IsBulkUpdateAllow;
            }
        }
    }


    mask(rawValue) {
        if (rawValue && rawValue.replace(/\D+/g, '').length > 10) {
            return ['+', /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
        } else {
            return ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
        }
    }

    getDropDownData(dmoGuid, isKeyValuePair = false) {
        this.BindDMODropDown(dmoGuid);
        if (isKeyValuePair) {
            for (const key in this.DMOData[dmoGuid]) {
                if (this.DMOData[dmoGuid].hasOwnProperty(key) && typeof (this.DMOData[dmoGuid][key].DataValue) !== 'object') {
                    const DataValue = {
                        key: '',
                        value: ''
                    };
                    const element = this.DMOData[dmoGuid][key].DataValue;
                    const splitObj = element.split('~');
                    DataValue.key = splitObj[0];
                    DataValue.value = splitObj[1];
                    delete this.DMOData[dmoGuid][key].DataValue;
                    this.DMOData[dmoGuid][key].DataValue = (DataValue);
                }
            }
        }
    }

    CheckedSelected(savedValue, newValue) {
        let val = '';
        if (!!savedValue === false) {
            return false;
        }
        if (savedValue.indexOf('!') > 0) {
            val = savedValue.split('!');
        } else {
            val = savedValue.split('|');
        }
        return val.indexOf(newValue) > -1;
    }

    changeEditValue(event: any, row: any, colIndex: any, data?: any) {
        if (this.dropDown.indexOf(colIndex.dataType) > - 1 || this.colorCode.indexOf(colIndex.dataType) > -1) {
            row.edit_value[colIndex.datafield] = data.DataValue;
        } else if (this.dropDownWithCheckbox.indexOf(colIndex.dataType) > -1) {
            const currentElement = event.currentTarget;
            const control = event.currentTarget.parentElement;
            let value = '';
            if (currentElement.tagName === 'BUTTON') {
                if (currentElement.innerText !== '') {
                    const parentTag = control.parentNode.parentNode.parentNode.parentNode.parentNode;
                    const selectedItem = parentTag.querySelectorAll('input[type=' + (colIndex.dataType === 'RadioButtonList' ? 'radio' : 'checkbox') + ']:checked');
                    for (let index = 0; index < selectedItem.length; index++) {
                        const element = selectedItem[index];
                        value += element.parentElement.innerText;
                        if (index < selectedItem.length - 1) {
                            value += colIndex.dataType === 'MultiSelectDropDownList' || colIndex.dataType === 'ListBox' ? '|' : '!';
                        }
                    }
                    row.edit_value[colIndex.datafield] = value;

                }
            }
        } else if (this.roleType.indexOf(colIndex.dataType) > -1) {
            const currentElement = event.currentTarget;
            const control = event.currentTarget.parentElement;
            let value = '';
            if (currentElement.tagName === 'BUTTON') {
                if (currentElement.innerText !== '') {
                    const parentTag = control.parentNode.parentNode.parentNode.parentNode.parentNode;
                    const selectedItem = parentTag.querySelectorAll('input[type=radio]:checked');
                    for (let index = 0; index < selectedItem.length; index++) {
                        const element = selectedItem[index];
                        value += element.value;
                        if (index < selectedItem.length - 1) {
                            value += colIndex.dataType === 'MultiSelectDropDownList' || colIndex.dataType === 'ListBox' ? '|' : '!';
                        }
                    }
                    if (value !== '') {
                        row.edit_value[colIndex.datafield] = value;
                    }
                }
            }
        } else if (this.calender.indexOf(colIndex.dataType) > -1) {
            const d = new Date(event.year + '-' + event.month + '-' + event.day);
            const value = formatDate(d, this.dateFormat, 'en-US');
            if (value) {
                row.edit_value[colIndex.datafield] = value;
            }
        }
    }

    // Check contract id exists or not
    isExists(item) {
        if (item.dmocrmhisalecreatedfrom == 'e-contract') {
            return true;
        } else {
            return false;
        }
    }

    formateDateForSqubQuery(value, format, zone, ConditionOption){
        let condition = "";
         if(['IN', 'NOT_IN'].indexOf(ConditionOption) > -1){
            if(value != undefined && value !=null)
            {
                var values = value.split(',');
                for (let i = 0; i < values.length; i++)
                {
                    let formated_Value = this.convertToSystemDataAndTime(values[i], format, zone, ConditionOption);
                    condition += formated_Value + ",";
                }
                if (condition.toLowerCase().endsWith(",")){
                    if (condition.toLowerCase().lastIndexOf(",") > 0){
                        condition = condition.substring(0, condition.lastIndexOf(","));
                    }
                }
            }
         }
         else if(['RANGE'].indexOf(ConditionOption) > -1){
            if(value != undefined && value !=null)
            {
                var values = value.split('-');
                for (let i = 0; i < values.length; i++)
                {
                    let formated_Value = this.convertToSystemDataAndTime(values[i], format, zone, ConditionOption);
                    condition += formated_Value + "-";
                }

                if (condition.toLowerCase().endsWith("-")){
                    if (condition.toLowerCase().lastIndexOf("-") > 0){
                        condition = condition.substring(0, condition.lastIndexOf("-"));
                    }
                }
            }
        }
        return condition;
    }
}
