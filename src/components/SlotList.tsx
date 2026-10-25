import { CircleDashed, Clock, CookingPot, Package } from "@phosphor-icons/react";
import type { Lang } from "../ledger/types";
import type { SlotTotal } from "../ledger/totals";
import { dict, formatTime } from "../i18n";

// Implements prd.md > The board: plates to cook per pickup time, and how many already went out.

type Props = {
  slots: SlotTotal[];
  lang: Lang;
};

export function SlotList({ slots, lang }: Props) {
  const t = dict(lang);
  return (
    <section className="panel rise" style={{ ["--b" as string]: 2 }} aria-labelledby="slots-h">
      <div className="phead">
        <CookingPot weight="light" className="ico" aria-hidden="true" />
        <h2 id="slots-h">{t.slotsHeading}</h2>
        <span className="aside">{t.cookCount}</span>
      </div>
      <ul className="slots">
        {slots.map((s, i) => {
          const f = s.plates ? s.pickedUp / s.plates : 0;
          const PickedIcon = s.pickedUp ? Package : CircleDashed;
          return (
            <li className="slot" key={s.slot}>
              <span className="time">
                <Clock weight="light" className="ico" aria-hidden="true" />
                {formatTime(s.slot)}
              </span>
              <span className="cook">
                <b className="num">{s.plates}</b>
                <span>{t.platesToCook}</span>
              </span>
              <span className="bar">
                <span className="meter" role="meter" aria-valuemin={0} aria-valuemax={s.plates} aria-valuenow={s.pickedUp} aria-label={`${formatTime(s.slot)} ${t.pickedUpCount}`}>
                  <i style={{ transform: `scaleX(${f})`, transitionDelay: `${i * 70}ms` }} />
                </span>
                <span className={`picked${s.pickedUp ? "" : " none"}`}>
                  <PickedIcon weight="light" className="ico" aria-hidden="true" />
                  <span className="num">{s.pickedUp}</span>&nbsp;{t.pickedUpCount}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
