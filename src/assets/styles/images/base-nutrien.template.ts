import { environment } from '@env/environment';
export const generateNuterienEmailHtml = (body: string = null,url:string=null) => {
    const webUrlRoot = environment.Setting.webUrlRoot;
    const links = environment.socialLinks;
    //url="https://lmkstaging2-wf.c2m.net"
    return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <link rel="icon" type="image/x-icon" href="msc-images/favicon.ico" />
        <link rel="apple-touch-icon" type="image/x-icon" href="msc-images/favicon.ico" />
        <title>Admin Portal</title>
      </head>
      <style>
      a { color:#000000;}
      table, tr, td {border-collapse:collapse;}
      tr { font-size:0px; border-collapse:collapse;}
  
      </style>
      <body style="color:#5b5b5b;margin:0px;padding:20px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:20px;color:#333;">
        <table style="width:600px;border:0;color:#333;margin:auto;" cellpadding="0" cellspacing="0">
          <tr>
          <td style="width:556px;padding:10px 20px;border:0;background-color:#000000; ">
              <table cellpadding="0" cellspacing="0" style="width:556px;">
                <tr>
                  <td valign="middle" style="width:140px;">
                    <a href="#"><img src="${url}/assets/styles/images/Nutrien-Ag-Solutions-white.png" width="134" alt="Nutrien" title="Nutrien" border="0" /></a>                </td>
                  <td valign="middle" style="width:20px;">
                  </td>
                  <td valign="middle" style="width:280px;">
                    <font style="font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#fff;"><strong>ADMIN PORTAL</strong></font>
                  </td>
                  <td align="right" valign="middle">
                  <table cellpadding="0" cellspacing="0">
                  <tr>
                     <td align="right" style="width:30px;"> 
                      <a href="${links.facebook}"><img src="${webUrlRoot}/assets/styles/images/facebook.gif" style="height:20px;width:20px;display:block;" height="20"width="20" alt="facebook" title="facebook" border="0"/></a>
                      </td>
                      <!--  <td align="right" style="width:30px;"> 
                      <a href="${links.twitter}"><img src="${webUrlRoot}/assets/styles/images/twitter.gif" style="height:20px;width:20px;display:block;" height="20"width="20" alt="twitter" title="twitter" border="0"/></a>
                      </td> -->
                      <td align="right" style="width:30px;"> 
                          <a href="${links.instagram}"><img src="${webUrlRoot}/assets/styles/images/instagram.gif" style="height:20px;width:20px;display:block;" height="20"width="20" alt="instagram" title="instagram" border="0"/></a>
                      </td>
                      <td align="right" style="width:30px;"> 
                      <a href="${links.linkedIn}"><img src="${webUrlRoot}/assets/styles/images/linkedin.gif" style="height:20px;width:20px;display:block;" height="20"width="20" alt="linkedin" title="linkedin" border="0"/></a>
                      </td>
                  </tr>
                  </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="width:556px; padding:22px; padding-bottom:0px;"></td>
          </tr>
          <tr>
            <td align="center">
              ${body}
            </td>
          </tr>
          <tr>
            <td align="left" style="padding:0px;margin:0px;padding-top:12px;padding-bottom:13px;padding-left:22px;padding-right:22px;">
              <font style="font-family:Arial, Helvetica, sans-serif;font-size:14px;">Thank you,<br /><strong>The Nutrien Team</strong></font>
            </td>
          </tr>
          <tr>
            <td style="width:556px; padding:22px; padding-bottom:0px;"></td>
          </tr>
          <tr>
          <td style="width:560px;padding:8px 20px;background-color:#333333;color:#fff;text-align:center;">
          <table cellpadding="0" cellspacing="0" width="560">
            <tr>
              <td align="left" style="padding:10px 0px;width:360px;">
                <font style="font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#fff;">&copy; Copyright ${(new Date()).getFullYear()} Nutrien Ag Solutions, Inc.</font>
              </td>
            
            </tr>
          </table>
        </td>
          </tr>
        </table>
      </body>
    </html>
    `;
  };
  