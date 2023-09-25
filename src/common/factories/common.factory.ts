import { CookieOptions } from 'express';

import { Item } from '../../entities/item.entity';

export const createCookieOptions = (expiration: string): CookieOptions => {
  return {
    httpOnly: true, // JavaScript에서 Document.cookie 속성을 통해 쿠키에 접근하는 것을 금지하여 XSS(웹 사이트에서 악성 스크립트를 실행하는 공격) 공격을 완화한다.
    secure: false, // 쿠키가 HTTPS를 통해 요청할 경우만 쿠키를 서버(로컬호스트 제외)로 전송해서 중간자 공격(두 개의 시스템 간 통신을 가로채는 공격)과 같은 HTTP 공격을 완화한다.
    sameSite: 'strict', // CSRF(신뢰할 수 있는 사용자를 흉내내고 웹 사이트에 요청을 위조해서 원치 않는 명령을 보내는 공격) 공격을 완화한다.
    expires: new Date(Date.now() + parseInt(expiration)),
  };
};

export const createCachekey = (obj: string, id: string) => {
  return `${obj}#${id}`;
};

export const serializeItem = (item: Item) => {
  return {
    ...item,
    releaseDate: new Date(`${item.releaseDate}T00:00:00.000Z`).getTime(),
    images: JSON.stringify(item.images),
    options: JSON.stringify(item.options),
    categories: JSON.stringify(item.categories),
  };
};

export const deserializeItem = (item: { [key: string]: string }) => {
  return {
    ...item,
    id: parseInt(item.id),
    price: parseInt(item.price),
    discountRate: parseInt(item.discountRate),
    releaseDate: new Date(item.releaseDate),
    images: JSON.parse(item.images),
    options: JSON.parse(item.options),
    categories: JSON.parse(item.categories),
  };
};

export const buildOption = (options: Record<string, any>) => {
  return { where: options };
};
