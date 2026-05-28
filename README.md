# Runddy Client

러닝 코스를 지도에서 탐색하고, GPX/Strava 기록으로 나만의 코스를 등록할 수 있는 모바일 우선 러닝 코스 플랫폼입니다.

Runddy Client는 “어디를 달릴지 고르는 순간”에 집중합니다. 사용자는 지도와 목록을 오가며 주변 코스를 찾고, 거리/난이도/환경/코스 형태를 기준으로 필터링하며, 코스 상세 정보와 리뷰를 확인한 뒤 저장하거나 직접 코스를 등록할 수 있습니다.

## 한눈에 보기

- **서비스 유형**: 러닝 코스 탐색, 리뷰, 북마크, 코스 등록 웹앱
- **주요 사용자**: 새로운 러닝 코스를 찾는 러너, GPX/Strava 기록을 코스로 공유하고 싶은 러너
- **플랫폼 성격**: 모바일 브라우저 중심, 한국 사용자를 위한 Naver Maps 기반 위치 서비스
- **서비스 URL**: https://www.runddy.co.kr
- **Repository**: https://github.com/RunddyProject/Client

## 주요 기능

### 코스 탐색

- 지도/목록 전환으로 코스 탐색
- 현재 지도 중심 또는 사용자 GPS 위치 기준 재검색
- 검색어 기반 코스 검색과, 검색 결과가 없을 때 Naver geocoding fallback
- 코스 카드와 지도 marker를 연동해 선택한 코스를 중심으로 확인
- 목록 화면은 가상 스크롤로 많은 코스를 부드럽게 렌더링

### 필터링

- 공식 코스 / 사용자 코스 구분
- 난이도, 러닝 환경, 코스 형태 필터
- 거리, 고도 조건 필터
- 마라톤 카테고리 조건 처리
- 필터 조건에 맞는 코스 수 조회

### 코스 상세

- 코스 기본 정보, 거리, 고도, 형태, 환경 정보 표시
- Naver Map 기반 상세 경로 확인
- 고도 차트 시각화
- GPX 다운로드
- 공유 버튼 제공
- 코스 리뷰 조회, 작성, 수정, 삭제

### 사용자 기능

- Kakao/Naver OAuth 로그인
- JWT access token 저장 및 refresh token 기반 갱신
- 인증이 필요한 액션에서 전역 로그인 안내 다이얼로그 표시
- 북마크한 코스와 내가 리뷰한 코스 확인
- 프로필 수정 및 회원 탈퇴

### 코스 등록

- GPX 파일 직접 업로드
- GPX preview, 코스 거리, 고도 데이터, 시작/종료 지점 주소 추출
- 코스명, 공개 여부, 마라톤 여부, 환경/형태 입력
- 내가 등록한 코스 목록/지도 확인
- 내가 등록한 코스 수정 및 삭제

### Strava 연동

- Strava OAuth 연결
- Strava 활동 목록 조회
- 선택한 활동의 GPX 데이터로 코스 등록
- 활동 이름을 코스 등록 폼에 자동 반영

## 기술 스택

| 영역         | 기술                                          |
| ------------ | --------------------------------------------- |
| UI           | React 19                                      |
| Language     | TypeScript 5.8                                |
| Build Tool   | Vite 7                                        |
| Routing      | React Router 7                                |
| Server State | TanStack React Query 5                        |
| Client State | Zustand                                       |
| Form         | React Hook Form                               |
| Styling      | Tailwind CSS 4, Radix/shadcn-style primitives |
| Map          | Naver Maps JavaScript API                     |
| Chart        | Recharts                                      |
| GPX          | gpxparser, @mapbox/polyline                   |
| Test         | Vitest, Testing Library                       |
| Tooling      | ESLint 9, Prettier, Style Dictionary          |

## 프론트엔드 설계 포인트

### Feature-Sliced 구조

도메인별 feature를 분리해 화면 조합과 비즈니스 로직의 경계를 나눴습니다.

```text
src/
  app/        앱 초기화, provider, route guard, routing
  pages/      route 단위 화면 조합
  features/   course, map, user, strava, course-upload, my-course
  shared/     공통 UI, hooks, lib, icon, design token
```

### 데이터 흐름

- API 응답과 cache는 React Query로 관리합니다.
- 지도 중심, 마지막 검색 위치, 뷰 모드, 목록 스크롤 위치처럼 세션 동안 유지해야 하는 UI 상태는 Zustand + `sessionStorage`에 저장합니다.
- 인증 상태는 `AuthContext`에서 관리하고, HTTP client가 access token 주입과 401 refresh retry를 담당합니다.

