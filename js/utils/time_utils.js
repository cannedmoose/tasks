export const UNITS = {
  millis: 1,
  seconds: 1000,
  minutes: 1000 * 60,
  hours: 1000 * 60 * 60,
  days: 1000 * 60 * 60 * 24,
  weeks: 1000 * 60 * 60 * 24 * 7,
  months: 1000 * 60 * 60 * 24 * 28,
  years: 1000 * 60 * 60 * 24 * 365
};

const ORDER = [
  "years",
  "months",
  "weeks",
  "days",
  "hours",
  "minutes",
  "seconds",
  "millis"
];

export function toMillis(unit, amount) {
  return amount * UNITS[unit];
}

export function fromMillis(amount, lowest = "hours") {
  for (let i = 0; i < ORDER.length; i++) {
    let unit = ORDER[i];
    let converted = amount / UNITS[unit];
    if (Math.abs(converted) < 1) continue;

    return { unit, amount: converted };
  }
}
