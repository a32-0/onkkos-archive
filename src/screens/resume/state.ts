export interface ResumeUpdate {
  since: string;
  name: string;
  version: string;
  versions: readonly string[];
  dates: readonly string[];
  meta: string;
  art: string | null;
  newest: boolean;
}

export type ResumeAction = (form: FormData) => Promise<void>;