### 지도 성능

- 지도 marker, polyline, viewport 상태를 hook 단위로 분리했습니다.
- 지도 화면은 container/view 구조로 나누어 지도 비즈니스 로직과 렌더링을 분리했습니다.
- 코스 목록은 virtual scroll을 사용해 렌더링 비용을 제한합니다.
- route page는 lazy loading으로 분리해 초기 번들 부담을 줄였습니다.

### 디자인 시스템

- Tailwind CSS 4 기반의 semantic color와 typography utility를 사용합니다.
- 디자인 토큰은 `scripts/tokens`에서 생성되며, 생성 파일은 직접 수정하지 않습니다.
- 모바일 중심 레이아웃을 기준으로 `max-w-xl`, `dvh`, safe-area inset을 사용합니다.

## 주요 화면과 라우트

| Route                   | 설명                  | 인증     |
| ----------------------- | --------------------- | -------- |
| `/`, `/course`          | 코스 지도/목록 탐색   | public   |
| `/course/:uuid`         | 코스 상세 정보        | public   |
| `/course/:uuid/map`     | 코스 상세 지도        | public   |
| `/course/upload`        | GPX/Strava 코스 등록  | required |
| `/course/my`            | 내가 등록한 코스      | required |
| `/course/my/:uuid/edit` | 내가 등록한 코스 수정 | required |
| `/strava/activities`    | Strava 활동 선택      | required |
| `/login`                | Kakao/Naver 로그인    | guest    |
| `/me`                   | 내 정보, 북마크, 리뷰 | required |
| `/me/edit`              | 프로필 수정           | required |
| `/me/delete`            | 회원 탈퇴             | required |

## 로컬 실행

```bash
yarn install
yarn dev
```

Naver Maps client 설정에 특정 local URL이 필요하면 `.env`에 `DEV_SERVER_PORT`를 설정합니다. `.env`와 `.env.*`는 git에 포함하지 않습니다.

```bash
VITE_SERVER_DOMAIN=
VITE_CLIENT_URL=
VITE_NAVER_MAP_CLIENT_ID=
VITE_GA_MEASUREMENT_ID=
DEV_SERVER_PORT=
```

## 스크립트

```bash
yarn dev              # Vite dev server 실행
yarn build            # TypeScript build + production build
yarn preview          # production build preview
yarn lint             # ESLint 검사
yarn lint:fix         # ESLint 자동 수정
yarn format           # Prettier 포맷
yarn test             # Vitest 실행
yarn test:coverage    # coverage 포함 테스트
yarn tokens:all       # 디자인 토큰 재생성
```

## 검증 방법

PR 전에는 아래 명령을 기준으로 확인합니다.

```bash
yarn lint
yarn test --run
yarn tsc --noEmit --project tsconfig.test.json --pretty false
yarn build
```

현재 테스트는 Strava 연동, 코스 업로드 hook, 전역 다이얼로그, 로그인 안내, Strava 활동 페이지를 중심으로 구성되어 있습니다.

## 구현 시 고려한 점

Runddy는 지도, 위치, 인증, 파일 업로드가 함께 얽히는 서비스라 단순한 CRUD 화면보다 상태 흐름이 복잡합니다. 구현할 때는 사용자의 탐색 맥락이 끊기지 않는 것과 모바일 환경에서 지도 UI가 무겁게 느껴지지 않는 것을 우선했습니다.

- 지도 이동, GPS 검색, 키워드 geocoding fallback, 필터링을 하나의 탐색 흐름으로 연결했습니다.
- 서버 데이터, 지도 UI 상태, 인증 상태의 책임을 분리해 화면 전환 후에도 사용자가 보던 맥락을 유지합니다.
- route lazy loading, 목록 virtual scroll, marker/polyline hook 분리로 모바일 지도 화면의 렌더링 비용을 낮췄습니다.
- Naver Maps local URL 제약, OAuth redirect, access token refresh, GPX 파일 처리처럼 실제 운영에서 마주치는 조건을 코드 구조에 반영했습니다.
- 업로드, Strava 연동, 전역 다이얼로그처럼 실패 가능성이 높은 흐름은 테스트로 검증합니다.

## 향후 개선 아이디어

- 지도 marker clustering
- 코스 리뷰 작성 UX 고도화
- MSW 기반 API mocking 확대
- Playwright 기반 주요 사용자 여정 E2E 테스트
- remaining ESLint warning 정리와 type-aware lint 강화
