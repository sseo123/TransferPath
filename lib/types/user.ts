export interface User {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  currentCollege: string | null;
  major: string | null;
  targetUni: string | null;
  startSeason: string | null;
  startYear: number | null;
}
