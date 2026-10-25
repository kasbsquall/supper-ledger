import { Translate } from "@phosphor-icons/react";
import type { Lang } from "../ledger/types";
import { dict } from "../i18n";

// English / Español. Implements prd.md > Language and currency.

type Props = {
  lang: Lang;
  onChange: (lang: Lang) => void;
};

export function LanguageSwitch({ lang, onChange }: Props) {
  const t = dict(lang);
  return (
    <div className="seg" role="group" aria-label={t.language}>
      <button type="button" aria-pressed={lang === "en"} lang="en" onClick={() => onChange("en")}>
        <Translate weight="light" className="ico" aria-hidden="true" />
        EN
      </button>
      <button type="button" aria-pressed={lang === "es"} lang="es" onClick={() => onChange("es")}>
        ES
      </button>
    </div>
  );
}
