# Fake API

## 개요
이 프로젝트는 `json-server`를 활용한 가짜 API 서버입니다. `json-server-auth`를 추가하여 인증 기능을 제공하며, `connect-pause`를 사용하여 응답 지연을 설정할 수 있습니다.

## 주요 기능
- **JSON 기반의 간단한 REST API 서버**
- **응답 지연 기능 (`connect-pause` 활용)**
- **개발 환경에서 빠른 API Mocking 지원**

## 설치 및 실행 방법

### Requirements
For building and running the application you need:

- Node.js 18.16.1
- Npm 9.5.1


### 1. 패키지 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```
서버는 기본적으로 `http://localhost:8080`에서 실행됩니다.

## 환경 변수 설정
`.env` 파일을 생성하여 다음과 같이 설정할 수 있습니다.
```
SERVER_PORT=8080
```
> `SERVER_PORT` 값을 변경하면 원하는 포트에서 API 서버를 실행할 수 있습니다.

## 주요 패키지 설명

### 1. `json-server`
- JSON 파일(`db.json`)을 기반으로 가짜 REST API 서버를 생성합니다.
- GET, POST, PUT, PATCH, DELETE 요청을 지원합니다.

### 2. `connect-pause`
- API 응답을 지연시키는 기능을 제공합니다.
- 테스트 환경에서 비동기 처리 시뮬레이션에 유용합니다.

## 예제 API 엔드포인트
- `GET /api/users/*/exists` ⇢ `/users?email=$1` - 유저 아이디(이메일) 존재여부
- `GET /api/auth/me` ⇢ `/me` - 유저 인증 정보 요청 
- `GET /api/*` ⇢ `/$1` - 기타 DB 정보 조회

## 참고 사항
- `db.json` 파일을 수정하면 서버를 재시작해야 변경 사항이 반영됩니다.
- 기본적으로 `json-server`는 CORS를 지원합니다.
- POST PATCH 등의 라우터는 아직 구현하지 못했습니다.


