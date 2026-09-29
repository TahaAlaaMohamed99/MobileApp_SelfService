import * as Yup from "yup";
const emailYup = Yup.string().email("invalidEmail").required("emailRequired");
const employeeRecYup = Yup.object().required("pleaseSelect");
const DateTimeFrom = Yup.date().required("dateTimeFromRequired");
const nameYup = Yup.string()
  .required("pleaseEnterName")
  .min(3, "nameMustBeAtLeast3Characters")
  .max(50, "nameCannotExceed50Characters");
const firstNameYup = Yup.string()
  .required("pleaseEnterFirstName")
  .min(3, "nameMustBeAtLeast3Characters")
  .max(50, "nameCannotExceed50Characters");
const lastNameYup = Yup.string()
  .required("pleaseEnterLastName")
  .min(3, "nameMustBeAtLeast3Characters")
  .max(50, "nameCannotExceed50Characters");
const creationDateYup = Yup.date().required("pleaseSelectCreationDate");
const vacationCategory = Yup.object().required("pleaseSelect");
const importanceYup = Yup.object().required("pleaseSelect");
const yearYup = Yup.number()
  .nullable()
  .min(1900, "Min year is 1900")
  .max(2400, "max year is 2400")
  .test(
    "len",
    "yearMustBe4Digits",
    (val) => !val || val.toString().length === 4,
  );
const yearRequired = Yup.number()
  .required("yearRequired")
  .nullable()
  .min(1900, "MinYearIs1900")
  .max(2400, "maxYearIs2400")
  .test(
    "len",
    "yearMustBe4Digits",
    (val) => !val || val.toString().length === 4,
  );

export const vacationTransactionDataSchema = Yup.object().shape({
  vacationCategory,
  fromDate: Yup.date().required("pleaseSelect"),
  toDate: Yup.date().required("pleaseSelect"),
});

export const missionTransactionDataSchema = Yup.object().shape({
  missionSubType: Yup.object().required("pleaseSelect"),
  dateTimeFrom: DateTimeFrom,
  dateTimeTo: Yup.date()
    .required("dateTimeToRequired")
    .test(
      "is-not-same-when-not-full-day",
      "dateTimeToValidationError",
      function (value) {
        const { DateTimeFrom, IsFullDayMission } = this.parent;
        if (IsFullDayMission) return true;
        if (!value || !DateTimeFrom) return true;
        return value.getTime() !== DateTimeFrom.getTime();
      },
    ),
});

export const partialDayLeaveTransactionDataSchema = Yup.object().shape({
  attendanceSetup: Yup.object().required("pleaseSelect"),
  DateTimeFrom: DateTimeFrom,
  DateTimeTo: Yup.date()
    .required("dateTimeToRequired")
    .when("isFixedHour", {
      is: false,
      then: (schema) =>
        schema.test(
          "is-not-same-time",
          "dateTimeToValidationError",
          function (value) {
            const { DateTimeFrom } = this.parent;
            if (!DateTimeFrom || !value) return true;

            const from = new Date(DateTimeFrom);
            const to = new Date(value);
            return from.toDateString() !== to.toDateString() || from.getTime() !== to.getTime();
          },
        ),
      otherwise: (schema) => schema,
    }),
});

export const missedAttendanceRequestDataSchema = Yup.object().shape({
  forgetFinger: Yup.object().required("pleaseSelect"),
  attendanceDateIn: Yup.date().nullable().when("forgetFinger", {
    is: (val) => val?.value === 1 || val?.value === 3,
    then: (schema) => schema.required("pleaseSelect"),
  }),
  timeIn: Yup.string().nullable().when("forgetFinger", {
    is: (val) => val?.value === 1 || val?.value === 3,
    then: (schema) => schema.required("pleaseSelect"),
  }),
  attendanceDateOut: Yup.date().nullable().when("forgetFinger", {
    is: (val) => val?.value === 2 || val?.value === 3,
    then: (schema) => schema.required("pleaseSelect"),
  }),
  timeOut: Yup.string().nullable().when("forgetFinger", {
    is: (val) => val?.value === 2 || val?.value === 3,
    then: (schema) => schema.required("pleaseSelect"),
  }),
});

