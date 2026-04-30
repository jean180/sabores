export type UnitGroup = 'weight' | 'volume' | 'count' | 'other';

export interface UnitInfo {
  canonical: string;
  group: UnitGroup;
  toBase: number; // factor para convertir a unidad base (g o ml o 1)
}

const MAP: Record<string, UnitInfo> = {
  // Peso → base: g
  'g':           { canonical: 'g',            group: 'weight', toBase: 1 },
  'gr':          { canonical: 'g',            group: 'weight', toBase: 1 },
  'gramo':       { canonical: 'g',            group: 'weight', toBase: 1 },
  'gramos':      { canonical: 'g',            group: 'weight', toBase: 1 },
  'kg':          { canonical: 'kg',           group: 'weight', toBase: 1000 },
  'kilo':        { canonical: 'kg',           group: 'weight', toBase: 1000 },
  'kilos':       { canonical: 'kg',           group: 'weight', toBase: 1000 },
  'kilogramo':   { canonical: 'kg',           group: 'weight', toBase: 1000 },
  'kilogramos':  { canonical: 'kg',           group: 'weight', toBase: 1000 },

  // Volumen → base: ml
  'ml':           { canonical: 'ml',           group: 'volume', toBase: 1 },
  'mililitro':    { canonical: 'ml',           group: 'volume', toBase: 1 },
  'mililitros':   { canonical: 'ml',           group: 'volume', toBase: 1 },
  'l':            { canonical: 'l',            group: 'volume', toBase: 1000 },
  'litro':        { canonical: 'l',            group: 'volume', toBase: 1000 },
  'litros':       { canonical: 'l',            group: 'volume', toBase: 1000 },
  'cucharada':    { canonical: 'cucharadas',   group: 'volume', toBase: 15 },
  'cucharadas':   { canonical: 'cucharadas',   group: 'volume', toBase: 15 },
  'cda':          { canonical: 'cucharadas',   group: 'volume', toBase: 15 },
  'cucharadita':  { canonical: 'cucharaditas', group: 'volume', toBase: 5 },
  'cucharaditas': { canonical: 'cucharaditas', group: 'volume', toBase: 5 },
  'cdta':         { canonical: 'cucharaditas', group: 'volume', toBase: 5 },
  'taza':         { canonical: 'tazas',        group: 'volume', toBase: 240 },
  'tazas':        { canonical: 'tazas',        group: 'volume', toBase: 240 },

  // Conteo → base: 1
  'unidad':    { canonical: 'unidades',  group: 'count', toBase: 1 },
  'unidades':  { canonical: 'unidades',  group: 'count', toBase: 1 },
  'ud':        { canonical: 'unidades',  group: 'count', toBase: 1 },
  'uds':       { canonical: 'unidades',  group: 'count', toBase: 1 },
  'diente':    { canonical: 'dientes',   group: 'count', toBase: 1 },
  'dientes':   { canonical: 'dientes',   group: 'count', toBase: 1 },
  'hoja':      { canonical: 'hojas',     group: 'count', toBase: 1 },
  'hojas':     { canonical: 'hojas',     group: 'count', toBase: 1 },
  'rebanada':  { canonical: 'rebanadas', group: 'count', toBase: 1 },
  'rebanadas': { canonical: 'rebanadas', group: 'count', toBase: 1 },
  'loncha':    { canonical: 'lonchas',   group: 'count', toBase: 1 },
  'lonchas':   { canonical: 'lonchas',   group: 'count', toBase: 1 },
  'rodaja':    { canonical: 'rodajas',   group: 'count', toBase: 1 },
  'rodajas':   { canonical: 'rodajas',   group: 'count', toBase: 1 },
  'rama':      { canonical: 'ramas',     group: 'count', toBase: 1 },
  'ramas':     { canonical: 'ramas',     group: 'count', toBase: 1 },
  'filete':    { canonical: 'filetes',   group: 'count', toBase: 1 },
  'filetes':   { canonical: 'filetes',   group: 'count', toBase: 1 },
  'manojo':    { canonical: 'manojos',   group: 'count', toBase: 1 },
  'manojos':   { canonical: 'manojos',   group: 'count', toBase: 1 },
  'yema':      { canonical: 'yemas',     group: 'count', toBase: 1 },
  'yemas':     { canonical: 'yemas',     group: 'count', toBase: 1 },

  // Otro (no comparables entre sí)
  'pizca':    { canonical: 'pizca',    group: 'other', toBase: 1 },
  'al gusto': { canonical: 'al gusto', group: 'other', toBase: 1 },
};

export function normalizeUnit(unit: string): UnitInfo | null {
  return MAP[unit.toLowerCase().trim()] ?? null;
}

export function canonicalUnit(unit: string): string {
  return normalizeUnit(unit)?.canonical ?? unit.toLowerCase().trim();
}

/**
 * Calcula la cantidad que falta de un ingrediente dado lo que hay en despensa.
 * Devuelve null si ya tienes suficiente.
 * Devuelve { quantity, unit } con la unidad canónica del ingrediente de la receta.
 */
export function missingQty(
  recipeQty: number, recipeUnit: string,
  pantryQty: number | null, pantryUnit: string | null
): { quantity: number; unit: string } | null {
  const rn = normalizeUnit(recipeUnit);
  const canonical = rn?.canonical ?? recipeUnit;

  if (pantryQty === null || !pantryUnit) {
    return { quantity: recipeQty, unit: canonical };
  }

  const pn = normalizeUnit(pantryUnit);

  if (!rn || !pn || rn.group !== pn.group || rn.group === 'other' ||
      (rn.group === 'count' && rn.canonical !== pn.canonical)) {
    return { quantity: recipeQty, unit: canonical };
  }

  const need = recipeQty * rn.toBase;
  const have = pantryQty * pn.toBase;

  if (have >= need) return null;

  const diff = (need - have) / rn.toBase;
  return { quantity: Math.round(diff * 100) / 100, unit: canonical };
}
