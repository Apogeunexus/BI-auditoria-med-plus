const FUNCOES = ['Todas', 'Motorista Socorrista', 'Tecnico de Enfermagem', 'Bombeiro Civil', 'Auxiliar Administrativo'];
const SEVERIDADES = ['Todas', 'CRITICA', 'ALERTA', 'INFO', 'CONFORME'];
const COMPETENCIAS = ['2026/01', '2025/12', '2025/11', '2025/10', '2025/09', '2025/08'];

const selectClass = "text-[13px] border border-borda-input rounded-md px-3 py-2 bg-white text-texto cursor-pointer focus:outline-none";

export default function GlobalFilters({ filters, onFilterChange }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="text-[13px] text-texto-sec font-medium shrink-0">Filtrar por:</span>

      <select
        value={filters.competencia}
        onChange={(e) => onFilterChange({ ...filters, competencia: e.target.value })}
        className={selectClass}
      >
        {COMPETENCIAS.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <select
        value={filters.funcao}
        onChange={(e) => onFilterChange({ ...filters, funcao: e.target.value })}
        className={selectClass}
      >
        {FUNCOES.map(f => <option key={f} value={f}>{f === 'Todas' ? 'Todas Funcoes' : f}</option>)}
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
