import { Translate } from "@phosphor-icons/react";
import type { Lang } from "../ledger/types";
import { dict } from "../i18n";
import { play } from "../lib/sound";

// English / Español. Implements prd.md > Language and currency.

type Props = {
  lang: Lang;
  onChange: (lang: Lang) => void;
};

export function LanguageSwitch({ lang, onChange }: Props) {
  const t = dict(lang);
  function pick(next: Lang) {
    if (next !== lang) play("toggle");
    onChange(next);
  }
  return (
    <div className="seg" role="group" aria-label={t.language}>
      <button type="button" aria-pressed={lang === "en"} lang="en" onClick={() => pick("en")}>
        <Translate weight="light" className="ico" aria-hidden="true" />
        EN
      </button>
      <button type="button" aria-pressed={lang === "es"} lang="es" onClick={() => pick("es")}>
        ES
      </button>
    </div>
  );
}
