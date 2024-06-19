import { environment } from '@env/environment';

export function getTemplate(webUrlRoot: string, name: string) {
  const links = environment.socialLinks;
  const userProfileLink = environment.Setting.webUrlRoot+'/profile';
  return `
  <!-- Remove Email body and use a base template for full emailbody -->
  <table cellpadding="0" cellspacing="0" width="556">
  <tr>
    <td style="padding:10px 0px;">
      <font style="font-family:Arial, Helvetica, sans-serif;font-size:14px;">Hi <span style="text-transform: capitalize;">${name},</span></font>
    </td>
  </tr>
  <tr>
    <td style="padding:5px 0px;">
      <font style="font-family:Arial, Helvetica, sans-serif;font-size:14px;">
      Your Nutrien E-Saleyard account has been successfully created. You now have access to view all listing pricing and can save listings you're interested in to a personalized watchlist. If you want to add a Nutrien account number to your account, please add it from your <a href="${userProfileLink}" style="color: '#226398'"> account page </a> or <a href="https://www.landmark.com.au/find-a-branch" style="text-decoration: underline; color: '#226398'"> get in touch with your local Nutrien branch </a> to begin placing bids! 
      </font>
    </td>
  </tr>

</table>

`;

}
