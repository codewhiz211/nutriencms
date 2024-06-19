// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
// This environment file is not used in production env. for devops

export const environment = {
  timeStamp: '21.6.28.59',
  production: false,
  Setting: {
    dateFormat: 'dd/MM/yyyy',
    dateTimeFormat: 'dd/MM/yyyy hh:mm:ss',
    dateTimeFormat1: 'MM/dd/yyyy HH:mm:ss',
    dateTimeFormat2: 'dd/MM/yyyy hh:mm:ss a',
    dateTimeFormatNoSeconds: 'dd/MM/yyyy hh:mm a',
    dateFormatInNotes: 'E, d MMM yyyy h:mm a',
    dateTimeFormat24: true,
    xmlgeneratemsg: 'You have not generated XML for BM/WF. Please generate XML prior to process your request.',
    IsPermanentFileDeletion: false,
    C2MIceAPIUrl: '',
    BaseAPIUrl: '',
    eSaleyardApiUrl: '',
    AdminViewAccessToken: '',
    LoginAPIUrl: '',
    C2M_Console_URL: '',
    C2M_MediaApp_Url: '',
    C2M_Console_API_URL: '',
    BaseAPIUrlLmk: '',

    webUrlRoot: '',
    mediaUrl: '',
    buyerFARoles: '',
    dashboard: {
      GatewayUrl: '',
      DashboardDomainUrl: 't',
      LMKToplineInsurance: '',
      LMKToplineWool: '',
      LMKToplineLivestock: '',
      ProcessID: '',
      AppType: '',
      AppName: '',
      VisibilityKey: '',
      InsuranceAgent: '',
      WoolAgent: '',
      LivestockAgent: '',
      UserRole: '',
    },
    signRoleKey: {
      vendor: '',
      buyer: '',
      agent: '',
    },
    signRoleClass: {
      vendor: '',
      buyer: '',
      agent: '',
    },
    ausPostApiKey: '',
    PolicyBundleId1: '1',
    PolicyBundleId: '4',
    GroupId: '1491',
    GroupId1: '1145',
    RoleIds: '357,93,365,356',
    secretCode: '',
    raygunAPIKey: '',
    raygunVersion: '1.0.0.0',
    userGridAppID: '920',
    userByRoleApiKey: '',
    saleProcessorRole: 'LMK_LSP',
    samlEndpointUrl: '',
    relayState: 'test',
    topLineReprtingRoles: '735,734,736',
    lsaroles: '640',
    LMK_Buyer_RoleID: '645',
    LMK_LiveStockSalesAgent_RoleID: '751',
    LMK_SpecialRoles: '754',
    logoutUrl: '',
  },
  socialLinks: {
    linkedIn: '',
    instagram: '',
    facebook: '',
    twitter: '' /* old */,
  },
  regex: {
    phone: '^[+]?[6][1](?:\\s?\\d){9}$|^[(][0][1-9][)](?:\\s?\\d){8}$|^[0][1-9](?:\\s?\\d){8}$',
    password: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$',
    email:
      /([-!#-*+/-9=?A-Z^-~]+(\.[-!#-*+/-9=?A-Z^-~]+)*|([]!#-[^-~ \t]|(\\[\t -~]))+)@[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?(\.[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?)+/,
  },
  saleTriggerRole: ['lmklivestocksalesadmin', 'lmklivestockconfigmgmt', 'lmklivestocksales'],
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
