# 1. 배포 환경 기반
# 배포 환경 의존성 설치
# 항상 slim 사용! 추가 패키지가 필요한 경우 apt를 사용하여 추가
# Alpine은 Node.js에서 공식적으로 지원되지 않으므로 기본  Debian을 사용
FROM node:16.15.0-slim as base

# 환경에 따라 개발, 테스트, 배포
# Docker Compose를 사용하여 빌드 및 실행을 위해 개발, 테스트 환경 설정
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# 노드(Node)의 기본 포트를 3000으로 설정
ARG PORT=3000
ENV PORT $PORT
EXPOSE $PORT

# 의존성 이미지가 시작될 때까지 기다리기 위한 유틸리티(e.g., MySQL 완료 후 Nest.js)
COPY --from=ghcr.io/ufoscout/docker-compose-wait:latest /wait /wait

# 속도와 버그 수정을 위해 노드 버전과 상관없이 최신 npm을 사용할 수 있지만 개발 환경과 맞는 npm 설치
RUN npm i npm@8.5.5 -g

# 공식 Node 이미지는 보안을 위한 권장 사항으로 특권 없는 사용자를 제공하지만 수동으로 활성화
# npm이 애플리케이션을 실행하는 동일한 사용자로 의존성을 설치
USER node

# 개발 시 애플리케이션 바인드 마운트를 쉽게하기 위해 의존성을 먼저 다른 위치에 설치
# USER를 먼저 설정하면 WORKDIR이 올바른 권한을 설정
WORKDIR /opt/node_app

COPY --chown=node:node package*.json ./

# CI, 배포, 테스트와 같은 자동화 환경의 경우 npm ci 사용(NODE_ENV=production -> 배포 의존성만 설치)
RUN npm ci && npm cache clean --force

ENV PATH /opt/node_app/node_modules/.bin:$PATH


# 2. 개발 환경
# 개발 시 애플리케이션 바인드 마운트 할 것이기 때문에 COPY 생략
# 개발 환경에서 Docker Compose를 사용하여 개발할 때 시간을 절약
FROM base as dev

ENV NODE_ENV=development

USER node

WORKDIR /opt/node_app

# 개발은 npm install 사용
RUN npm install

WORKDIR /opt/node_app/app

CMD ["npm", "run", "start:dev"]


# 3. 소스(소스 코드 복사)
# 소스 코드를 다음 두 단계에서 사용하기 위해 빌더로 가져오는 것
# 두 번 복사하지 않도록 자체 단계로 구성
FROM base as source

USER node

WORKDIR /opt/node_app/app

# 소스 코드 복사
COPY --chown=node:node . .


# 4. 테스트 환경
# CI에서 사용
FROM source as test

ENV NODE_ENV=development

USER node

# 모든 의존성(배포 및 개발) 복사
COPY --from=dev /opt/node_app/node_modules /opt/node_app/node_modules

# 단위 테스트(TO-DO: E2E 테스트)
CMD ["npm", "run", "test"] 


# 배포 환경(기본)
FROM source as prod

CMD ["node", "dist/main"]