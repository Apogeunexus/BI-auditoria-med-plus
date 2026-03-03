import { useState, useMemo, Fragment } from 'react';
import { Search, User, ChevronDown } from 'lucide-react';
import TripleComparisonCard from '../components/TripleComparisonCard';
import { formatCurrency, LABELS, calcSeveridade } from '../data/generateData';

const SEVERITY_STYLES = {
  CRITICA: 'badge-critica',
  ALERTA: 'badge-alerta',
  INFO: 'badge-info',
  CONFORME: 'badge-conforme',
};

const FUNCOES = ['Todas', 'Motorista Socorrista', 'Tecnico de Enfermagem', 'Bombeiro Civil', 'Auxiliar Administrativo'];

export default function PorColaborador({ colaboradores }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [funcaoFilter, setFuncaoFilter] = useState('Todas');
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    let result = [...colaboradores];
    if (funcaoFilter !== 'Todas') result = result.filter(c => c.funcao === funcaoFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => c.nome.toLowerCase().includes(term) || c.cpf.includes(term) || c.matricula.includes(term));
    }
    return result.sort((a, b) => b.riscoAnual - a.riscoAnual);
  }, [colaboradores, searchTerm, funcaoFilter]);

  const selected = useMemo(() => {
    if (selectedId === null) return null;
    return colaboradores.find(c => c.id === selectedId) || null;
  }, [selectedId, colaboradores]);

  if (selected) {
    const sev = calcSeveridade(selected.totais.custoTotal.atual, selected.totais.custoTotal.cct);
    return (
      <div className="animate-fade-in">
        <button
          onClick={() => setSelectedId(null)}
          className="text-sm text-atual hover:text-atual/80 font-medium mb-4 cursor-pointer flex items-center gap-1"
        >
          ← Voltar para lista
        </button>

        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-md bg-[#F3F4F6] flex items-center justify-center">
                <User size={28} className="text-texto-sec" />
              </div>
              <div>
                <h1 className="text-[18px] font-semibold text-texto">{selected.nome}</h1>
                <div className="text-sm text-texto-sec mt-1">
                  {selected.funcao} | Mat: {selected.matricula}
                </div>
                <div className="text-sm text-texto-sec">
                  CPF: {selected.cpf} | Competencia: {selected.competencia}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-texto-sec mb-1">Risco Anual Estimado</div>
              <div className={`tabular-nums text-2xl font-bold ${selected.riscoAnual > 0 ? 'text-critico' : 'text-conforme'}`}>
                {formatCurrency(selected.riscoAnual)}
              </div>
              <span className={`inline-block mt-1 text-[11px] font-semibold px-2.5 py-1 rounded uppercase tracking-wide ${SEVERITY_STYLES[sev]}`}>{sev}</span>
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="section-label mb-4">Resumo de Totais</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {Object.entries(selected.totais).map(([key, val], i) => (
            <TripleComparisonCard
              key={key}
              title={LABELS.totais[key]}
              atual={val.atual}
              contrato={val.contrato}
              cct={val.cct}
              delay={i * 50}
            />
          ))}
        </div>

        {/* Per rubrica */}
        {['proventos', 'descontos', 'encargos', 'beneficios'].map(categoria => (
          <div key={categoria} className="mb-8">
            <div className="section-label mb-4">{categoria.charAt(0).toUpperCase() + categoria.slice(1)}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Object.entries(selected[categoria]).map(([key, val], i) => {
                if (val.atual === 0 && val.contrato === 0 && val.cct === 0) return null;
                return (
                  <TripleComparisonCard
                    key={key}
                    title={LABELS[categoria][key] || key}
                    atual={val.atual}
                    contrato={val.contrato}
                    cct={val.cct}
                    delay={i * 30}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Holerite Comparativo */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-texto mb-4">Holerite Comparativo</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-borda">
                  <th className="text-left py-2 px-2 text-texto-sec font-semibold uppercase tracking-wider">Rubrica</th>
                  <th className="text-right py-2 px-2 text-atual font-semibold">Atual</th>
                  <th className="text-right py-2 px-2 text-contrato font-semibold">Contrato</th>
                  <th className="text-right py-2 px-2 text-cct font-semibold">CCT/CLT</th>
                  <th className="text-right py-2 px-2 text-texto-sec font-semibold">Δ Contrato</th>
                  <th className="text-right py-2 px-2 text-texto-sec font-semibold">Δ CCT</th>
                  <th className="text-center py-2 px-2 text-texto-sec font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {['proventos', 'descontos', 'encargos', 'beneficios'].map(cat => (
                  <Fragment key={cat}>
                    <tr className="bg-fundo">
                      <td colSpan={7} className="py-2 px-2 font-bold text-texto uppercase text-[10px] tracking-wider">
                        {cat}
                      </td>
                    </tr>
                    {Object.entries(selected[cat]).map(([key, val]) => {
                      if (val.atual === 0 && val.contrato === 0 && val.cct === 0) return null;
                      const dCont = val.cct - val.contrato;
                      const dCCT = val.cct - val.atual;
                      const sev = calcSeveridade(val.atual, val.cct);
                      return (
                        <tr key={`${cat}-${key}`} className="border-b border-borda/30 table-row-hover">
                          <td className="py-1.5 px-2 text-texto font-medium">{LABELS[cat][key] || key}</td>
                          <td className="py-1.5 px-2 text-right tabular-nums text-atual">{formatCurrency(val.atual)}</td>
                          <td className="py-1.5 px-2 text-right tabular-nums text-contrato">{formatCurrency(val.contrato)}</td>
                          <td className="py-1.5 px-2 text-right tabular-nums text-cct">{formatCurrency(val.cct)}</td>
                          <td className={`py-1.5 px-2 text-right tabular-nums ${dCont > 0 ? 'text-critico' : dCont < 0 ? 'text-conforme' : 'text-texto-sec'}`}>
                            {dCont !== 0 ? `${dCont > 0 ? '+' : ''}${formatCurrency(dCont)}` : '-'}
                          </td>
                          <td className={`py-1.5 px-2 text-right tabular-nums ${dCCT > 0 ? 'text-critico' : dCCT < 0 ? 'text-conforme' : 'text-texto-sec'}`}>
                            {dCCT !== 0 ? `${dCCT > 0 ? '+' : ''}${formatCurrency(dCCT)}` : '-'}
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded uppercase tracking-wide ${SEVERITY_STYLES[sev]}`}>{sev}</span>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Subtotal */}
                    <tr className="border-b border-borda bg-fundo/30">
                      <td className="py-1.5 px-2 font-bold text-texto text-[11px]">TOTAL {cat.toUpperCase()}</td>
                      <td className="py-1.5 px-2 text-right tabular-nums font-bold text-atual">
                        {formatCurrency(Object.values(selected[cat]).reduce((s, v) => s + v.atual, 0))}
                      </td>
                      <td className="py-1.5 px-2 text-right tabular-nums font-bold text-contrato">
                        {formatCurrency(Object.values(selected[cat]).reduce((s, v) => s + v.contrato, 0))}
                      </td>
                      <td className="py-1.5 px-2 text-right tabular-nums font-bold text-cct">
                        {formatCurrency(Object.values(selected[cat]).reduce((s, v) => s + v.cct, 0))}
                      </td>
                      <td className="py-1.5 px-2" />
                      <td className="py-1.5 px-2" />
                      <td className="py-1.5 px-2" />
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold text-texto">Por Colaborador</h1>
        <p className="text-[13px] text-texto-sec mt-1">Selecione um colaborador para ver o detalhamento individual</p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[280px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-sec" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou matricula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 text-sm border border-borda-input rounded-md bg-fundo text-texto focus:outline-none focus:ring-2 focus:ring-atual/30"
          />
        </div>
        <select
          value={funcaoFilter}
          onChange={(e) => setFuncaoFilter(e.target.value)}
          className="text-sm border border-borda-input rounded-md px-4 py-2.5 bg-fundo text-texto focus:outline-none focus:ring-2 focus:ring-atual/30"
        >
          {FUNCOES.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="text-xs text-texto-sec mb-4">{filtered.length} colaboradores encontrados</div>

      {/* Collaborator cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c, i) => {
          const sev = calcSeveridade(c.totais.custoTotal.atual, c.totais.custoTotal.cct);
          return (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className="card p-4 hover:border-atual/40 cursor-pointer text-left animate-fade-in"
              style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-[#F3F4F6] flex items-center justify-center">
                    <User size={14} className="text-atual" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-texto truncate max-w-[180px]">{c.nome}</div>
                    <div className="text-[10px] text-texto-sec">{c.funcao}</div>
                  </div>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded uppercase tracking-wide ${SEVERITY_STYLES[sev]}`}>{sev}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-borda/50">
                <span className="text-texto-sec">Mat: {c.matricula}</span>
                <span className={`tabular-nums font-bold ${c.riscoAnual > 0 ? 'text-critico' : 'text-conforme'}`}>
                  {formatCurrency(c.riscoAnual)}/ano
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
