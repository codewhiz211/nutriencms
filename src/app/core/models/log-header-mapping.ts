import { IHeaderMap } from './plasmaGridInterface';
import { environment } from '@env/environment';
import { UserDetail } from './user-detail';

export class LogHeaderMapping {
    activityHeaderMap: IHeaderMap = {
        config: {
            header: {
                columns: [
                    {
                        objectKey: 'Date_Time',
                        displayName: 'Date & Time',
                        dataType: 'Date',
                        format: environment.Setting.dateTimeFormatNoSeconds,
                        timeZone: new Date().getTimezoneOffset().toString(),
                        width: '15%'
                    }, {
                        objectKey: 'Modified_By',
                        displayName: 'Modified By',
                        width:'15%'
                    }, {
                        objectKey: 'Role',
                        displayName: 'Role',
                        width:'30%'
                    }, {
                        objectKey: 'Previous_Stage',
                        displayName: 'Previous Stage',
                        width:'15%'
                    }, {
                        objectKey: 'Current_Stage',
                        displayName: 'Current Stage',
                        width:'15%'
                    },
                    {
                        objectKey: 'Previous_State',
                        displayName: 'Previous State',
                        width:'15%'
                    }, {
                        objectKey: 'Current_State',
                        displayName: 'Current State',
                        width:'15%'
                    },
                    {
                        objectKey: 'Action',
                        displayName: 'Action',
                        width:'15%'
                    }
                ],
                action: false
            },
            paging: true
        }
    };

    historyHeaderMap: IHeaderMap = {
        config: {
            header: {
                columns: [
                    // {
                    //     objectKey: 'Date_Time',
                    //     displayName: 'Date & Time',
                    //     dataType: 'Date',
                    //     format: 'MM/dd/yyyy h:mm a',
                    //     timeZone: localStorage.currentUser ? JSON.parse(localStorage.currentUser).TimeZone.toString() : ''
                    // }, {
                    //     objectKey: 'Modified_By',
                    //     displayName: 'Modified By',
                    // }, {
                    //     objectKey: 'IP_Address',
                    //     displayName: 'IP Address',
                    // }, {
                    //     objectKey: 'Field_Modified',
                    //     displayName: 'Field Modified',
                    // }, {
                    //     objectKey: 'Previous_Value',
                    //     displayName: 'Previous Value',
                    // }, {
                    //     objectKey: 'New_Value',
                    //     displayName: 'New Value',
                    // }
                ],
                action: false
            },
            paging: true
        }
    };

    notificationHeaderMap: IHeaderMap = {
        config: {
            header: {
                columns: [
                    {
                        objectKey: 'Date_Time',
                        displayName: 'Date & Time',
                        dataType: 'Date',
                        format: environment.Setting.dateTimeFormatNoSeconds,
                        timeZone: new Date().getTimezoneOffset().toString()
                    }, {
                        objectKey: 'Mail_To',
                        displayName: 'Mail To',
                    }, {
                        objectKey: 'Mail_CC',
                        displayName: 'Mail CC',
                    }, {
                        objectKey: 'Subject',
                        displayName: 'Subject',
                    }, {
                        objectKey: 'Attachment',
                        displayName: 'Attachment',
                    }, {
                        objectKey: 'Status',
                        displayName: 'Status',
                     }, 
                   // {
                    //     objectKey: 'Mail_Body',
                    //     displayName: 'Mail Body',
                    // }, 
                    {
                        objectKey: 'Mail_From',
                        displayName: 'Mail From',
                    }, {
                        objectKey: 'Stage',
                        displayName: 'Stage',
                    }, {
                        objectKey: 'State',
                        displayName: 'State',
                    }, {
                        objectKey: 'Trigger_Name',
                        displayName: 'Trigger Name',
                    }

                ],
                action: {
                    Placement: 'Mail_Body',
                    Link: {
                        Action: {

                        }
                    },
                    DropDown: false
                }
            },
            paging: true
        }
    };

}
