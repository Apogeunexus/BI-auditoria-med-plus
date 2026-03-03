const SEVERIDADES = ['Todas', 'CRITICA', 'ALERTA', 'INFO', 'CONFORME'];

const selectClass = "text-[13px] border border-borda-input rounded-md px-3 py-2 bg-white text-texto cursor-pointer focus:outline-none";

function formatPeriodo(p) {
  if (!p || p.length !== 6) return p;
  return `${p.slice(0, 4)}/${p.slice(4)}`;
}

export default function GlobalFilters({ filters, onFilterChange, periodos = [], funcoes = [] }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="text-[13px] text-texto-sec font-medium shrink-0">Filtrar por:</span>

      <select
        value={filters.competencia}
        onChange={(e) => onFilterChange({ ...filters, competencia: e.target.value })}
        className={selectClass}
      >
        {periodos.map(p => <option key={p} value={p}>{formatPeriodo(p)}</option>)}
      </select>

      <select
        value={filters.funcao}
        onChange={(e) => onFilterChange({ ...filters, funcao: e.target.value })}
        className={selectClass}
      >
        {funcoes.map(f => <option key={f} value={f}>{f === 'Todas' ? 'Todas Funcoes' : f}</option>)}
      </select>

      <select
        value={filters.severidade}
        onChange={(e) => onFilterChange({ ...filters, severidade: e.target.value })}
        className={selectClass}
      >
        {SEVERIDADES.map(s => <option key={s} value={s}>{s === 'Todas' ? 'Todas Severidades' : s}</option>)}
      </select>
    </div>
  );
}
