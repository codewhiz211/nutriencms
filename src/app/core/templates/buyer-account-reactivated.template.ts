import { UserProfile } from '../models/user-profile.model';

export const buyerAccountReactivatedEmailBody = (user: UserProfile, data: any) => {
  return `
    <table cellpadding="0" cellspacing="0" width="556">
      <tr>
        <td style="padding:10px 0px;">
          <font style="font-family:Arial, Helvetica, sans-serif;font-size:14px;">Hi ${user.FirstName},</font>
        </td>
      </tr>
      <tr>
        <td style="padding:5px 0px;">
          <font style="font-family:Arial, Helvetica, sans-serif;font-size:14px;">
            The Nutrien Livestock Buyer Account <strong>${data.sapNumber} ${data.tradingName}</strong> is now active for purchasing livestock.
          </font>
        </td>
      </tr>
      <tr>
    </table>
  `
}