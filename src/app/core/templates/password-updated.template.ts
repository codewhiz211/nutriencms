//import { UserProfile } from '@app/shared/models/user-profile.model'

export const passwordUpdatedEmailBody = (user: any) => {
  return `
  <table cellpadding="0" cellspacing="0" width="556">
    <tr>
    <td style="padding:10px 0px;">
      <font style="font-family:Arial, Helvetica, sans-serif;font-size:14px;">Hi ${user.FirstName},</font>
    </td>
    </tr>
    <tr>
    <td style="padding:5px 0px;">
      <font style="font-family:Arial, Helvetica, sans-serif;font-size:14px;">Your password has been successfully changed on your Nutrien account.
      </font>
    </td>
    </tr>
    <tr>
      <td style="padding:5px 0px;">
      <font style="font-family:Arial, Helvetica, sans-serif;font-size:14px;">
      If you didn't request this change, please contact your Nutrien System Administrator</a>.
      </font>
      </td>
    </tr>
  </table>
  `;
}