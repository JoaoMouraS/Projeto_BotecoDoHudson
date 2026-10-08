import { useMemo, useState } from "react";
import "./EventCalendar.css";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

const toKey = (date) => date.toISOString().slice(0, 10);

export default function EventCalendar({ value, onChange, min }) {
  const minimum = useMemo(() => new Date(`${min}T12:00:00`), [min]);
  const [month, setMonth] = useState(() => new Date(minimum.getFullYear(), minimum.getMonth(), 1));
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const days = Array.from({ length: first.getDay() + last.getDate() }, (_, index) => (
    index < first.getDay() ? null : new Date(month.getFullYear(), month.getMonth(), index - first.getDay() + 1)
  ));

  const mudarMes = (delta) => {
    const next = new Date(month.getFullYear(), month.getMonth() + delta, 1);
    if (next < new Date(minimum.getFullYear(), minimum.getMonth(), 1)) return;
    setMonth(next);
  };

  return <div className="admin-calendar">
    <div className="admin-calendar__heading">
      <button type="button" onClick={() => mudarMes(-1)} aria-label="Mês anterior">‹</button>
      <strong>{MONTHS[month.getMonth()].toUpperCase()} {month.getFullYear()}</strong>
      <button type="button" onClick={() => mudarMes(1)} aria-label="Próximo mês">›</button>
    </div>
    <div className="admin-calendar__weekdays">{WEEKDAYS.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
    <div className="admin-calendar__days">
      {days.map((day, index) => day ? <button
        key={toKey(day)}
        type="button"
        className={value === toKey(day) ? "is-selected" : ""}
        disabled={day < minimum}
        onClick={() => onChange(toKey(day))}
      >{day.getDate()}</button> : <span key={`empty-${index}`} />)}
    </div>
  </div>;
}
