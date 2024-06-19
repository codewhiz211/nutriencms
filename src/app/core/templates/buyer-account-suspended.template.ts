import { UserProfile } from '../models/user-profile.model';

export const buyerAccountSuspendedEmailBody = (user: UserProfile, data: any) => {
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
            The Nutrien Livestock Buyer Account <strong>${data.sapNumber} ${data.tradingName}</strong> has been suspended.
          </font>
        </td>
      </tr>
      <tr>
        <td style="padding:5px 0px;">
          <font style="font-family:Arial, Helvetica, sans-serif;font-size:14px;">
            Please contact <a href="https://www.landmark.com.au/find-a-branch" target="_blank">your local Nutrien branch</a> for more information.
          </font>
        </td>
      </tr>
      <tr>
    </table>
`
}