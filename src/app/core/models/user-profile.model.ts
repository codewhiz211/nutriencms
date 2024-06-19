export interface UserProfile {
  FirstName?: string;
  LastName?: string;
  MiddleName?: string;
  UserName?: string; // email = username
  EmailAddress?: string;
  Mobile?: string;
  PhoneNumber?: string;
  UserStatus?: string;
  Address?: string;
  City?: string;
  Country?: string;
  CountryName?: string;
  ProfilePhoto?: string;
  State?: string;
  StateName?: string;
  TemperatureFormat?: string;
  TimeFormat?: string;
  ZipCode?: string;
  APIKey?: string;
  CreatedDate?: Date | string;
  LastModifiedDate?: Date | string;
}