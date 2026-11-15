// Builds the Notion database structure for every ALTAIR register (used by the panel mapping and by the PDF). Node: node notion_schema.js > schema.json
const EXCLUDE = new Set(['prj_activities', 'prj_actions', 'prj_acts']);          // owned by Polaris One
const MONEY = /(price|cost|amount|budget|margin|revenue|fee|salary|value|rate|probability|profit|roi|irr|mapp|npv|tax|discount|payment|invoice|fx|usd|idr)/i;
const SYSTEM = new Set(['internal_notes', 'cancel_reason']);
const REF_TEXT = new Set(['project', 'party']);                                      // resolved to a name by the function
const NO_SYNC_TYPES = new Set(['lines', 'bom', 'devp', 'calc', 'calcoc', 'calcnre', 'item', 'cprog', 'request', 'libdoc', 'job', 'trec', 'mxprog', 'asset', 'mxtask', 'mxwp', 'ncr', 'receipt', 'mfgo', 'rep', 'po', 'user', 'rca', 'qimp', 'ci', 'qt', 'pact', 'shipment', 'mxitem']);
function notionType(f) {
  const t = f.type || 'text';
  if (t === 'number' || t === 'int') return 'number';
  if (t === 'date') return 'date';
  if (t === 'bool') return 'checkbox';
  if (t === 'select') return 'select';
  return 'rich_text';
}
function build(De) {
  const out = [];
  for (const [key, r] of Object.entries(De)) {
    if (EXCLUDE.has(key)) continue;
    const fl = (typeof r.fields === 'function' ? r.fields({}) : r.fields) || [];
    const fields = [];
    const refKey = (r.list || []).find(k => ['ref', 'code', 'ao_ref'].includes(k)) || null;
    const hasTitle = fl.some(f => f && f.k === 'title');
    const titleKey = hasTitle ? 'title' : (['part_no', 'description', 'name'].find(k => fl.some(f => f && f.k === k)) || refKey || 'id');
    for (const f of fl) {
      if (!f || !f.k) continue;
      const t = f.type || 'text';
      const noSync = NO_SYNC_TYPES.has(t);
      const money = MONEY.test(f.k) || SYSTEM.has(f.k);
      const fin = r.module === 'finance';
      fields.push({ k: f.k, label: String(f.label || f.k).replace(/\s+/g, ' ').slice(0, 90), type: t, notion: f.k === titleKey ? 'title' : notionType(f),
        options: t === 'select' && Array.isArray(f.opts) ? f.opts.map(o => Array.isArray(o) ? String(o[1]) : String(o)).slice(0, 40) : undefined,
        sync: !noSync && !money && !fin, why: noSync ? 'link to another record (id only)' : (money ? 'money, cost, rate or internal note' : (fin ? 'Finance register' : '')) });
    }
    if (!hasTitle && !fields.some(x => x.k === titleKey)) fields.unshift({ k: titleKey, label: titleKey, type: 'text', notion: 'title', sync: true, why: '' });
    out.push({ key, title: r.title, module: r.module, table: r.table, fixed: r.fixed || null, refKey, titleKey, statusKey: r.status || null, fields });
  }
  return out;
}
module.exports = { build, EXCLUDE };
if (require.main === module) {
  // usage: node notion_schema.js /tmp/De_src.js   (the register source cut out of index.html: "const es=[...];module.exports={...};")
  const code = require('fs').readFileSync(process.argv[2] || '/tmp/De_src.js', 'utf8').replace('module.exports=', 'return ');
  globalThis._e = a => a.map(x => [x, x]);
  let De; for (let n = 0; n < 80; n++) { try { De = new Function(code)(); break } catch (e) { const m = /(\w+) is not defined/.exec(e.message); if (!m) throw e; globalThis[m[1]] = (...a) => [] } }
  console.log(JSON.stringify(build(De)));
}
