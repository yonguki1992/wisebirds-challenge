# Wisebirds Frontend Challenge

## 개요
이 프로젝트는 Wisebirds 프론트엔드 채용 사전과제로 개발되었으며, 내부 UI/UX 사양에 따라 캠페인 관리와 사용자 관리 기능을 구현합니다. 프로젝트는 다양한 권한 설정과 데이터 검증을 통해 사용자 경험을 극대화하는 것을 목표로 합니다.

## 주요 기능
- **글로벌 내비게이션 바 (GNB)**
  - 로고 및 Wisebirds 브랜딩 표시
  - 메뉴 접근 제어  
    - *캠페인*: 어드민, 매니저, 뷰어 권한 모두 접근 가능  
    - *사용자*: 어드민 전용
  - 내 정보 팝업: 이름, 이메일(아이디), 회사명 표시
  - 권한 설정: 어드민은 매니저 및 뷰어의 권한을 변경할 수 있으며, 매니저/뷰어 선택 시 사용자 메뉴는 제거되고 접근이 제한됩니다.

- **캠페인 관리**
  - 페이지 타이틀: “캠페인 관리”
  - 캠페인 목록을 테이블 형식으로 제공
    - **상태:** 토글 버튼으로 표시  
      - 어드민 및 매니저는 수정 가능, 뷰어는 비활성화 상태
    - **캠페인명:** 서버에서 제공하는 텍스트 그대로 표기
    - **캠페인 목적:** 코드 값을 텍스트로 매칭하여 표시
    - **노출수 및 클릭수:** 3자리마다 콤마(,) 구분 적용
    - **CTR 및 VTR:** 소수점 반올림 후 % 표기
    - **동영상 조회수:** 정수 값으로 표시
  - 페이지네이션: 한 페이지당 25개 항목 표시

- **사용자 관리**
  - 페이지 타이틀: “사용자 관리”
  - 사용자 목록을 테이블 형식으로 제공
    - **아이디(이메일) 및 이름:** 서버에서 제공한 텍스트 그대로 표기
    - **마지막 로그인 일시:** yyyy-mm-dd HH:mm:ss 포맷 적용
    - **수정:** 사용자 수정 모달 제공
  - **사용자 생성 모달**
    - 입력 필드: 아이디(이메일), 비밀번호, 비밀번호 확인, 이름
    - **아이디(이메일):**
      - 9~50자, 이메일 형식 검증 및 중복 체크
    - **비밀번호:**
      - 영문, 숫자, 특수문자 조합 8~15자, 기본 마스킹 처리(해제 가능)
    - **비밀번호 확인:** 입력한 비밀번호와 일치 여부 검증
    - **이름:**
      - 한글 또는 영문 1~16자, 숫자 및 특수문자/공백 입력 불가
  - **사용자 수정 모달**
    - 아이디는 읽기 전용, 이름 수정 시 동일한 유효성 검증 적용

- **에러 처리**
  - 전체 렌더링 에러 및 서버 에러 발생 시 에러 모달을 통해 사용자에게 알림 제공

## 프로젝트 구조
```
fake-api
├── db.json/                # JSON Server DB
├── index.js/               # JSON Server 진입점
└── package.json            # 프로젝트 의존성 및 스크립트
```
```
wisebirds-admin
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
> *프로젝트 구조는 실제 구현 상황에 따라 조정될 수 있습니다.*

## 설치 및 실행 방법

### Requirements
For building and running the application you need:

- Node.js 18.16.1
- Npm 9.5.1 

**레포지토리 클론**
   ```bash
   git clone https://github.com/yonguki1992/wisebirds-challenge.git
   cd wisebirds-challenge
   ```
**Backend(JSON Server)**
   ```bash
   cd fake-api
   nvm use v.18.16.1
   npm install
   npm run dev
   ```
**Frontend(Vue)**
   ```bash
   cd wisebirds-admin
   nvm use v.18.16.1
   npm install
   npm run dev
   ```
브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속하여 애플리케이션을 확인합니다.

## 사용 기술
### **Config**
![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

### **Backend**
![Javascript](https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white)

### **Frontend**
![Javascript](https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
### **State Management**
![Pinia](https://img.shields.io/badge/pinia-F7DF1E?style=for-the-badge&logo=pinia&logoColor=black)

### **ETC**
![HTML5](https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![FONTAWESOME](https://img.shields.io/badge/fontawesome-339AF0?style=for-the-badge&logo=fontawesome&logoColor=white)

## 문의
프로젝트 관련 문의는 [연락처 또는 이메일 주소]로 문의해 주시기 바랍니다.
