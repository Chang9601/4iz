# 4iz

## 소개
ExpressJS 프레임워크와 JavaScript를 사용하여 개발하고 AWS의 EC2와 RDS를 통해 배포한 위코드 1차 프로젝트 4iz를 NestJS 프레임워크와 TypeScript을 배우고 경험을 쌓고 싶어 리팩토링을 했습니다.
Docker를 사용해서 환경(개발, 테스트, 운영)에 맞는 Dockerfile로 이미지를 생성하였고 코드의 기능과 안정성을 보장하기 위해 Docker Compose와 Jest로 단위 테스트 및 E2E 테스트 코드를 작성했습니다.
인프라의 경우 AWS의 VPC의 네트워크 ACL로 보안을 더 강화했고 ECR, ECS으로 트래픽에 따른 스케일 아웃 및 스케일 인을 자동화 했으며 ALB로 로드 밸런싱을 구현했습니다.
Route 53으로 도메인을 등록하고 ACM으로 HTTPS를 적용했습니다. 테스트와 배포 과정을 자동화 하기 위해 GitHub Action를 사용하여 단위 테스트와 E2E 테스트 CI를 ECR에 Docker 이미지를 푸시하고 ECS에서 새로운 작업을 실행하는 CD를 구현했습니다.

## 아키텍처
![Untitled (1)](https://github.com/Chang9601/4iz/assets/79137839/9d7ac052-3fc9-41e0-a685-12933f9cd4f5)

## URL
https://chang-app.com

## 실행
main 브랜치의 docker-compose.yml 파일을 docker compose up --build 명령으로 실행.

## 기술 스택
|개발|
| :----: |
|![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) ![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white) ![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white) ![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)|
|인프라|
|![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white) ![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)|

## API
https://chang-app.com/api 혹은 로컬에서 애플리케이션 실행 후 http://localhost:3000/api

## 기록
https://whooa27.blogspot.com/search/label/4iz

## 시현
### 회원가입 및 로그인
[Screencast from 2024년 01월 28일 20시 08분 28초.webm](https://github.com/Chang9601/4iz/assets/79137839/8dd4ee88-5105-4709-92fd-6600b4ec5a46)

### 상품 목록, 상품 상세 및 장바구니 추가
[Screencast from 2024년 01월 28일 20시 10분 22초.webm](https://github.com/Chang9601/4iz/assets/79137839/a6307e8e-ad83-4070-be73-c1b583a4e512)

### 장바구니 목록, 장바구니 수정 및 장바구니 삭제
[Screencast from 2024년 01월 28일 20시 11분 48초.webm](https://github.com/Chang9601/4iz/assets/79137839/cba30155-2d9e-4485-be2d-7081e2218903)

### 주문하기, 주문 상세, 주문 목록 및 주문 삭제
[Screencast from 2024년 01월 28일 20시 15분 23초.webm](https://github.com/Chang9601/4iz/assets/79137839/74c2ef66-e548-4af6-9cf3-4ed463c74043)

### 개인 정보 및 로그아웃
[Screencast from 2024년 01월 28일 20시 16분 24초.webm](https://github.com/Chang9601/4iz/assets/79137839/4721936b-5322-4fb6-82fb-09ba0d35a1ab)
