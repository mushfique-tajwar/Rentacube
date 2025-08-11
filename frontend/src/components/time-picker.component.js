import React from 'react';

// Button-only 24h time picker with compact layout (no keyboard input)
// Props:
// - value: 'HH:MM'
// - onChange(value)
// - label?: string
// - stepMinutes?: number (default 15)
// - disabled?: boolean
export default function TimePicker({ value, onChange, label, stepMinutes = 15, disabled = false, showAmPm = false }) {
  const parse = (v) => {
    if (typeof v !== 'string') return { h: 0, m: 0 };
    const [hh, mm] = v.split(':');
    const h = Math.min(23, Math.max(0, parseInt(hh, 10) || 0));
    const m = Math.min(59, Math.max(0, parseInt(mm, 10) || 0));
    return { h, m };
  };
  const fmt = (n) => (n < 10 ? '0' + n : '' + n);
  const { h, m } = parse(value || '00:00');
  const period = h < 12 ? 'AM' : 'PM';
  const to12h = (hour24) => {
    const h12 = ((hour24 + 11) % 12) + 1;
    return fmt(h12);
  };

  const setTime = (nh, nm) => {
    if (disabled) return;
    const wrappedH = ((nh % 24) + 24) % 24;
    let wrappedM = nm;
    if (wrappedM >= 60) {
      const extraH = Math.floor(wrappedM / 60);
      wrappedM = wrappedM % 60;
      return setTime(wrappedH + extraH, wrappedM);
    }
    if (wrappedM < 0) {
      const borrowH = Math.ceil(Math.abs(wrappedM) / 60);
      wrappedM = (60 + (wrappedM % 60)) % 60;
      return setTime(wrappedH - borrowH, wrappedM);
    }
    onChange && onChange(`${fmt(wrappedH)}:${fmt(wrappedM)}`);
  };

  const Btn = ({ onClick, icon, ariaLabel }) => (
    <button type="button" className="btn btn-outline-secondary btn-sm tp-btn" onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      <i className={`fas ${icon}`} aria-hidden="true"></i>
    </button>
  );

  return (
    <div className="time-picker">
      {label && <label className="form-label d-block mb-1">{label}</label>}
      <div className="tp-grid">
        <div className="tp-unit" role="group" aria-label="Hour selector">
          <Btn onClick={() => setTime(h + 1, m)} icon="fa-chevron-up" ariaLabel="Increase hour" />
          <div className="tp-value" aria-live="polite">{showAmPm ? to12h(h) : fmt(h)}</div>
          <Btn onClick={() => setTime(h - 1, m)} icon="fa-chevron-down" ariaLabel="Decrease hour" />
        </div>
        <div className="tp-sep">:</div>
        <div className="tp-unit" role="group" aria-label="Minute selector">
          <Btn onClick={() => setTime(h, m + stepMinutes)} icon="fa-chevron-up" ariaLabel="Increase minutes" />
          <div className="tp-value" aria-live="polite">{fmt(m)}</div>
          <Btn onClick={() => setTime(h, m - stepMinutes)} icon="fa-chevron-down" ariaLabel="Decrease minutes" />
        </div>
      </div>
      {showAmPm && (
        <div className="tp-ampm mt-2" role="group" aria-label="AM or PM selector">
          <div className="btn-group btn-group-sm" role="group">
            <button type="button" className={`btn btn-outline-secondary ${period==='AM' ? 'active' : ''}`} disabled={disabled} onClick={() => { if (period !== 'AM') setTime(h - 12, m); }}>AM</button>
            <button type="button" className={`btn btn-outline-secondary ${period==='PM' ? 'active' : ''}`} disabled={disabled} onClick={() => { if (period !== 'PM') setTime(h + 12, m); }}>PM</button>
          </div>
        </div>
      )}
      <div className="form-text mt-1">{showAmPm ? '12-hour with AM/PM.' : '24-hour.'} Step: {stepMinutes}m.</div>
    </div>
  );
}
