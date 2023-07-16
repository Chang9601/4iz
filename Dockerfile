# 항상 slim 사용! 추가 패키지가 필요한 경우 apt를 사용하여 추가
# Alpine은 Node.js에서 공식적으로 지원되지 않으므로 기본 debian을 사용
FROM node:16.15.0-slim AS prod

# 환경 설정에 따라 개발 또는 배포
# Docker Compose를 사용하여 빌드 및 실행하는 과정에서 이 값을 개발 환경으로 재정의
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

# 로컬 개발을 시 애플리케이션 바인드 마운트를 쉽게하기 위해 의존성을 먼저 다른 위치에 설치
# USER를 먼저 설정하면 WORKDIR이 올바른 권한을 설정
WORKDIR /opt/node_app

COPY --chown=node:node package*.json ./
# npm install 보다 npm ci 사용
RUN npm ci && npm cache clean --force
ENV PATH /opt/node_app/node_modules/.bin:$PATH

# 소스 코드는 가장 자주 변경되므로 마지막에 복사
# node로 복사해야 권한이 필요한대로 일치
WORKDIR /opt/node_app/app
COPY --chown=node:node . .

CMD ["node", "dist/main.js"]