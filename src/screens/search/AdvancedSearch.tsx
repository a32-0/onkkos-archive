import { ADVANCED } from "@/content/search";
import { VOICE } from "@/content/voice";
import { ROUTES } from "@/routes";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";

import { Shell } from "../shell/Shell";
import type { ShellChrome } from "../shell/voice";
import styles from "./Search.module.css";
import { SearchPanel } from "./SearchPanel";
import type { SearchFilters, SearchPageView } from "./state";

export function AdvancedSearch({
  chrome,
  filters,
  page,
}: {
  chrome: ShellChrome;
  filters: SearchFilters;
  page: SearchPageView;
}) {
  return (
    <Shell chrome={chrome} tab="goal" tabs bar={{ title: ADVANCED.title, back: ROUTES.goals }}>
      <div className={styles.page}>
        {chrome.voice.on && (
          <div className={styles.voice}>
            <OnkkoLine place="top" line={VOICE.goals} />
          </div>
        )}
        <SearchPanel filters={filters} page={page} />
      </div>
    </Shell>
  );
}
