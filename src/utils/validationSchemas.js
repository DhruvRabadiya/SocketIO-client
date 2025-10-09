import * as yup from "yup";

const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
const passwordErrorMessage =
  "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.";

export const registerSchema = yup.object().shape({
  username: yup
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .required("Username is required"),

  email: yup
    .string()
    .email("Must be a valid email")
    .max(100, "Email cannot exceed 100 characters")
    .required("Email is required"),

  password: yup
    .string()
    .matches(passwordPattern, { message: passwordErrorMessage })
    .required("Password is required"),
});

export const loginSchema = yup.object().shape({
  emailOrUsername: yup
    .string()
    .required("Email or Username is required")
    .test(
      "is-email-or-username",
      "Must be a valid email or an alphanumeric username",
      (value) => {
        if (!value) return false;
        const isEmail = yup.string().email().isValidSync(value);
        const isUsername = yup
          .string()
          .matches(/^[a-zA-Z0-9]{3,30}$/)
          .isValidSync(value);
        return isEmail || isUsername;
      }
    ),

  password: yup
    .string()
    .matches(passwordPattern, { message: passwordErrorMessage })
    .required("Password is required"),
});
