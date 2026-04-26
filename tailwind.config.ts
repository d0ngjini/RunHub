import type { Config } from "tailwindcss";

/**
 * Tailwind v4는 주로 `app/globals.css`의 @source / @import "tailwindcss"로 동작합니다.
 * shadcn CLI·에디터 호환을 위해 구성 파일은 유지합니다. (v3용 plugin은 v4 흐름에서 쓰지 않음)
 */
const config: Config = {
  darkMode: "class",
};

export default config;