export const benefitEnrollmentRequestTransactionSchema = Yup.object().shape({
  benefitCategory: Yup.object()
    .required("pleaseSelect"),

  benefitPlane: Yup.object()
    .required("pleaseSelect"),

 

  numberOfInstallments: Yup.string()
    .trim()
    .when("benefitCategory", {
      is: (benefitCategory) =>
        benefitCategory?.value !== 2,
      then: (schema) => schema.required("pleaseEnterNumberOfInstallments"),
      otherwise: (schema) => schema.notRequired(),
    }),

  maxLimit: Yup.string()
    .trim()
    .required("pleaseEnterAmount"),

  month: Yup.object()
    .required("pleaseSelect"),

  year: yearRequired,

  paymentTemplate: Yup.object()
    .nullable()
    .when("benefitCategory", {
      is: (benefitCategory) =>
        benefitCategory?.value > 0,
      then: (schema) => schema.required("pleaseSelect"),
      otherwise: (schema) => schema.notRequired(),
    }),

  enrollmentDate: Yup.date()
    .required("pleaseSelect"),

  paySlipMonth: Yup.object()
    .nullable()
    .when(["benefitPlane", "benefitCategory"], {
      is: (benefitPlane, benefitCategory) =>
        benefitPlane?.showInPaySlip == 2 &&
        [0, 3, undefined].includes(benefitCategory?.value),

      then: (schema) => schema.required("pleaseSelect"),
      otherwise: (schema) => schema.notRequired(),
    }),

  paySlipYear: yearYup.when(
    ["benefitPlane", "benefitCategory"],
    {
      is: (benefitPlane, benefitCategory) =>
        benefitPlane?.showInPaySlip == 2 &&
        [0, 3, undefined].includes(benefitCategory?.value),

      then: (schema) => schema.required("yearRequired"),
      otherwise: (schema) => schema.notRequired(),
    }
  ),

  defaultDisbursementPaymentTemplate: Yup.object()
    .nullable()
    .when(["benefitPlane", "benefitCategory"], {
      is: (benefitPlane, benefitCategory) =>
        benefitPlane?.showInPaySlip == 2 &&
        [0, 3, undefined].includes(benefitCategory?.value),

      then: (schema) => schema.required("pleaseSelect"),
      otherwise: (schema) => schema.notRequired(),
    }),
});
export const attendanceExceptionSchema = Yup.object().shape({
  timing: Yup.object().required("pleaseSelect"),
  attendanceExceptionSetup: Yup.object().required("pleaseSelect"),
});

export const employeeMonthlyAttendanceSelfserviceSchema = Yup.object().shape({
  monthYear: Yup.object().required("pleaseSelect"),
});

export const loginSchema = Yup.object().shape({
  activationCode: Yup.string()
    .required("activationCodeRequired")
    .length(6, "activationCodeMustBe6Digits"),
  userName: Yup.string().required("userpleaseEnterName"),
  password: Yup.string()
    .min(6, "passwordMinLength")
    .required("passwordRequired"),
});

export const StepOneForgotPasswordSchema = Yup.object().shape({
  email: emailYup,
});

export const StepTwoForgotPasswordSchema = Yup.object().shape({
  otp: Yup.string()
    .required("otpRequired")
    .matches(/^\d+$/, "otpNumeric")
    .length(6, "otpSixDigits"),
});

const passwordComplexityRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

export const StepThreeForgotPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required("newPasswordRequired")
    .min(8, "passwordMinLength")
    .matches(passwordComplexityRegex, "passwordComplexity"),
  confirmPassword: Yup.string()
    .required("confirmYourPassword")
    .oneOf([Yup.ref("newPassword")], "passwordsMustMatch"),
});

export const ResetPassSchema = Yup.object().shape({
  oldPassword: Yup.string()
    .required("oldPasswordRequired")
    .min(8, "passwordMinLength")
    .matches(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "passwordComplexity",
    ),
  newPassword: Yup.string()
    .required("newPasswordRequired")
    .min(8, "passwordMinLength")
    .notOneOf([Yup.ref("oldPassword")], "newPasswordMustBeDifferent")
    .matches(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "passwordComplexity",
    ),
  confirmPassword: Yup.string()
    .required("confirmYourPassword")
    .oneOf([Yup.ref("newPassword"), null], "passwordsMustMatch"),
});