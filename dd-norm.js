// Faixas e textos dos parâmetros, lidos de painel/params.json (dump do APVTS do plugin).
// Só conversão de knob e texto de legenda: nenhum som é calculado aqui.

export function faixa(p) {
  const { min, max } = p;
  const interval = p.interval || 0;
  const prende = (v) => Math.min(max, Math.max(min, v));
  const encaixa = (v) => (interval > 0 ? prende(min + Math.round((v - min) / interval) * interval) : prende(v));
  const to01 = (v) => {
    const c = prende(v);
    if (p.curve === 'log') return Math.log(c / min) / Math.log(max / min);
    const t = (c - min) / (max - min);
    return p.curve === 'skew' ? Math.pow(t, p.skew) : t;
  };
  const from01 = (t) => {
    const u = Math.min(1, Math.max(0, t));
    if (p.curve === 'log') return prende(min * Math.pow(max / min, u));
    const w = p.curve === 'skew' && u > 0 ? Math.exp(Math.log(u) / p.skew) : u;
    return encaixa(min + (max - min) * w);
  };
  return { to01, from01 };
}

// Porte de MasterFxEditPanel::valueText (legenda do knob enquanto o mouse está em cima)
export function textoValor(id, v) {
  const num = (x, d) => x.toFixed(d);
  if (id.endsWith('Ratio')) return id.endsWith('AboveRatio') && v >= 100 ? '1:inf' : '1:' + num(v, 2);
  if (id.endsWith('Db') || id.endsWith('Thr')) {
    const r = Math.round(v * 10) / 10;
    return (r > 0 ? '+' : '') + num(r === 0 ? 0 : r, 1) + ' dB';
  }
  if (id.endsWith('Attack') || id.endsWith('Release'))
    return (v < 10 ? num(v, 2) : v < 100 ? num(v, 1) : String(Math.round(v))) + ' ms';
  if (id.startsWith('mbXo') || id === 'satColorFreq')
    return v < 1000 ? Math.round(v) + ' Hz' : num(v / 1000, v < 10000 ? 2 : 1) + ' kHz';
  const pct = Math.round(v);
  return (id === 'satAmtLo' || id === 'satAmtHi') && pct > 0 ? '+' + pct + '%' : pct + '%';
}

// Porte da escala do LevelMeter: marcas +6..-48 dB em kMarkY sobre a altura de desenho 520
const MARK_DB = [6, 0, -6, -12, -18, -24, -36, -48];
const MARK_Y = [6, 77, 148, 219, 290, 361, 432, 503];
export function fracaoDb(db) {
  let y = 520;
  if (!(db > -200)) y = 520;
  else if (db >= MARK_DB[0]) y = MARK_Y[0];
  else if (db <= MARK_DB[7]) y = MARK_Y[7] + (MARK_DB[7] - db) * ((MARK_Y[7] - MARK_Y[6]) / (MARK_DB[6] - MARK_DB[7]));
  else {
    for (let i = 1; i < 8; i++) {
      if (db >= MARK_DB[i]) {
        const t = (MARK_DB[i - 1] - db) / (MARK_DB[i - 1] - MARK_DB[i]);
        y = MARK_Y[i - 1] + t * (MARK_Y[i] - MARK_Y[i - 1]);
        break;
      }
    }
  }
  return Math.max(0, Math.min(1, 1 - y / 520));
}
