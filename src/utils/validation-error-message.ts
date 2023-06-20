export enum ValidationErrorMessage {
  NAME_TYPE = 'Must be a string',
  NAME_LENGTH = 'Too short, minimum length is 1 character',
  STREET_TYPE = 'Must be a string',
  STREET_LENGTH = 'Too short, minimum length is 1 character',
  ADDRESS = 'Invalid address',
  ZIPCODE = 'Invalid zipcode',
  EMAIL = 'Invalid email',
  PASSWORD = 'Invalid password',
  PHONE_NUMBER = 'Invalid phone number',
  BIRTHDAY = 'Invalid birthday',
  POSITIVE_NUMBER = 'Positive number only',
  NON_NEGATIVE_NUMBER = 'Non-negative number only',
  CART_ARRAY = 'Must be an array of Cart object',
  OPTION_TYPE = 'Must be an Option object',
  OPTION_ARRAY = 'Must be an array of Option object',
  OPTION_ELEMENT = 'Element must be an Option object',
  ARRAY_SIZE = 'Non-empty array only',
  ITEM_TPYE = 'Must be an Item object',
  ITEM_ARRAY = 'Must be an array of Item object',
}
