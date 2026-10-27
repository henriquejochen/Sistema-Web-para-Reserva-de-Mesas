import type { SVGProps } from "react";
export type IconName = "calendar" | "users" | "home" | "leaf" | "check" | "globe" | "truck" | "link" | "arrow" | "logout" | "table" | "chevron" | "utensils" | "search" | "clock" | "alert";
const paths: Record<IconName, string> = {
  search: "M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-2 5 6 6",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2",
  alert: "m12 3 10 18H2L12 3Zm0 6v5m0 3v.01",
  calendar: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3 10h2m4 0h2m-8 4h2",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  leaf: "M20 3c-1 7 3 14-6 17a8 8 0 0 1-10-9C6 3 14 6 20 3ZM3 22 16 9",
  check: "m5 12 4 4L19 6", globe: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3a17 17 0 0 1 0 18 17 17 0 0 1 0-18Z",
  truck: "M1 4h13v13H1Zm13 5h4l4 5v3h-8M8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm12 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
  link: "m10 13 4-4m-6 6-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m2 3 2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0",
  arrow: "M4 12h16m-6-6 6 6-6 6", logout: "M9 4H4v16h5m5-13 5 5-5 5m-6-5h13",
  table: "M3 8h18v5H3Zm2 5v8m14-8v8M6 3v5m12-5v5", chevron: "m6 9 6 6 6-6",
  utensils: "M4 2v7a3 3 0 0 0 6 0V2M7 2v20M20 2c-5 2-6 12 0 12V2Zm0 12v8",
};
export function Icon({ name, size = 22, ...props }: SVGProps<SVGSVGElement> & {name: IconName; size?: number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}><path d={paths[name]}/></svg>;
}
