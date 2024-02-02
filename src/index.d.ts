// 선언 파일은 TypeScript 소스 코드를 컴파일할 때 생성되는 파일로 타입시스템의 타입 추론을 돕는 코드를 포함한다.
// 운영 환경에서는 개발 환경 의존성을 설치하지 않는다. 따라서 @types 패키지가 설치되지 않아 any 타입 오류가 발생한다!
// 이를 해결하기 위해 다음과 같이 .d.ts 파일 생성 후 패키지를 선언한다.
declare module 'cookie-parser';
declare module 'cors';
declare module 'cache-manager-ioredis';
