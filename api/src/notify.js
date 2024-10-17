const { Notifire, ChannelTypeEnum } = require("@notifire/core");
const { SendgridEmailProvider } = require("@notifire/sendgrid");
const { SESEmailProvider } = require("@notifire/ses");
const { NodemailerProvider } = require("@notifire/nodemailer");

// eslint-disable-next-line no-unused-vars
module.exports = async (config, logger, datastore, _utilities) => {
  const notifire = new Notifire();
  const { getSystemConfig } = datastore;

  function templateToHtml(subject, body) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js"></script>
        <style>
        body{
            margin:10px !important;
        }
    </style>
    </head>
        <body>
        <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td width="600" align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" >
        <tr>
            <td style="text-align: center; width="100%" align="center">
            <img height="150px" src="https://firebasestorage.googleapis.com/v0/b/thoughtcast-magic.appspot.com/o/logo%20(1).png?alt=media" />
            <h1 style="text-align: center;">
            <b>
            ${subject}
            </b>
            </h1>
            <div style="text-align: left;width:100%;">
            <p>
            ${body}
            </p>
            </div>
            </td>
        </tr>
    </table>
    </td>
    </tr>
    </table>
        </body>
    </html>`;
  }

  // Register Outbound Email provider
  if (config.email?.provider === null) {
    logger.warn("No outbound email provider is configured");
  } else {
    switch (config.email?.provider) {
      case "ses":
        await notifire.registerProvider(
          new SESEmailProvider({
            region: config.email.ses_region,
            accessKeyId: config.email.ses_access_key,
            secretAccessKey: config.email.ses_secret_key,
            from: config.email.reply_address,
          })
        );
        logger.info(
          {
            provider: config.email.provider,
            region: config.email.ses_region,
            access_key: config.email.ses_access_key,
            secret_key: config.email.ses_secret_key,
            reply_to: config.email.reply_address,
          },
          "Registered outbound email provider"
        );
        break;
      case "sendgrid":
        await notifire.registerProvider(
          new SendgridEmailProvider({
            apiKey: config.email.sendgrid_api_key,
            from: config.email.reply_address,
            reply_to: config.email.reply_address,
          })
        );
        logger.warn(
          {
            provider: config.email.provider,
            apiKey: config.email.sendgrid_api_key,
          },
          "Registered outbound email provider"
        );
        break;
      case "nodemailer":
        await notifire.registerProvider(
          new NodemailerProvider({
            from: config.email.nodemailer_from,
            host: config.email.nodemailer_host,
            user: config.email.nodemailer_user,
            password: config.email.nodemailer_password,
            port: config.email.nodemailer_port,
            secure: config.email.nodemailer_secure,
          })
        );
        break;
      default:
        logger.warn(
          { provider: config.email?.provider },
          "Unrecognized outbound email provider"
        );
        break;
    }
  }

  // Register outbound message templates
  // eslint-disable-next-line no-unused-vars
  const _passwordResetTemplate = await notifire.registerTemplate({
    id: "password-reset",
    messages: [
      {
        subject: "ThoughtCast Portal - Password Reset",
        channel: ChannelTypeEnum.EMAIL,
        template: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js"></script>
            <style>
            body{
                margin:10px !important;
            }
        </style>
        </head>
            <body>
            <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td width="600" align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" >
            <tr>
                <td style="text-align: center; width="100%" align="center">
                <img height="150px" src="https://firebasestorage.googleapis.com/v0/b/thoughtcast-magic.appspot.com/o/logo%20(1).png?alt=media" />
                <h1 style="text-align: center;">
                <b>ThoughtCast Portal - Password Reset </b>
                </h1>
                <div style="text-align: left;width:100%;">
                <p><h4>Dear {{firstName}},</h4>
        <p>You just recently requested a password reset from the ThoughtCast Magic Portal. If you requested to reset your password, click on the link below to do so. If not, just ignore and/or delete this message.</p>
        <p>As always, if you need any help, email <a href='mailto:support@thoughtcastmagic.com?subject=Need Help With Password Reset'>support@thoughtcastmagic.com</a> or just hit reply to this email and we'll be sure to help you out as soon as possible.</p>
        <p><a href="{{resetLink}}">Click here to reset your password</a></p>
        <p>If you don’t click the link below in 24 hours from receiving this email, the link will expire and you will have to reset your password again from the portal and obtain a new link</p>
        <p>Thank You</p>
        <p>Customer Support</p>
        <p>Team {{instanceName}}</p>
        </p>
            </div>
            </td>
        </tr>
    </table>
    </td>
    </tr>
    </table>
        </body>
    </html>`,
      },
    ],
  });

  // Send Welcome email templates
  // eslint-disable-next-line no-unused-vars
  const _welcomePasswordCreateTemplate = await notifire.registerTemplate({
    id: "welcome-mail",
    messages: [
      {
        subject: "ThoughtCast Magic - Welcome!",
        channel: ChannelTypeEnum.EMAIL,
        template: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js"></script>
            <style>
            body{
                margin:10px !important;
            }
        </style>
        </head>
            <body>
            <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td width="600" align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" >
            <tr>
                <td style="text-align: center; width="100%" align="center">
                <img height="150px" src="https://firebasestorage.googleapis.com/v0/b/thoughtcast-magic.appspot.com/o/logo%20(1).png?alt=media" />
                <h1 style="text-align: center;">
                <b>
                ThoughtCast Portal - Welcome to the portal
                </b>
                </h1>
                <div style="text-align: left;width:100%;">
                <p>
                    <h4>Hi {{firstName}}</h4> 
                    <p>You have been added as a user on the ThoughtCast Magic Portal. Please click the link below to set your password and login your account.</p>
                    <p>Now that your account is activated, you can visit <a href='https://www.thoughtcastmagic.com/portal' target='_blank'>thoughtcastmagic.com/portal</a> to view your purchases, purchase other effects from us, as well as access all of your instructions for any effects you have purchased.  Also, this username and password are the same ones you will use to log into the various ThoughtCast Magic apps you have purchased.</p>
                    <br>
                    <p><a href="{{createPasswordLink}}"> {{createPasswordLink}}</a></p>
                    <br>
                    <p>If you click the link and get a 'Link Expired' error, just visit the <a href='https://thoughtcastowners.com/forgotpassword'>portal by clicking here</a> and perform a password reset, this will send you a fresh link and allow you to set a new password.</p>
                    <p>As always, if you need any help, email <a href='mailto:support@thoughtcastmagic.com?subject=Need Help With New Account'>support@thoughtcastmagic.com</a> or just hit reply to this email and we'll be sure to help you out as soon as possible.</p>
                    <p>Thanks again, and welcome to {{instanceName}}!</p>
                </p>
                </div>
                </td>
            </tr>
        </table>
        </td>
        </tr>
        </table>
            </body>
        </html>`,
      },
    ],
  });

  // welcome email if user register themselves in our site
  const _WelcomeEmailUserRegisterSelf = await notifire.registerTemplate({
    id: "welcome-mail-user-register-self",
    messages: [
      {
        subject: "ThoughtCast Portal - New Account Activated",
        channel: ChannelTypeEnum.EMAIL,
        template: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js"></script>
            <style>
            body{
                margin:10px !important;
            }
        </style>
        </head>
            <body>
            <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td width="600" align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" >
            <tr>
                <td style="text-align: center; width="100%" align="center">
                <img height="150px" src="https://firebasestorage.googleapis.com/v0/b/thoughtcast-magic.appspot.com/o/logo%20(1).png?alt=media" />
                <h1 style="text-align: center;">
                <b>
                    ThoughtCast Portal - New Account Activated
                </b>
                </h1>
                <div style="text-align: left;width:100%;">
                <p>
                    <h4>Dear {{firstName}},</h4>
            <p>Thanks for activating your ThoughtCast Magic account. From now on, you can visit <a href='https://www.thoughtcastmagic.com/portal' target='_blank'>thoughtcastmagic.com/portal</a> to view your purchases, purchase other effects from us, as well as access all of your instructions for any effects you have purchased.  Also, this username and password are the same ones you will use to log into the various ThoughtCast Magic apps you have purchased.</p>
            <p>As always, if you need any help, email <a href='mailto:support@thoughtcastmagic.com?subject=Need Help With New Account Activation'>support@thoughtcastmagic.com</a> or just hit reply to this email and we'll be sure to help you out as soon as possible.</p>
            <h3>Products Activated:</h3>{{products}} {{subscriptions}}
            <p>Thank You</p>
            <p>Team {{instanceName}}</p>
                </p>
                </div>
                </td>
            </tr>
        </table>
        </td>
        </tr>
        </table>
            </body>
        </html>`,
      },
    ],
  });

  // subscription renew mail template
  await notifire.registerTemplate({
    id: "subscription-renew-mail",
    messages: [
      {
        subject: "ThoughtCast Portal - Subscription Renewal Alert",
        channel: ChannelTypeEnum.EMAIL,
        template: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js"></script>
            <style>
            body{
                margin:10px !important;
            }
        </style>
        </head>
            <body>
            <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td width="600" align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" >
            <tr>
                <td style="text-align: center; width="100%" align="center">
                <img height="150px" src="https://firebasestorage.googleapis.com/v0/b/thoughtcast-magic.appspot.com/o/logo%20(1).png?alt=media" />
                <h1 style="text-align: center;">
                <b>
                    ThoughtCast Portal - Subscription Renewal Alert
                </b>
                </h1>
                <div style="text-align: left;width:100%;">
                <p>
                    <h4>Dear {{firstName}},</h4>
                    <p>This is just a friendly reminder that the subscriptions listed below will renew in 5 days. Your billing information in the portal is up to date, so you don't need to do anything.</p>
                    <p>If you want to make any changes to your subscriptions, you can do so from the portal at <a href='https://www.thoughtcastmagic.com/portal' target='_blank'>thoughtcastmagic.com/portal</a></p>
                    <p>As always, if you need any help, email support@thoughtcastmagic.com or just hit reply to this email and we'll be sure to help you out as soon as possible.</p>
                    <h3>Subscription Renewals:<br/><br/></h3>{{product}}
                    <p>Thank You</p>
                    <p>Team {{instanceName}}</p>
                </p>
                </div>
                </td>
            </tr>
        </table>
        </td>
        </tr>
        </table>
            </body>
        </html>`,
      },
    ],
  });

  // subscription renewed successfully mail template
  await notifire.registerTemplate({
    id: "subscription-renewed-successfully",
    messages: [
      {
        subject: "ThoughtCast Portal - Subscription Renewed Successfully",
        channel: ChannelTypeEnum.EMAIL,
        template: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js"></script>
            <style>
            body{
                margin:10px !important;
            }
        </style>
        </head>
            <body>
            <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td width="600" align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" >
            <tr>
                <td style="text-align: center; width="100%" align="center">
                <img height="150px" src="https://firebasestorage.googleapis.com/v0/b/thoughtcast-magic.appspot.com/o/logo%20(1).png?alt=media" />
                <h1 style="text-align: center;">
                <b>
                    ThoughtCast Portal - Subscription Renewed Successfully
                </b>
                </h1>
                <div style="text-align: left;width:100%;">
                <p>
                    <h4>Dear {{firstName}},</h4>
            <p>Your ThoughtCast subscriptions (listed below) have renewed successfully! Enjoy performing your ThoughtCast Magic effects and thanks for supporting us!</p>
            <p>The feature you just ordered should now be in your app (like magic). If the feature or upgrade you just ordered is not present in your app, go to the bottom of the Settings page, tap 'Deactivate', and log into the app again, or delete the app and log in again.</p>
            <p>As always, if you need any help, email support@thoughtcastmagic.com or just hit reply to this email and we'll be sure to help you out as soon as possible.</p>
            <h3>Subscription Renewed:<br/><br/></h3>
             {{product}}
            <p>Thank You</p>
            <p>Team {{instanceName}}</p>
                </p>
                </div>
                </td>
            </tr>
        </table>
        </td>
        </tr>
        </table>
            </body>
        </html>`,
      },
    ],
  });

  // Stripe default payment method not set mail template
  await notifire.registerTemplate({
    id: "stripe-default-payment-not-set",
    messages: [
      {
        subject:
          "ThoughtCast Portal - Subscription Renewal Alert - Need Updated Payment Info",
        channel: ChannelTypeEnum.EMAIL,
        template: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js"></script>
            <style>
            body{
                margin:10px !important;
            }
        </style>
        </head>
            <body>
            <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td width="600" align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" >
            <tr>
                <td style="text-align: center; width="100%" align="center">
                <img height="150px" src="https://firebasestorage.googleapis.com/v0/b/thoughtcast-magic.appspot.com/o/logo%20(1).png?alt=media" />
                <h1 style="text-align: center;">
                <b>
                    ThoughtCast Portal - Subscription Renewal Alert - Need Updated Payment Info
                </b>
                </h1>
                <div style="text-align: left;width:100%;">
                <p>
                    <h4>Dear {{firstName}},</h4>
            <p>This is a notice that your billing information is not able to be processed, and the subscriptions listed below will NOT renew in 5 days if you do not update your billing information.</p>
            <p>You can access your billing information in the owners portal to make any changes to your subscription, you can do so from the portal at <a href='https://www.thoughtcastmagic.com/portal' target='_blank'>thoughtcastmagic.com</a>.</p>
            <p>As always, if you need any help, email <a href='mailto:support@thoughtcastmagic.com?subject=Need Help With Subscription Renewal'>support@thoughtcastmagic.com</a> or just hit reply to this email and we'll be sure to help you out as soon as possible.</p>
            <h3>Subscription Renewed:<br/><br/></h3>
            {{product}}
            <p>Thank You</p>
            <p>Team {{instanceName}}</p>
                </p>
                </div>
                </td>
            </tr>
        </table>
        </td>
        </tr>
        </table>
            </body>
        </html>`,
      },
    ],
  });

  // user code redeem mail template
  await notifire.registerTemplate({
    id: "user-code-redeem",
    messages: [
      {
        subject: "ThoughtCast Portal - Code Redeemed Successfully",
        channel: ChannelTypeEnum.EMAIL,
        template: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js"></script>
            <style>
            body{
                margin:10px !important;
            }
        </style>
        </head>
            <body>
            <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td width="600" align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" >
            <tr>
                <td style="text-align: center; width="100%" align="center">
                <img height="150px" src="https://firebasestorage.googleapis.com/v0/b/thoughtcast-magic.appspot.com/o/logo%20(1).png?alt=media" />
                <h1 style="text-align: center;">
                <b>
                    ThoughtCast Portal - Code Redeemed Successfully
                </b>
                </h1>
                <div style="text-align: left;width:100%;">
                <p>
                    <h4>Dear {{firstName}},</h4>
            <p>This email is to confirm you have activated the following products with the code <b>{{redeemCode}}</b></p>
            <p>If you have any questions, just hit reply to this email and we will help you out as soon as possible.</p >
            <h3>Products Activated:<br/><br/></h3>
            {{products}}
            {{subscriptions}}
            <p>Thank You</p>
            <p>Team {{instanceName}}</p>
                </p>
                </div>
                </td>
            </tr>
        </table>
        </td>
        </tr>
        </table>
            </body>
        </html>`,
      },
    ],
  });

  // shopify user already exists welcome  mail template
  await notifire.registerTemplate({
    id: "shopify-user-welcome-mail-exists",
    messages: [
      {
        subject: "ThoughtCast Portal - Product Activation",
        channel: ChannelTypeEnum.EMAIL,
        template: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js"></script>
            <style>
            body{
                margin:10px !important;
            }
        </style>
        </head>
            <body>
            <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td width="600" align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" >
            <tr>
                <td style="text-align: center; width="100%" align="center">
                <img height="150px" src="https://firebasestorage.googleapis.com/v0/b/thoughtcast-magic.appspot.com/o/logo%20(1).png?alt=media" />
                <h1 style="text-align: center;">
                <b>
                    ThoughtCast Portal - Product Activation
                </b>
                </h1>
                <div style="text-align: left;width:100%;">
                <p>
                    <h4>Dear {{firstName}},</h4>
            <p>Thank you for your purchase from ThoughtCast Magic. For the items in your most recent order </p>
            <h3>INV{{orderName}}</h3>
            <p>We have found your account in our system and activated your products automatically. Please log into https://thoughtcastmagic.com/portal to find the instructions for any products you have just purchased.</p>
            <p>As always, if you need any help, email <a href='mailto:support@thoughtcastmagic.com?subject=Need Help With New Product Activation'>support@thoughtcastmagic.com</a> or just hit reply to this email and we'll be sure to help you out as soon as possible.</p>
            <p>Thank You</p>
            <p>Team {{instanceName}}</p>
                </p>
                </div>
                </td>
            </tr>
        </table>
        </td>
        </tr>
        </table>
            </body>
        </html>`,
      },
    ],
  });

  // shopify user welcome  mail template
  await notifire.registerTemplate({
    id: "shopify-user-welcome-mail",
    messages: [
      {
        subject: "ThoughtCast Portal - New Account Product Activation",
        channel: ChannelTypeEnum.EMAIL,
        template: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js"></script>
            <style>
            body{
                margin:10px !important;
            }
        </style>
        </head>
            <body>
            <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td width="600" align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" >
            <tr>
                <td style="text-align: center; width="100%" align="center">
                <img height="150px" src="https://firebasestorage.googleapis.com/v0/b/thoughtcast-magic.appspot.com/o/logo%20(1).png?alt=media" />
                <h1 style="text-align: center;">
                <b>
                    ThoughtCast Portal - New Account Product Activation
                </b>
                </h1>
                <div style="text-align: left;width:100%;">
                <p>
                    <h4>Dear {{firstName}},</h4>
            <p>Thank you for your purchase from ThoughtCast Magic. For the items in your most recent order </p>
            <h3>INV{{orderName}}</h3>
            <p>We could not find an account in our system with your matching email address, so an account has been made for you and your products have been activated automatically. Please click the link below to set your password, then log in to our user portal to view the instructions for any products you have just purchased.</p>
            <br><p><a href='{{resetPasswordLink}}'>{{resetPasswordLink}}</a></p><br>
            <p>You do NOT need to activate your products with a code, they are already active on your account. All you need to do is set your password, and you will have immediate access to them on both our portal (for instructions) and the apps themselves (using the same email and password for login).</p>
            <br>
            <p>The link above is active for 24 hours. If you click the link and get a 'Link Expired' error, just visit the portal by <a href='https://thoughtcastowners.com/forgotpassword' target='_blank'>clicking here </a>  and perform a password reset, this will send you a fresh link and allow you to set a new password.</p>
            <br>
            <p>As always, if you need any help, email <a href='mailto:support@thoughtcastmagic.com?subject=Need Help With New Account Product Activation'>support@thoughtcastmagic.com</a> or just hit reply to this email and we'll be sure to help you out as soon as possible.</p>
            <p>Thank You</p>
            <p>Team {{instanceName}}</p>
                </p>
                </div>
                </td>
            </tr>
        </table>
        </td>
        </tr>
        </table>
            </body>
        </html>`,
      },
    ],
  });

  // stripe subscription activated mail template
  await notifire.registerTemplate({
    id: "stripe-subscription-activated",
    messages: [
      {
        subject: "ThoughtCast Portal - Subscription Activated Successfully",
        channel: ChannelTypeEnum.EMAIL,
        template: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js"></script>
            <style>
            body{
                margin:10px !important;
            }
        </style>
        </head>
            <body>
            <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td width="600" align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" >
            <tr>
                <td style="text-align: center; width="100%" align="center">
                <img height="150px" src="https://firebasestorage.googleapis.com/v0/b/thoughtcast-magic.appspot.com/o/logo%20(1).png?alt=media" />
                <h1 style="text-align: center;">
                <b>
                    ThoughtCast Portal - Subscription Activated Successfully
                </b>
                </h1>
                <div style="text-align: left;width:100%;">
                <p>
                    <h4>Dear {{firstName}},</h4>
            <p>Your ThoughtCast subscriptions (listed below) have activated successfully! Enjoy performing your ThoughtCast Magic effects and thanks for supporting us!</p>
            <p>The feature you just ordered should now be in your app (like magic). If the feature or upgrade you just ordered is not present in your app, go to the bottom of the Settings page, tap 'Deactivate', and log into the app again, or delete the app and log in again.</p>
            <p>As always, if you need any help, email <a href='mailto:support@thoughtcastmagic.com?subject=Need Help With Subscription Activation'>support@thoughtcastmagic.com</a> or just hit reply to this email and we'll be sure to help you out as soon as possible.</p>
            <h3>Subscription Activated:<br/><br/></h3>
            {{product}}
            <p>Thank You</p>
            <p>Team {{instanceName}}</p>
                </p>
                </div>
                </td>
            </tr>
        </table>
        </td>
        </tr>
        </table>
            </body>
        </html>`,
      },
    ],
  });

  // stripe subscription scheduled mail template
  await notifire.registerTemplate({
    id: "stripe-subscription-scheduled",
    messages: [
      {
        subject: "ThoughtCast Portal - Subscription Scheduled Successfully",
        channel: ChannelTypeEnum.EMAIL,
        template: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js"></script>
            <style>
            body{
                margin:10px !important;
            }
        </style>
        </head>
            <body>
            <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td width="600" align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" >
            <tr>
                <td style="text-align: center; width="100%" align="center">
                <img height="150px" src="https://firebasestorage.googleapis.com/v0/b/thoughtcast-magic.appspot.com/o/logo%20(1).png?alt=media" />
                <h1 style="text-align: center;">
                <b>
                    ThoughtCast Portal - Subscription Scheduled Successfully
                </b>
                </h1>
                <div style="text-align: left;width:100%;">
                <p>
                    <h4>Dear {{firstName}},</h4>
            <p>Your ThoughtCast subscriptions (listed below) have scheduled to be renewed automatically! You should receive two reminders from us: one 5 days before renewal and one the day of renewal to confirm.</p>
            <p>As always, if you need any help, email <a href='mailto:support@thoughtcastmagic.com?subject=Need Help With Subscription Scheduled Renewal'>support@thoughtcastmagic.com</a> or just hit reply to this email and we'll be sure to help you out as soon as possible.</p>
            <h3>Subscription Activated:<br/><br/></h3>
            {{product}}
            <p>Thank You</p>
            <p>Team {{instanceName}}</p>
                </p>
                </div>
                </td>
            </tr>
        </table>
        </td>
        </tr>
        </table>
            </body>
        </html>`,
      },
    ],
  });

  // stripe subscription updated mail template
  await notifire.registerTemplate({
    id: "stripe-subscription-updated",
    messages: [
      {
        subject: "ThoughtCast Portal - Subscription Updated Successfully",
        channel: ChannelTypeEnum.EMAIL,
        template: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js"></script>
            <style>
            body{
                margin:10px !important;
            }
        </style>
        </head>
            <body>
            <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td width="600" align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" >
            <tr>
                <td style="text-align: center; width="100%" align="center">
                <img height="150px" src="https://firebasestorage.googleapis.com/v0/b/thoughtcast-magic.appspot.com/o/logo%20(1).png?alt=media" />
                <h1 style="text-align: center;">
                <b>
                    ThoughtCast Portal - Subscription Updated Successfully
                </b>
                </h1>
                <div style="text-align: left;width:100%;">
                <p>
                    <h4>Dear {{firstName}},</h4>
            <p>Your ThoughtCast subscriptions (listed below) have updated successfully!</p>
            <p>As always, if you need any help, email <a href='mailto:support@thoughtcastmagic.com?subject=Need Help With Subscription Update'>support@thoughtcastmagic.com</a> or just hit reply to this email and we'll be sure to help you out as soon as possible.</p>
            <h3>Subscription Activated:<br/><br/></h3>
            {{product}}
            <p>Thank You</p>
            <p>Team {{instanceName}}</p>
                </p>
                </div>
                </td>
            </tr>
        </table>
        </td>
        </tr>
        </table>
            </body>
        </html>`,
      },
    ],
  });

  // Helper functions
  async function get_tenant_name() {
    // // get tenant basic info from system config, send param default false to user
    // const tenantInfo = await getSystemConfig(false);
    // const tenantName = tenantInfo.find((element) => element.name === 'instance_name');

    return "ThoughtCast Owners Portal";
  }

  async function send_password_reset({ email, firstName, resetLink }) {
    logger.info({ email }, "Sending password reset email");

    const instanceName = await get_tenant_name();

    await notifire
      .trigger("password-reset", {
        $user_id: email,
        $email: email,
        firstName,
        resetLink,
        instanceName,
      })
      .catch((err) => {
        logger.error({ email }, "Problem sending password reset email");
        logger.error(err);
      });
  }
  async function send_welcome_mail({ email, firstName, createPasswordLink }) {
    logger.info({ email }, "Sending welcome mail");

    const instanceName = await get_tenant_name();

    await notifire
      .trigger("welcome-mail", {
        $user_id: email,
        $email: email,
        firstName,
        createPasswordLink,
        instanceName,
      })
      .catch((err) => {
        logger.error({ email }, "Problem sending welcome mail");
        logger.error(err);
      });
  }

  async function senduser_register_self_welcome_mail({
    email,
    firstName,
    products,
    subscriptions,
  }) {
    logger.info({ email }, "Sending welcome mail use register self");

    const instanceName = await get_tenant_name();

    await notifire
      .trigger("welcome-mail-user-register-self", {
        $user_id: email,
        $email: email,
        firstName,
        instanceName,
        products: products ? products.join("<br/><br/>") : "",
        subscriptions: subscriptions
          ? "<br/><h3>Subscription Activated:</h3>" + subscriptions
          : "",
      })
      .catch((err) => {
        logger.error(
          { email },
          "Problem sending welcome mail use register self"
        );
        logger.error(err);
      });
  }

  async function send_subscription_renew_mail(email, firstName, product) {
    logger.info({ email }, "Sending susbcription renew mail");

    const instanceName = await get_tenant_name();

    await notifire
      .trigger("subscription-renew-mail", {
        $user_id: email,
        $email: email,
        firstName,
        instanceName,
        product,
      })
      .catch((err) => {
        logger.error({ email }, "Problem sending subscription renew mail");
        logger.error(err);
      });
  }

  async function send_subscription_renewed_successfully_mail(
    email,
    firstName,
    product
  ) {
    logger.info({ email }, "Sending susbcription renew successfully mail");

    const instanceName = await get_tenant_name();

    await notifire
      .trigger("subscription-renewed-successfully", {
        $user_id: email,
        $email: email,
        firstName,
        instanceName,
        product,
      })
      .catch((err) => {
        logger.error(
          { email },
          "Problem sending susbcription renew successfully mail"
        );
        logger.error(err);
      });
  }

  async function send_subscription_default_payment_not_set_mail(
    email,
    firstName,
    product
  ) {
    logger.info(
      { email },
      "Sending susbcription renew payment method not set mail"
    );

    const instanceName = await get_tenant_name();

    await notifire
      .trigger("stripe-default-payment-not-set", {
        $user_id: email,
        $email: email,
        firstName,
        instanceName,
        product,
      })
      .catch((err) => {
        logger.error(
          { email },
          "Problem sending susbcription renew payment method not set mail"
        );
        logger.error(err);
      });
  }

  async function send_user_code_redeem_mail({
    email,
    firstName,
    redeemCode,
    products,
    subscriptions,
  }) {
    logger.info({ email }, "Sending user code redeem mail");

    const instanceName = await get_tenant_name();

    await notifire
      .trigger("user-code-redeem", {
        $user_id: email,
        $email: email,
        firstName,
        instanceName,
        redeemCode,
        products: products ? products.join("<br/><br/>") : "",
        subscriptions: subscriptions
          ? "<br/><h3>Subscription Activated:</h3>" + subscriptions
          : "",
      })
      .catch((err) => {
        logger.error({ email }, "Problem sending user code redeem mail");
        logger.error(err);
      });
  }

  async function send_shopify_user_welcome_mail_exists({
    email,
    firstName,
    order,
  }) {
    logger.info({ email }, "Sending shopify user welcome mail exists");

    const instanceName = await get_tenant_name();

    await notifire
      .trigger("shopify-user-welcome-mail-exists", {
        $user_id: email,
        $email: email,
        firstName,
        instanceName,
        orderName: order?.name,
      })
      .catch((err) => {
        logger.error(
          { email },
          "Problem sending shopify user welcome mail exists"
        );
        logger.error(err);
      });
  }

  async function send_shopify_user_welcome_mail({
    email,
    firstName,
    order,
    resetPasswordLink,
  }) {
    logger.info({ email }, "Sending shopify user welcome mail exists");

    const instanceName = await get_tenant_name();

    await notifire
      .trigger("shopify-user-welcome-mail", {
        $user_id: email,
        $email: email,
        firstName,
        instanceName,
        orderName: order?.name,
        resetPasswordLink,
      })
      .catch((err) => {
        logger.error(
          { email },
          "Problem sending shopify user welcome mail exists"
        );
        logger.error(err);
      });
  }

  async function send_stripe_subscription_activated_mail({
    email,
    firstName,
    product,
  }) {
    logger.info({ email }, "Sending stripe subscription activation mail");

    const instanceName = await get_tenant_name();

    await notifire
      .trigger("stripe-subscription-activated", {
        $user_id: email,
        $email: email,
        firstName,
        instanceName,
        product,
      })
      .catch((err) => {
        logger.error(
          { email },
          "Problem sending stripe subscription activation mail"
        );
        logger.error(err);
      });
  }

  async function send_stripe_subscription_scheduled_mail({
    email,
    firstName,
    product,
  }) {
    logger.info({ email }, "Sending stripe subscription scheduled mail");

    const instanceName = await get_tenant_name();

    await notifire
      .trigger("stripe-subscription-scheduled", {
        $user_id: email,
        $email: email,
        firstName,
        instanceName,
        product,
      })
      .catch((err) => {
        logger.error(
          { email },
          "Problem sending stripe subscription scheduled mail"
        );
        logger.error(err);
      });
  }

  async function send_stripe_subscription_updated_mail({
    email,
    firstName,
    product,
  }) {
    logger.info({ email }, "Sending stripe subscription updated mail");

    const instanceName = await get_tenant_name();

    await notifire
      .trigger("stripe-subscription-updated", {
        $user_id: email,
        $email: email,
        firstName,
        instanceName,
        product,
      })
      .catch((err) => {
        logger.error(
          { email },
          "Problem sending stripe subscription updated mail"
        );
        logger.error(err);
      });
  }

  return {
    send_password_reset,
    send_welcome_mail,
    senduser_register_self_welcome_mail,
    send_subscription_renew_mail,
    send_subscription_renewed_successfully_mail,
    send_subscription_default_payment_not_set_mail,
    send_user_code_redeem_mail,
    send_shopify_user_welcome_mail_exists,
    send_shopify_user_welcome_mail,
    send_stripe_subscription_activated_mail,
    send_stripe_subscription_scheduled_mail,
    send_stripe_subscription_updated_mail,
  };
};
