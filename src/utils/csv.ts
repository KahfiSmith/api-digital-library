export function toCsv<T extends Record<string, any>>(rows: T[], columns?: string[]): string {
  if (!rows || rows.length === 0) return '';
  const first = rows[0] || {} as Record<string, any>;
  const cols = columns && columns.length > 0 ? columns : Object.keys(first);
  const escape = (val: any) => {
    if (val === null || typeof val === 'undefined') return '';
    const s = String(val);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const header = cols.join(',');
  const lines = rows.map(r => cols.map(c => escape(r[c])).join(','));
  return [header, ...lines].join('\n');
}

export function sendCsv(res: import('express').Response, filename: string, csv: string): void {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}
