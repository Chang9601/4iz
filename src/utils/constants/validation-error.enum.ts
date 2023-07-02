export enum VALIDATION_ERROR {
  NUMBER_TYPE = 'Must be number',
  STRING_TYPE = 'Must be string',
  STRING_LENGTH = 'Too short, minimum length is 1 character',
  ARRAY_TYPE = 'Must be array',
  ARRAY_SIZE = 'Non-empty array only',
  OPTION_TYPE = 'Must be Option object',
  OPTION_ELEMENT = 'Element must be string',
  NAME = 'Invalid name',
  STREET = 'Invalid street',
  ADDRESS = 'Invalid address',
  ZIPCODE = 'Invalid zipcode',
  EMAIL = 'Invalid email',
  PASSWORD = 'Invalid password',
  PHONE_NUMBER = 'Invalid phone number',
  BIRTHDAY = 'Invalid birthday',
  POSITIVE_NUMBER = 'Positive number only',
  NON_NEGATIVE_NUMBER = 'Non-negative number only',
  CART_ARRAY = 'Must be array of Cart object',
  ITEM_TPYE = 'Must be Item object',
  ITEM_ARRAY = 'Must be array of Item object',
}