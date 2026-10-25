import { useState } from "react";
import { SpeakerSimpleHigh, SpeakerSimpleSlash } from "@phosphor-icons/react";
import type { Lang } from "../ledger/types";
import { dict } from "../i18n";
import { isSoundOn, play, setSoundOn } from "../lib/sound";

// Mutes the micro-sounds. Sits next to the language switch in the header; the choice is remembered.

export function SoundSwitch({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const [isOn, setIsOn] = useState(isSoundOn);
  const Icon = isOn ? SpeakerSimpleHigh : SpeakerSimpleSlash;

  function toggle() {
    setSoundOn(!isOn);
    setIsOn(!isOn);
    play("toggle");
  }

  return (
    <button type="button" className="sound-sw" aria-pressed={isOn} aria-label={t.sounds} title={isOn ? t.soundsOn : t.soundsOff} onClick={toggle}>
      <Icon weight="light" className="ico" aria-hidden="true" />
    </button>
  );
}
