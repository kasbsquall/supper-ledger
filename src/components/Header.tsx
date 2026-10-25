import type { ReactNode } from "react";
import { Flask, HandCoins, Plus, Tag } from "@phosphor-icons/react";
import type { Dinner, Lang } from "../ledger/types";
import { dict, formatMoney } from "../i18n";

// The tomato-red header band shared by every screen. spec.md > Look and Feel.

export function Brand({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <span className="brand" aria-label={t.boardLabel}>
      <svg viewBox="0 0 20 30" aria-hidden="true">
        <rect x="6" y="1.5" width="8" height="19" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="8.5" y="9" width="3" height="12" rx="1.5" fill="currentColor" />
        <circle cx="10" cy="23.5" r="5" fill="currentColor" />
      </svg>
      {t.brand}
    </span>
  );
}

type Props = {
  lang: Lang;
  dinner?: Dinner;
  /** Right side of the top bar. */
  actions?: ReactNode;
  /** Shown on the sample banner. */
  onStartOwn?: () => void;
  children?: ReactNode;
};

export function Header({ lang, dinner, actions, onStartOwn, children }: Props) {
  const t = dict(lang);
  return (
    <header className="band">
      <div className="wrap">
        <div className="top">
          <Brand lang={lang} />
          <span className="spacer" />
          {actions}
        </div>
        {dinner?.isSample && (
          <div className="sample">
            <span className="chip-sample">
              <Flask weight="light" className="ico" aria-hidden="true" />
              {t.sampleChip}
            </span>
            <p>{t.sampleNote}</p>
            {onStartOwn && (
              <button className="btn-ghost" type="button" onClick={onStartOwn}>
                <Plus weight="light" className="ico" aria-hidden="true" />
                {t.startOwnDinner}
              </button>
            )}
          </div>
        )}
        {dinner && (
          <div className="dinner rise" style={{ ["--b" as string]: 0 }}>
            <h1>{dinner.name}</h1>
            <ul className="meta">
              <li>
                <Tag weight="light" className="ico" aria-hidden="true" />
                <span className="num">{formatMoney(dinner.pricePerPlate, lang)}</span> {t.aPlate}
              </li>
              {dinner.payTo && (
                <li>
                  <HandCoins weight="light" className="ico" aria-hidden="true" />
                  {t.payTo} {dinner.payTo}
                </li>
              )}
            </ul>
          </div>
        )}
        {children}
      </div>
    </header>
  );
}
