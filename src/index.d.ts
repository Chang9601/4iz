// 운영 환경에서는 개발 환경 의존성을 설치하지 않는다. 따라서 @types 패키지가 설치되지 않아 any 타입 오류가 발생한다!
// 이를 해결하기 위해 다음과 같이 .d.ts 파일 생성 후 패키지를 선언한다.
declare module 'cookie-parser';
declare module 'cors';
declare module 'cache-manager-ioredis';
