import { UserProfile } from '../models/user-profile.model';
import { environment } from '@env/environment';
export const buyerAccountApprovedEmailBody = (user: UserProfile, data: any) => {
  const webUrlRoot = environment.Setting.webUrlRoot;
  return `
    <table cellpadding="0" cellspacing="0" width="556">
      <tr>
        <td style="padding:10px 0px;">
          <font style="font-family:Arial, Helvetica, sans-serif;font-size:14px;">Hi ${user.FirstName},</font>
        </td>
      </tr>
      <tr>
        <td style="padding:5px 0px;">
          <font style="font-family:Arial, Helvetica, sans-serif;font-size:14px;">Your Nutrien Account Number <strong>${data.sapNumber}</strong> & <strong>${data.tradingName}</strong> 
            has been approved for use on the E-Saleyard.</font>
            <font style="font-family:Arial, Helvetica, sans-serif;font-size:14px;">
            You can now <a href="${webUrlRoot}/auth/login" target="_blank">login</a> and 
            <a href="${webUrlRoot}/bid-offer-listing" target="_blank">start bidding</a>.
          </font>
        </td>
      </tr>
    </table>
  `
}