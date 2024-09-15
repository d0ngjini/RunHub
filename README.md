<div style="text-align: left;">
  <img width="360" style="background: rgba(255,255,255,0.85);" src="./images/RunHub-logo-black.png" alt="Description" />
</div>

[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fthisisdj%2FRunHub&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=true)](https://hits.seeyoufarm.com)

# Explore, Share, Achieve! RunHub 런허브 🏃

## 프로젝트 소개
RunHub는 러닝 애호가들을 위한 혁신적인 플랫폼입니다. 이제 자신만의 러닝 코스를 지도 앱에서 직접 디자인하고 저장할 수 있습니다. RunHub의 직관적인 인터페이스를 통해 코스의 경로 등을 손쉽게 설정해보세요.

또한, 다른 사용자들이 만든 코스를 탐색하고 리뷰를 남길 수 있는 기능도 제공합니다. 친구들이나 동료 러너들이 추천한 코스를 따라 해보며 새로운 러닝 경로를 발견해보세요.

RunHub와 함께라면 매일매일의 러닝이 더욱 즐겁고 의미 있는 시간이 될 것입니다. 나만의 러닝 여정을 시작해보세요!

## 사용된 기술 스택

### Environment
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=Git&logoColor=white)
![Github](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=GitHub&logoColor=white)             

### Config
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)        

### Development
- Frontend<br>
![typescript](https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=Next.js&logoColor=white)
![NextUI](https://img.shields.io/badge/nextui-000000?style=for-the-badge&logo=nextui&logoColor=white)<br>
- Backend<br>
![prisma](https://img.shields.io/badge/prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![postgresql](https://img.shields.io/badge/postgresql-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Auth.js](https://img.shields.io/badge/Auth.js-6614D9?style=for-the-badge&logo=Next.js&logoColor=white)

## Hosting Yourself
### Installation
``` bash
$ git clone https://github.com/thisisdj/RunHub.git
$ cd RunHub
$ npm install
$ mkdir .env
$ mkdir .env.local
```

### Edit Environment
``` bash
./.env 
DATABASE_URL="postgresql://postgres:*insertuserpasswd*!@localhost:5432/postgres?schema=public" # Connect your existing database
```
``` bash
$ npx prisma db push
```
```bash
$ npx auth secret # Create your AUTH_SECRET
```
```bash
./.env.local
AUTH_SECRET=                # auth.js cli
AUTH_KAKAO_ID=              # 카카오 발급
AUTH_KAKAO_SECRET=          # 카카오 발급
```

