import { Flask, LockSimple, Plus } from "@phosphor-icons/react";
import type { Lang } from "../ledger/types";
import { dict } from "../i18n";
import { Header } from "./Header";
import { Thermometer } from "./Thermometer";

// What the sample dinner looks like two-thirds of the way to its goal, so the first screen shows the object, not only words.
const PREVIEW = { progress: 0.665, goal: 300000 };

// First use. Implements prd.md > Screens and Layout (Welcome) and prd.md > States and Boundaries (first use).

type Props = {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onSample: () => void;
  onStart: () => void;
};

export function Welcome({ lang, onLangChange, onSample, onStart }: Props) {
  const t = dict(lang);
  return (
    <Header lang={lang} onLangChange={onLangChange}>
      <div className="welcome-stage">
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
      <div className="welcome-art panel goal rise" style={{ ["--b" as string]: 2 }} aria-hidden="true">
        <Thermometer progress={PREVIEW.progress} goal={PREVIEW.goal} lang={lang} pulseKey={0} />
      </div>
      </div>
    </Header>
  );
}
