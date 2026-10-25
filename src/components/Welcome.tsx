import { Flask, LockSimple, Plus } from "@phosphor-icons/react";
import type { Lang } from "../ledger/types";
import { dict } from "../i18n";
import { Header } from "./Header";

// First use. Implements prd.md > Screens and Layout (Welcome) and prd.md > States and Boundaries (first use).

type Props = {
  lang: Lang;
  onSample: () => void;
  onStart: () => void;
};

export function Welcome({ lang, onSample, onStart }: Props) {
  const t = dict(lang);
  return (
    <Header lang={lang}>
      <div className="welcome rise">
        <h1>{t.welcomeTitle}</h1>
        <p>{t.welcomeBody}</p>
        <div className="welcome-actions">
          <button className="btn-light" type="button" onClick={onSample}>
            <Flask weight="light" className="ico" aria-hidden="true" />
            {t.trySample}
          </button>
          <button className="btn-ghost" type="button" onClick={onStart}>
            <Plus weight="light" className="ico" aria-hidden="true" />
            {t.startDinner}
          </button>
        </div>
        <p className="welcome-note">
          <LockSimple weight="light" className="ico" aria-hidden="true" />
          {t.privacyNote}
        </p>
      </div>
    </Header>
  );
}
