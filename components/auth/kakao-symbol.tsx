/**
 * 카카오 로그인 디자인 가이드: 심볼 형태·색(#000) 유지
 * @see https://developers.kakao.com/docs/latest/ko/kakaologin/design-guide
 */
export function KakaoLoginSymbol({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 0C5.383 0 0 4.114 0 9.188c0 3.515 2.32 6.615 5.799 8.35L4.5 21.5l6.96-3.65c.24.032.484.048.73.048 6.617 0 12-4.114 12-9.188S18.617 0 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}
