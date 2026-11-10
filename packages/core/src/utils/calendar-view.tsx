import { h } from '@stencil/core';
import { formatLong, inRange, monthEnd, monthStart, monthWeeks, sameDay, today, weekDays } from './date';
import type { Messages } from './i18n';

export interface CalendarProps {
  /** Jour qui porte l'arrêt de tabulation ; le mois affiché est le sien. */
  focused: Date;
  selected?: Date;
  min?: Date;
  max?: Date;
  locale: string;
  m: Messages;
  /** Sens du dernier changement de mois, pour faire glisser le nouveau mois du bon côté. */
  direction?: 'next' | 'prev';
  onMonth: (step: 1 | -1) => void;
  onPick: (date: Date) => void;
  onGridKeyDown: (event: KeyboardEvent) => void;
}

const NavIcon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d={d} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);

/** Calendrier du motif Date Picker Dialog de l'APG : mois annoncé, mois précédent et suivant, grille de jours. */
const Calendar = ({ focused, selected, min, max, locale, m, direction, onMonth, onPick, onGridKeyDown }: CalendarProps) => {
  const now = today();
  const short = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  const long = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' });
  const month = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(focused);
  // Le bouton reste focalisable quand il ne mène nulle part : un bouton disabled perdrait le focus et casserait le piège à focus.
  const nav = (step: 1 | -1, blocked: boolean, label: string, d: string) => (
    <button type="button" class="nav" aria-label={label} aria-disabled={blocked ? 'true' : undefined} onClick={() => !blocked && onMonth(step)}>
      <NavIcon d={d} />
    </button>
  );
  return [
    <div class="header">
      {nav(-1, !!min && monthStart(focused) <= min, m.previousMonth, 'M15 6l-6 6 6 6')}
      <span class="month" id="month" aria-live="polite">
        {month}
      </span>
      {nav(1, !!max && monthEnd(focused) >= max, m.nextMonth, 'M9 6l6 6-6 6')}
    </div>,
    <div class="days">
      <table key={month} class="grid" role="grid" aria-labelledby="month" data-direction={direction} onKeyDown={onGridKeyDown}>
        <thead>
          <tr>
            {weekDays(m.firstDay).map((day) => (
              <th scope="col" abbr={long.format(day)}>
                {short.format(day)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthWeeks(focused, m.firstDay).map((week) => (
            <tr>
              {week.map((day) =>
                day ? (
                  <td role="gridcell" aria-selected={sameDay(day, selected) ? 'true' : undefined}>
                    <button
                      type="button"
                      class="day"
                      aria-label={formatLong(locale, day)}
                      aria-current={sameDay(day, now) ? 'date' : undefined}
                      tabIndex={sameDay(day, focused) ? 0 : -1}
                      disabled={!inRange(day, min, max)}
                      onClick={() => onPick(day)}
                    >
                      {day.getUTCDate()}
                    </button>
                  </td>
                ) : (
                  <td role="gridcell" />
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>,
  ];
};

/** Dialogue modal : Tab tourne entre mois précédent, mois suivant et le jour focalisable, sans sortir du calendrier. */
const trapTab = (panel: HTMLElement, event: KeyboardEvent) => {
  event.preventDefault();
  const stops = Array.from(panel.querySelectorAll<HTMLElement>('.nav, .day[tabindex="0"]'));
  const index = stops.indexOf((panel.getRootNode() as ShadowRoot).activeElement as HTMLElement);
  stops[(index + (event.shiftKey ? -1 : 1) + stops.length) % stops.length].focus();
};

interface PanelProps extends CalendarProps {
  panelRef: (el: HTMLElement) => void;
  /** Bouton qui ouvre le calendrier : il gère lui-même son clic, le focus qui y va ne ferme pas le calendrier. */
  toggle?: HTMLElement;
  onClose: () => void;
}

/** Dialogue modal du calendrier : Tab y reste, Échap le ferme, un focus parti ailleurs (le champ de saisie) aussi. */
export const CalendarPanel = ({ panelRef, toggle, onClose, ...calendar }: PanelProps) => {
  let panel: HTMLElement;
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') trapTab(panel, event);
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    onClose();
  };
  const onFocusout = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (next && next !== toggle && !panel.contains(next)) onClose();
  };
  return (
    <div
      ref={(el) => panelRef((panel = el!))}
      id="calendar"
      class="popup calendar"
      part="calendar"
      popover="manual"
      role="dialog"
      aria-modal="true"
      aria-label={calendar.m.dateChoose}
      onKeyDown={onKeyDown}
      onFocusout={onFocusout}
    >
      <Calendar {...calendar} />
    </div>
  );
};
