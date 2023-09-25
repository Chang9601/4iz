# base 단계: 모든 운영 환경 의존성을 가지지만 코드는 없다.
# 로컬 머신 이외의 환경에서 작업을 수행한다면 특정 버전을 명시한다.
# 항상 slim을 사용한다! 추가 패키지가 필요한 경우 apt를 사용하여 추가한다.
# Alpine은 Node.js에서 공식적으로 지원되지 않으므로 기본 Debian을 사용한다.
FROM node:16.15.0-slim as base

# NodeJS를 개발 환경 또는 운영 환경 중 하나를 선택한다.
# 기본적으로 운영 환경으로 NODE_ENV를 설정한다.
# Docker Compose를 사용하여 빌드 및 실행을 위해 개발, 테스트 환경을 설정한다.
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# NodeJS의 기본 포트를 3000으로 설정한다.
ARG PORT=3000
ENV PORT $PORT

# 컨테이너가 실행시간에 해당 포트에서 수신 대기하지만 포트를 공개하지는 않는다.
EXPOSE $PORT

# 의존성 이미지가 시작될 때까지 기다리기 위한 유틸리티(즉, MySQL가 준비가 되면 NestJS 애플리케이션이 시작한다.)
COPY --from=ghcr.io/ufoscout/docker-compose-wait:latest /wait /wait

# 속도와 버그 수정을 위해 NodeJS 버전과 상관없이 최신 NPM을 사용할 수 있지만 안정성을 위해 개발 환경과 맞는 NPM을 설치한다.
RUN npm i npm@8.5.5 -g

# 공식 NodeJS 이미지는 보안을 위해 특권이 없는 사용자를 제공하는데 수동으로 활성화 해야한다.
# NPM이 애플리케이션을 실행하는 동일한 사용자로 의존성을 설치한다.
USER node

# 개발 시 애플리케이션 바인드 마운트를 쉽게하기 위해 의존성을 먼저 다른 위치에 설치한다.
# USER를 먼저 설정하면 WORKDIR이 올바른 권한(즉, node)을 설정한다.
WORKDIR /opt/node_app

COPY --chown=node:node package*.json ./
# npm ci 명령은 package-lock.json 파일을 기반으로 정확한 버전의 의존성을 설치하며 package.json 파일을 버전 일치 확인용으로 사용한다.
# CI, 배포, 테스트와 같은 자동화 환경의 경우 npm ci를 사용한다(NODE_ENV=production -> 운영 환경 의존성만 설치한다.).
RUN npm ci && npm cache clean --force

ENV PATH /opt/node_app/node_modules/.bin:$PATH


# dev 단계: base 단계를 기반으로 하며 모든 개발 의존성을 가지며 base 단계처럼 아직 코드는 없다(dev 단계는 소스 코드가 이미 바인드 마운트되어 있다.).
# 개발 시 애플리케이션을 바인드 마운트 할 것이기 때문에 COPY 명령을 생략한다.
# 개발 환경에서 Docker Compose를 사용하여 개발할 때 시간을 절약한다.
FROM base as dev

# NODE_ENV를 개발 환경으로 설정한다.
ENV NODE_ENV=development

USER node

WORKDIR /opt/node_app
# 개발 환경은 npm install을 사용한다.
RUN npm install

WORKDIR /opt/node_app/app

# 어떻게 node를 사용하지? 혹시 nest?
CMD ["npm", "run", "start:dev"]


# source 단계: base 단계를 기반으로 하며 코드를 추가한다.
# 소스 코드를 다음 두 단계에서 사용하기 위해 빌더로 가져온다.
# 두 번 복사하지 않도록 자체 단계로 구성한다.
FROM base as source

USER node

WORKDIR /opt/node_app/app
# 소스 코드를 복사한다.
# node 사용자로 복사하여 필요한 권한이 일치하도록 설정한다.
COPY --chown=node:node . .


# test 단계: source 단계를 기반으로 하며 테스트를 실행하기 위해 dev 단계의 의존성을 복사(COPY --from=dev)하고 선택적으로 코드를 검사하고 린트한다(이미 git push에서 하지 않은 경우).
# CI에서 사용할 수 있다.
FROM source as test

# 테스트 환경은 개발 환경과 동일하다.
ENV NODE_ENV=development

USER node

# 모든 의존성(운영 환경 및 개발 환경)을 복사한다.
COPY --from=dev /opt/node_app/node_modules /opt/node_app/node_modules

# 단위 테스트를 실행한다(TO-DO: E2E 테스트).
CMD ["npm", "run", "test"] 


# prod 단계: source 단계를 기반으로 하며 souce 단계에서 변경사항이 없지만 특정 단계를 지정하지 않은 경우 빌더는 기본적으로 이 단계를 사용한다.
# 운영 환경 의존성만 가진다.
FROM source as prod

USER node

# 애플리케이션이 HTTP 상태코드 200을 반환하는지 30초마다 확인한다.
HEALTHCHECK --interval=30s CMD node /opt/node_app/app/dist/healthcheck.js

WORKDIR /opt/node_app/app
# 애플리케이션을 빌드한다.
RUN npm run build

# 애플리케이션을 실행한다.
CMD ["node", "dist/src/main"]