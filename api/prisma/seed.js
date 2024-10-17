// Please put all seed files in the seeds folder and organize by file name
// Once the seed file is ready for use, please include it in this file.
// PLEASE DO NOT INCLUDE SEEDS IN THIS FILE DIRECTLY

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function upsert_table(label, prisma_table, dataset) {
  // eslint-disable-next-line consistent-return
  const arr = dataset.map(async (d) => {
    try {
      const { name } = d;
      const data = { ...d };
      delete data.name;
      const rec = await prisma_table.upsert({
        where: { name },
        update: { ...data },
        create: { name, ...data },
      });
      // eslint-disable-next-line no-console
      console.log(`${label} :: ${JSON.stringify(rec)}`);
      return [name, rec];
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      process.exit(1);
    }
  });

  return arr.reduce((acc, curr) => {
    // eslint-disable-next-line prefer-destructuring
    acc[curr[0]] = curr[1];
    return acc;
  }, {});
}

async function seed_auth_method() {
  const data = [
    {
      id: 1,
      name: "password",
      display_name: "Password Authentication",
    },
    {
      id: 2,
      name: "password-otp",
      display_name: "Password Authentication with OTP",
    },
    {
      id: 3,
      name: "saml2",
      display_name: "SAML 2.0",
    },
    {
      id: 4,
      name: "oauth2",
      display_name: "OAuth 2.0",
    },
    {
      id: 5,
      name: "link",
      display_name: "Encoded Link",
    },
    {
      id: 6,
      name: "code",
      display_name: "Special Access Code",
    },
  ];

  const seed_auth_method_return = await upsert_table(
    "Authentication Methods",
    prisma.AuthMethod,
    data
  );

  return seed_auth_method_return;
}

async function seed_roles() {
  const data = [
    {
      name: "msp",
      display_name: "Super Admin",
      can_delete: false,
      can_edit_options: false,
      hidden: true,
      enabled: true,
      description: "System and Infrastructure Administration Role",
    },
    {
      name: "administrator",
      display_name: "Administrator",
      can_delete: false,
      can_edit_options: false,
      hidden: false,
      enabled: true,
      description: "Account Administration Role",
    },
    {
      name: "user",
      display_name: "User",
      can_delete: false,
      can_edit_options: false,
      hidden: false,
      enabled: true,
      description: "User Role",
    },
  ];

  const roles = await upsert_table("Role", prisma.role, data);
  // TODO - bind default roles with options

  return roles;
}

async function seed_role_options() {
  const data = [
    {
      name: "console_access",
      display_name: "Console Access",
      category: "Security",
      description: "User can login to console",
      enabled: true,
    },
  ];

  const seed_role_options_return = await upsert_table(
    "Role Options",
    prisma.roleOption,
    data
  );

  return seed_role_options_return;
}

async function seed_notification_status() {
  const data = [
    {
      id: 1,
      name: "Pending",
    },
    {
      id: 2,
      name: "In Progress",
    },
    {
      id: 3,
      name: "Complete",
    },
    {
      id: 4,
      name: "Error",
    },
  ];

  const seed_notification_status_return = await upsert_table(
    "Notification Statuses",
    prisma.NotificationStatus,
    data
  );

  return seed_notification_status_return;
}

