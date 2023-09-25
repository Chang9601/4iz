export enum Role {
  USER = 'user',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

export enum Token {
  ACCESS_TOKEN = 'access_token',
  REFRESH_TOKEN = 'refresh_token',
}

export enum Pagination {
  LIMIT = 10,
  OFFSET = 1,
  SEARCH = '',
  SORT = 'date',
}

export enum OrderState {
  FAILED = '결제실패',
  PAID = '결제완료',
  PROCESSING = '처리중',
  SHIPPED = '발송완료',
  DELIVERED = '배송완료',
  CANCELLED = '취소',
  REFUNDED = '환불완료',
  RETURNED = '반품완료',
}

export enum PaymentMethod {
  KAKAO_PAY = '카카오페이',
  CREDIT_CARD = '신용카드',
  NAVER_PAY = '네이버페이',
  PAYCO = '페이코',
  TRANSFER = '계좌이체',
}

export enum RandomNumber {
  ORDER = '주문',
  PAYMENT = '결제',
  SHIPMENT = '배송',
}

export enum ValidationError {
  OBJECT_TYPE = '객체만 가능.',
  NUMBER_TYPE = '숫자만 가능.',
  INTEGER_TYPE = '정수만 가능.',
  STRING_TYPE = '문자열만 가능.',
  STRING_LENGTH = '최소 길이는 1자.',
  OBJECT_ID_TYPE = '몽고 아이디만 가능.',
  ARRAY_TYPE = '배열만 가능.',
  ARRAY_SIZE = '비어있지 않은 배열만 가능.',
  OPTION_TYPE = '옵션 객체만 가능.',
  OPTION_ELEMENT = '원소는 문자열만 가능.',
  NAME = '유효하지 않은 이름.',
  STREET_ADDRESS = '유효하지 않은 도로명 주소.',
  ADDRESS = '유효하지 않은 주소.',
  ZIPCODE = '유효하지 않은 우편번호.',
  EMAIL = '유효하지 않은 이메일.',
  PASSWORD = '유효하지 않은 비밀번호.',
  PHONE_NUMBER = '유효하지 않은 전화번호.',
  BIRTHDAY = '유효하지 않은 생년월일.',
  POSITIVE_NUMBER = '양수만 가능.',
  NON_NEGATIVE_NUMBER = '음수가 아닌 수만 가능.',
  CART_ARRAY = '장바구니 객체의 배열만 가능.',
  ITEM_TPYE = '상품 객체만 가능.',
  ITEM_ARRAY = '상품 객체의 배열만 가능.',
}
