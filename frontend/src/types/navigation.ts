export type Screen =
  | "login"
  | "register"
  | "verify"
  | "client"
  | "reserve"
  | "confirmation"
  | "my-reservations"
  | "admin"
  | "daily"
  | "tables";

export type VerificationMethod = "email" | "phone";

export type Role = "client" | "admin";

export type NavigationItem = {
  screen: Screen;
  label: string;
  role: Role;
};
