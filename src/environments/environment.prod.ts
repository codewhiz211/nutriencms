// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`. devops try2

export const environment = {
  timeStamp: '21.6.28.18',
  production: true,
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
    AdminViewAccessToken: '',
    C2MIceAPIUrl: window['env']['C2MIceAPIUrl'] || '',
    BaseAPIUrl: window['env']['BaseAPIUrl'] || '',
    eSaleyardApiUrl: window['env']['eSaleyardApiUrl'] || '',
    LoginAPIUrl: window['env']['LoginAPIUrl'] || '',
    C2M_Console_URL: window['env']['C2M_Console_URL'] || '',
    C2M_MediaApp_Url: window['env']['C2M_MediaApp_Url'] || '',
    C2M_Console_API_URL: window['env']['C2M_Console_API_URL'] || '',
    BaseAPIUrlLmk: window['env']['BaseAPIUrlLmk'] || '',
    webUrlRoot: window['env']['webUrlRoot'] || '',
    mediaUrl: window['env']['mediaUrl'] || '',
    buyerFARoles: window['env']['buyerFARoles'] || '',
    dashboard: {
      GatewayUrl: window['env']['dashboard_GatewayUrl'] || '',
      DashboardDomainUrl: window['env']['dashboard_DashboardDomainUrl'] || '',
      LMKToplineInsurance: window['env']['dashboard_LMKToplineInsurance'] || '',
      LMKToplineWool: window['env']['dashboard_LMKToplineWool'] || '',
      LMKToplineLivestock: window['env']['dashboard_LMKToplineLivestock'] || '',
      ProcessID: window['env']['dashboard_ProcessID'] || '',
      AppType: window['env']['dashboard_AppType'] || '',
      AppName: window['env']['dashboard_AppName'] || '',
      VisibilityKey: window['env']['dashboard_VisibilityKey'] || '',
      InsuranceAgent: window['env']['dashboard_InsuranceAgent'] || '',
      WoolAgent: window['env']['dashboard_WoolAgent'] || '',
      LivestockAgent: window['env']['dashboard_LivestockAgent'] || '',
      UserRole: window['env']['dashboard_UserRole'] || '',
    },
    signRoleKey: {
      vendor: window['env']['signRoleKey_vendor'] || '',
      buyer: window['env']['signRoleKey_buyer'] || '',
      agent: window['env']['signRoleKey_agent'] || '',
    },
    signRoleClass: {
      vendor: window['env']['signRoleClass_vendor'] || '',
      buyer: window['env']['signRoleClass_buyer'] || '',
      agent: window['env']['signRoleClass_agent'] || '',
    },
    PolicyBundleId1: window['env']['PolicyBundleId1'] || '',
    PolicyBundleId: window['env']['PolicyBundleId'] || '',
    GroupId: window['env']['GroupId'] || '',
    GroupId1: window['env']['GroupId1'] || '',
    RoleIds: window['env']['RoleIds'] || '',
    secretCode: window['env']['secretCode'] || '',
    raygunAPIKey: window['env']['raygunAPIKey'] || '',
    raygunVersion: window['env']['raygunVersion'] || '',
    userGridAppID: window['env']['userGridAppID'] || '',
    userByRoleApiKey: window['env']['userByRoleApiKey'] || '',
    saleProcessorRole: window['env']['saleProcessorRole'] || '',
    samlEndpointUrl: window['env']['samlEndpointUrl'] || '',
    relayState: window['env']['relayState'] || '',
    topLineReprtingRoles: window['env']['topLineReprtingRoles'] || '',
    lsaroles: window['env']['lsaroles'] || '',
    LMK_Buyer_RoleID: window['env']['LMK_Buyer_RoleID'] || '',
    LMK_LiveStockSalesAgent_RoleID: window['env']['LMK_LiveStockSalesAgent_RoleID'] || '',
    LMK_SpecialRoles: window['env']['LMK_SpecialRoles'] || '',
    logoutUrl: window['env']['logoutUrl'] || '',
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
