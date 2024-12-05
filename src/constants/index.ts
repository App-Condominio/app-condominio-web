export const PROTECTED_ROUTES = [
  "/dashboard",
  "/settings",
  "/notifications",
  "/account",
];
export const PUBLIC_ROUTES = ["/signin", "/signup", "/"];

export enum Tables {
  Condominiums = "condominiums",
  Files = "files",
  Resources = "resources",
  Users = "users",
  Newsletter = "newsletter",
  Events = "events",
  Bookings = "bookings",
  Polls = "polls",
  Votes = "polls_votes",
}

export const WEEK_DAYS = [
  {
    label: "Segunda",
    value: "Monday",
  },
  {
    label: "Terça",
    value: "Tuesday",
  },
  {
    label: "Quarta",
    value: "Wednesday",
  },
  {
    label: "Quinta",
    value: "Thursday",
  },
  {
    label: "Sexta",
    value: "Friday",
  },
  {
    label: "Sábado",
    value: "Saturday",
  },
  {
    label: "Domingo",
    value: "Sunday",
  },
];
