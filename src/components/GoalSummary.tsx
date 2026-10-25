import NumberFlow from "@number-flow/react";
import { ChatCircleText, CheckCircle, FlagPennant, ForkKnife, HourglassMedium, TrendUp, UsersThree } from "@phosphor-icons/react";
import type { Lang } from "../ledger/types";
import type { Totals } from "../ledger/totals";
import { currencySymbol, dict, formatMoney } from "../i18n";
import { Thermometer } from "./Thermometer";

// Implements prd.md > The board: dollars collected against the goal, plus the three supporting figures.

type Props = {
  totals: Totals;
  lang: Lang;
  pulseKey: number;
};

export function GoalSummary({ totals, lang, pulseKey }: Props) {
  const t = dict(lang);
  const pct = Math.round(totals.progress * 100);
  const left = totals.goal - totals.collected;
  const locale = t.locale;

  // Before the first paste there is nothing to report: show the goal and what to do, not zeros.
  if (totals.people === 0) {
    return (
      <section className="panel goal rise" style={{ ["--b" as string]: 1 }} aria-labelledby="goal-h">
        <h2 id="goal-h" className="sr">{t.goalHeading}</h2>
        <Thermometer progress={0} goal={totals.goal} lang={lang} pulseKey={0} />
        <div className="fig-block empty-goal">
          <p className="of">{t.goalLabel} <span className="num">{formatMoney(totals.goal, lang)}</span></p>
          <p className="empty-msg">
            <ChatCircleText weight="light" className="ico" aria-hidden="true" />
            {t.emptyBoard}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel goal rise" style={{ ["--b" as string]: 1 }} aria-labelledby="goal-h">
      <h2 id="goal-h" className="sr">{t.goalHeading}</h2>
      <Thermometer progress={totals.progress} goal={totals.goal} lang={lang} pulseKey={pulseKey} />

      <div className="fig-block">
        <div className="fig" aria-hidden="true">
          <span className="cur">{currencySymbol(lang)}</span>
          <NumberFlow value={Math.floor(totals.collected / 100)} locales={locale} />
        </div>
        <p className="sr" aria-live="polite">
          {`${formatMoney(totals.collected, lang)} ${t.collectedOf} ${formatMoney(totals.goal, lang)} ${t.goal}, ${pct}%`}
        </p>
        <div className="of">
          <span>
            {t.collectedOf} <span className="num">{formatMoney(totals.goal, lang)}</span> {t.goal}
          </span>
          <span className="pct">
            <TrendUp weight="light" className="ico" aria-hidden="true" />
            <span className="num">{pct}%</span>
          </span>
        </div>
      </div>

      <p className="togo">
        <FlagPennant weight="light" className="ico" aria-hidden="true" />
        {left > 0 ? (
          <span>
            <b className="num">{formatMoney(left, lang)}</b> {t.toGo}
          </span>
        ) : (
          <span>
            <b>{t.goalReached}</b>
          </span>
        )}
      </p>

      <div className="stats">
        <div className="stat">
          <ForkKnife weight="light" className="ico" aria-hidden="true" />
          <b className="num"><NumberFlow value={totals.platesSold} locales={locale} /></b>
          <span>{t.platesSold}</span>
        </div>
        <div className="stat">
          <CheckCircle weight="light" className="ico" aria-hidden="true" />
          <b className="num"><NumberFlow value={totals.platesPaid} locales={locale} /></b>
          <span>{t.platesPaid}</span>
        </div>
        <div className="stat owed">
          <HourglassMedium weight="light" className="ico" aria-hidden="true" />
          <b className="num">{formatMoney(totals.owed, lang)}</b>
          <span>{t.stillOwed}</span>
        </div>
        <div className="stat">
          <UsersThree weight="light" className="ico" aria-hidden="true" />
          <b className="num"><NumberFlow value={totals.people} locales={locale} /></b>
          <span>{t.people}</span>
        </div>
      </div>
    </section>
  );
}
