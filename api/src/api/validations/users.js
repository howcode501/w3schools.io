// eslint-disable-next-line no-unused-vars
module.exports = async (app, constants, Yup) => {
  const userSchema = Yup.object({
    email: Yup.string("Enter your email")
      .email("Enter a valid email")
      .required("Email is required")
      .trim(),
    first_name: Yup.string("First Name Should contain letters.")
      .min(3, "First Name should be of minimum 3 characters length")
      .max(150, "First Name should be less than 150 Characters")
      .required("First Name is required")
      .matches(
        constants.EMOJIS_REGEX,
        "Emojis are not allowed in First Name. Please choose another name."
      ),
    last_name: Yup.string("Last Name Should contain letters.")
      .min(3, "Last Name should be of minimum 3 characters length")
      .max(150, "Last Name should be less than 150 Characters")
      .required("Last Name is required")
      .matches(
        constants.EMOJIS_REGEX,
        "Emojis are not allowed in Last Name. Please choose another name."
      ),
    password: Yup.string().test(
      "empty-or-8-characters-check",
      "Password must be at least 8 characters",
      (password) => !password || password.length >= 8
    ),
    passwordVerify: Yup.string()
      .trim()
      .oneOf([Yup.ref("password")], "Passwords must match"),
    roles: Yup.string().trim().required("Role is required"),
    enabled: Yup.string().trim().required("Status is required"),
  });
  const passwordSchema = Yup.object({
    password: Yup.string("Password")
      .trim()
      .max(100, "Passwords should be less than 100 Characters.")
      .matches(
        /^(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          excludeEmptyString: true,
          message:
            "Passwords must be 8 characters or more, have a mixture of both uppercase and lowercase letters, have a mixture of letters and numbers, and include at least one special character. e.g., ! @ # ? ]",
        }
      ),
    passwordVerify: Yup.string()
      .trim()
      .oneOf([Yup.ref("password")], "Passwords must match"),
  });
  // Validate Users using yup
  // eslint-disable-next-line consistent-return
  async function user_validateSchema(req, res, next) {
    // const user_validateSchema = () => async (req, res, next) => {
    const { data } = req.body;
    try {
      await userSchema.validate(data);
      next();
    } catch (error) {
      return res.status(400).json({ error });
    }
  }

  // Validate Password using yup
  // eslint-disable-next-line consistent-return
  async function password_validateSchema(req, res, next) {
    const { password, passwordVerify } = req.body;
    try {
      await passwordSchema.validate({ password, passwordVerify });
      next();
    } catch (error) {
      return res.status(400).json({ error });
    }
  }

  return {
    user_validateSchema,
    password_validateSchema,
  };
};
