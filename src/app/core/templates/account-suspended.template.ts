import { UserProfile } from '../models/user-profile.model';
export const accountSuspendedEmailBody = (user: UserProfile) => {
  return `
  <table cellpadding="0" cellspacing="0" width="556">
  <tr>
    <td style="padding:10px 0px;">
      <font style="font-family:Arial, Helvetica, sans-serif;font-size:14px;">Hi ${user.FirstName},</font>
    </td>
  </tr>
  <tr>
    <td style="padding:5px 0px;">          
      <font style="font-family:Arial, Helvetica, sans-serif;font-size:14px;"> Your Nutrien E-Saleyard account has been suspended,
       please contact your local Nutrien branch for more information.</font>
    </td>
  </tr>
</table>
  `
}