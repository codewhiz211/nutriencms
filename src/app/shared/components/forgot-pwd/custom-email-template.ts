import { environment } from '@env/environment';
import * as CryptoJS from 'crypto-js';


export function forgotPasswordTemplate(webUrlRoot: string,name:any) {
 
  const links = environment.socialLinks;
  
  const now= CryptoJS.AES.encrypt((new Date()).toUTCString(),environment.Setting.secretCode);
  const params=now.toString()

  return `
          <table cellpadding="0" cellspacing="0" width="556">
            <tr>
              <td style="padding:10px 0px;">
                <font style="font-family:Arial, Helvetica, sans-serif;font-size:14px;">Hi <span style="text-transform: capitalize;">${name},</span></font>
              </td>
            </tr>
            <tr>
              <td style="padding:5px 0px;">
                <font style="font-family:Arial, Helvetica, sans-serif;font-size:14px;">We've received a request to update your  Nutrien password. If this is correct,
                 please use the following code <strong>xxxActivationCodexxx</strong> to update  <span><a href="${webUrlRoot}/auth/reset-password/?ids=${encodeURIComponent(params)}" style="text-decoration: underline;color:blue;">here</a>.</span></font>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0px;">
                <font style="font-family:Arial, Helvetica, sans-serif;font-size:14px;"><span>If you didn't request this change please contact your Nutrien System Administrator.</span></font>
              </td>
            </tr>
          </table>       
`;

}
