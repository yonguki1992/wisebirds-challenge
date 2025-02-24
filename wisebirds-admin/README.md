# Recruit Challenge

## 개요
이 프로젝트는 Vue 3 및 Vite를 기반으로 한 프론트엔드 애플리케이션입니다. 상태 관리를 위해 `pinia`를 사용하며, `vue-router`를 활용한 라우팅을 제공합니다. 또한 `fontawesome`을 통한 아이콘 관리 및 `dayjs`를 이용한 날짜 처리 기능이 포함되어 있습니다.

## 주요 기능
- **Vue 3 기반 SPA**
- **Pinia를 활용한 상태 관리**
- **Vue Router를 통한 클라이언트 사이드 라우팅**
- **FontAwesome 아이콘 지원**
- **Day.js를 활용한 날짜 처리**
- **Secure-ls를 통한 안전한 데이터 저장**
- **Vite를 사용한 빠른 빌드 및 개발 환경 제공**

## 설치 및 실행

### 1. 패키지 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```
서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

### 3. 빌드 및 배포
```bash
npm run build
```
생성된 파일은 `dist/` 디렉토리에 위치하며, 정적 호스팅 환경에서 배포할 수 있습니다.

## 프로젝트 구조
```
├── public/                 # 정적 파일
├── src/                  
│   ├── assets/             # 전역 스타일 및 테마 설정
│   ├── components/         # 재사용 가능한 UI 컴포넌트(Atomic design pattern)
│   │   ├── atoms/          # 기본 UI 요소(input, button 등)
│   │   ├── molecules/      # 작은 조합 UI(dropdown, pagination 등)
│   │   ├── organisms/      # 주요 UI 단위(modal, GNV, table 등)
│   │   ├── templates/      # 페이지 공통 레이아웃
│   │   ├── pages/          # 기능별 페이지 (캠페인 관리, 사용자 관리 등)
│   ├── composables/        # 재사용 가능한 VUE Composition API hook
│   ├── constants/          # 프로젝트 상수값 정리
│   ├── routes/             # VUE router 정의
│   ├── store/              # 전역 스토어(VUE Pinia)
│   ├── types/              # JS Doc 타입 정의
│   ├── utils/              # 공통적인 유틸리티 함수 및 헬퍼
│   └── App.js              # 애플리케이션 진입점
└── package.json            # 프로젝트 의존성 및 스크립트
```

## 사용 기술
- **프레임워크:** Vue 3
- **상태 관리:** Pinia + Persisted State
- **라우팅:** Vue Router
- **아이콘:** FontAwesome
- **유틸리티:** Lodash-es, Day.js
- **데이터 저장:** Secure-ls
- **번들러:** Vite

## 개발 도구
- **Vite**: 빠른 개발 환경 및 번들링
- **Vite Plugin Vue DevTools**: Vue 개발 도구 지원
- **Vite SVG Loader**: SVG 파일을 Vue 컴포넌트로 로드 가능