async function seed_system_config() {
  const data = [
    {
      name: "User_Portal_Store_button_Link",
      field_type: "text",
    },
    {
      name: "User_Portal_Store_button_Text",
      field_type: "text",
    },
    {
      name: "User_Portal_Active_Product_Button_Text",
      field_type: "text",
    },
    {
      name: "User_Portal_Inactive_Product_Button_Text",
      field_type: "text",
    },
    {
      name: "User_Portal_Active_Product_Text",
      field_type: "text",
    },
    {
      name: "User_Portal_Inactive_Product_Text",
      field_type: "text",
    },
    {
      name: "User_Portal_Promotional_Text",
      field_type: "text",
    },
    {
      name: "New_Account_Success_Message",
      field_type: "text",
    },
    {
      name: "Site_Title",
      field_type: "text",
    },
    {
      name: "Stripe_Mode",
      field_type: "select",
    },
    {
      name: "Stripe_Test_Publishable_Key",
      field_type: "text",
    },
    {
      name: "Stripe_Test_Secret_Key",
      field_type: "text",
    },
    {
      name: "Stripe_Live_Publishable_Key",
      field_type: "text",
    },
    {
      name: "Stripe_Live_Secret_Key",
      field_type: "text",
    },
    {
      name: "Promo_Codes_Characters",
      field_type: "text",
    },
    {
      name: "Promo_Codes_Purchase_Location",
      field_type: "text",
    },
    {
      name: "Promo_Codes_Default_Length",
      field_type: "text",
    },
    {
      name: "Promo_Codes_Default_Bulk_Code_Length",
      field_type: "text",
    },
    {
      name: "Swagger_API_DOC_URL",
      field_type: "text",
    },
    {
      name: "Subscription_Description",
      field_type: "text",
    },
    {
      name: "Subscription_Learn_More_Link",
      field_type: "text",
    },
    {
      name: "Subscription_Icon",
      field_type: "text",
    },
  ];

  const seed_system_config_return = await upsert_table(
    "System Config",
    prisma.SystemConfig,
    data
  );

  // seed system config static data
  const systemConfigStaticData = [
    {
      name: "New_Account_Success_Message",
      value:
        'Thank you for creating a ThoughtCast Magic account. Please remember your login details. Click "Back to Login" to log in and verify your ThoughtCast products were successfully activated.',
      status: true,
      field_type: "text",
    },
    {
      name: "Promo_Codes_Characters",
      value: "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789",
      status: true,
      field_type: "text",
    },
    {
      name: "Promo_Codes_Default_Bulk_Code_Length",
      value: null,
      status: true,
      field_type: "text",
    },
    {
      name: "Promo_Codes_Default_Length",
      value: "11",
      status: true,
      field_type: "text",
    },
    {
      name: "Promo_Codes_Purchase_Location",
      value: null,
      status: true,
      field_type: "text",
    },
    {
      name: "Site_Title",
      value: "ThoughtCast Owners Portal",
      status: true,
      field_type: "text",
    },
    {
      name: "Stripe_Live_Publishable_Key",
      value: null,
      status: true,
      field_type: "text",
    },
    {
      name: "Stripe_Live_Secret_Key",
      value: null,
      status: true,
      field_type: "text",
    },
    {
      name: "Stripe_Mode",
      value: "Test",
      status: true,
      field_type: "select",
    },
    {
      name: "Stripe_Test_Publishable_Key",
      value:
        "pk_test_51NAsioGkb3PpuSMkxFkzslsGHYlmuzAA2jesWnyKjbIsBB8WyHJrxFPK1Mebz3wSi108MS9eQzj841KILYOr4hz400M0FECCZT",
      status: true,
      field_type: "text",
    },
    {
      name: "Stripe_Test_Secret_Key",
      value:
        "sk_test_51NAsioGkb3PpuSMkMBBKvozLRQu3tgF7OwZif4ko9LyUglijvaa52qoSAN1CVNfwDoDxHOFeVg4LPEguYMihkC7500ogIYrZ9L",
      status: true,
      field_type: "text",
    },
    {
      name: "Subscription_Description",
      value:
        "These are some of the ThoughtCast Magic subscriptions you can subscribe to!",
      status: true,
      field_type: "text",
    },
    {
      name: "Subscription_Icon",
      value:
        "https://thoughtcastowners.s3.us-east-2.amazonaws.com/development/Subscription_Static/2023-09-01T19-02-44.753Z.png",
      status: true,
      field_type: "text",
    },
    {
      name: "Subscription_Learn_More_Link",
      value: "thoughtcastmagic.com",
      status: true,
      field_type: "text",
    },
    {
      name: "Swagger_API_DOC_URL",
      value: "https://app.swaggerhub.com/apis-docs/Benjamin9/NewServer/1.0.0",
      status: true,
      field_type: "text",
    },
    {
      name: "User_Portal_Active_Product_Button_Text",
      value: "View Instructions",
      status: true,
      field_type: "text",
    },
    {
      name: "User_Portal_Active_Product_Text",
      value: "Purchased",
      status: true,
      field_type: "text",
    },
    {
      name: "User_Portal_Inactive_Product_Button_Text",
      value: "Purchase",
      status: true,
      field_type: "text",
    },
    {
      name: "User_Portal_Inactive_Product_Text",
      value: "Inactive",
      status: true,
      field_type: "text",
    },
    {
      name: "User_Portal_Promotional_Text",
      value:
        "<p>Click on any of the product names below to learn about them, or if they are active on your account, view their instructions.</p>",
      status: true,
      field_type: "text",
    },
    {
      name: "User_Portal_Store_button_Link",
      value: "https://www.thoughtcastmagic.com/store",
      status: true,
      field_type: "text",
    },
    {
      name: "User_Portal_Store_button_Text",
      value: "Store",
      status: true,
      field_type: "text",
    },
  ];

  // await upsert_table(
  //   "System Config",
  //   prisma.SystemConfig,
  //   systemConfigStaticData
  // );

  return seed_system_config_return;
}

async function seed_products() {
  const data = {
    product_name: "Book Test Library",
    product_id: "bookTestLibrary",
    product_status: true,
  };
  const { product_name } = data;

  await prisma.Product.upsert({
    where: { product_name },
    update: { ...data },
    create: { ...data },
  });

  return;
}

async function main() {
  // static
  await seed_auth_method();
  await seed_notification_status();
  const role_options = await seed_role_options();

  await seed_roles(role_options);
  await seed_system_config();

  await seed_products();
}

// main
main()
  .catch(() => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
