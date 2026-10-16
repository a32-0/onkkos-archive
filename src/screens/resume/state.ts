import type { DateMenuMonth } from "@/ui/DateMenu/DateMenu";

export interface ResumeUpdate {
  since: string;
  name: string;
  version: string;
  meta: string;
  art: string | null;
  newest: boolean;
}

export type ResumeMonth = DateMenuMonth;

export type ResumeAction = (form: FormData) => Promise<void>;
