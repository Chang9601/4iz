export const VALIDATION_REGEX = {
  NAME: /^[가-힣]{3,}$/,
  EMAIL: /^[\w.+-]+@[\w-]+\.[\w.-]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/,
  PHONE_NUMBER: /^([0-9]{3})[-]([0-9]{4})[-][0-9]{4}$/,
  STREET:
    /^[\p{Script=Hangul}\s]{1,}(?:[\p{Script=Hangul}\s]+[\p{Script=Hangul}]){4,}[\p{Script=Hangul}\s]*$/u,
  ADDRESS:
    /^[\p{Script=Hangul}\s]{1,}(?:[\p{Script=Hangul}\s]+[\p{Script=Hangul}]){3,}[\p{Script=Hangul}\s]*$/u,
  ZIPCODE: /^[0-9]{5}$/,
};
