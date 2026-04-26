<div align="left">
  <img width="360" src="./images/RunHub-logo-black.png" alt="RunHub" />
</div>


# RunHub 런허브 · Explore, Share, Achieve

러너를 위한 웹 앱입니다. **브이월드(VWorld)** 지도 위에서 러닝 코스를 그리고 등록하고, 다른 사람의 코스를 탐색·저장·리뷰할 수 있습니다. **러닝 피드**로 기록을 남기고, **카카오 로그인**으로 계정을 연동합니다.

## 주요 기능

| 영역 | 설명 |
|------|------|
| **탐색** | 지도에서 코스 마커·카드 확인, 코스 상세·리뷰·평점 |
| **코스 작성** | 지도에 경로 그리기 후 등록 |
| **계정** | Better Auth + 카카오 OAuth, 프로필(이름·소개·이미지) |
| **피드** | 러닝 관련 게시물 작성·열람 |
| **기타** | 저장한 코스, 알림 패널, 급상승 코스 등 |

## 기술 스택

- **앱**: [Next.js](https://nextjs.org/) 15 · React 18 · TypeScript  
- **지도**: [OpenLayers](https://openlayers.org/) · [rlayers](https://github.com/mmacaula/rlayers)  
- **UI**: Tailwind CSS 4 · [shadcn/ui](https://ui.shadcn.com/) (Radix) · Lucide  
- **데이터**: PostgreSQL · [Drizzle ORM](https://orm.drizzle.team/)  
- **인증**: [Better Auth](https://www.better-auth.com/) · 카카오 소셜 로그인  
- **기타**: SWR · Sonner(toast) · dayjs  

## 사전 요구 사항

- Node.js 20 권장  
- [pnpm](https://pnpm.io/)  
- PostgreSQL 연결 정보(로컬 또는 [Neon](https://neon.tech/) 등)  
- [카카오 개발자](https://developers.kakao.com/) 앱(REST API 키, Redirect URI)  
- [브이월드](https://www.vworld.kr/) OpenAPI 인증키(지도 타일)

## 로컬 실행

```bash
git clone https://github.com/d0ngjini/RunHub.git
cd RunHub
pnpm install
```

저장소에는 비밀이 없는 **`/.env.example`** 만 포함되어 있습니다. 로컬에서는 이 파일을 **`/.env`** 로 복사한 뒤 값을 채워야 합니다(`.env`는 git에 올리지 마세요).

```bash
cp .env.example .env
```

이후 `.env`를 열어 각 변수를 실제 값으로 바꿉니다. 로컬 기준 예시는 다음과 같습니다.

```env
# DB (PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"

# Better Auth — 브라우저·서버가 접근하는 앱 URL (로컬 예시)
BETTER_AUTH_BASE_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_BASE_URL=http://localhost:3000
BETTER_AUTH_SECRET=        # 긴 랜덤 문자열 (예: openssl rand -base64 32)

# 카카오 로그인
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=

# 지도 (VWorld)
NEXT_PUBLIC_VWORLD_TOKEN=
```

`.env.example`에 없는 주석이 필요하면 위 블록을 참고하면 됩니다.

DB 스키마를 DB에 맞출 때(로컬 개발):

```bash
pnpm exec drizzle-kit push
```

`drizzle/`에 SQL 마이그레이션이 있으면 팀 규칙에 맞게 `drizzle-kit migrate` 등으로 적용하면 됩니다.

개발 서버:

```bash
pnpm dev
```

브라우저에서 `http://localhost:3000` — 카카오 콘솔의 **Redirect URI**에 `http://localhost:3000/api/auth/callback/kakao`(또는 배포 도메인에 맞는 URL)를 등록해야 합니다.

## 스크립트

| 명령 | 설명 |
|------|------|
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 빌드 결과 실행 |
| `pnpm lint` | ESLint |

## 로드맵 / 할 일 (요약)

- 지도 회전 고정, 코스 그리기 되돌리기 등 편의 기능 보강  
- 리뷰 추천·삭제, 코스 등록자 표시 등 커뮤니티 기능 확장  

---

질문·이슈는 GitHub Issues로 남겨 주세요.
