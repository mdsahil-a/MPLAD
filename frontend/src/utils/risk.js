export function tierOf(risk) {
  if (typeof risk === 'string') {
    const lower = risk.toLowerCase();
    if (['high', 'med', 'medium', 'low'].includes(lower)) {
      return lower === 'medium' ? 'med' : lower;
    }
  }
  const r = typeof risk === 'number' ? risk : (parseInt(risk, 10) || 0);
  if (r >= 65) return 'high';
  if (r >= 35) return 'med';
  return 'low';
}
