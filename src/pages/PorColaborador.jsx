import { useState, useMemo, Fragment } from 'react';
import { Search, User, ChevronDown, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import TripleComparisonCard from '../components/TripleComparisonCard';
import { formatCurrency, calcSeveridade } from '../data/supabaseData';

const SEVERITY_STYLES = {
  CRITICA: 'badge-critica',
  ALERTA: 'badge-alerta',
  INFO: 'badge-info',
  CONFORME: 'badge-conforme',
};

const TOTAIS_LABELS = {
  proventos: 'Total Proventos',
  descontos: 'Total Descontos',
  encargos: 'Total Encargos',
  beneficios: 'Total Beneficios',
  custosEmpresa: 'Total Custos Empresa',
  liquido: 'Liquido Funcionario',
  custoTotal: 'Custo Total Empresa',
};

const CATEGORIA_LABELS = {
  proventos: 'Proventos',
  descontos: 'Descontos',
  encargos: 'Encargos',
  beneficios: 'Beneficios',
  custosEmpresa: 'Custos Empresa',
};

const STATUS_GERAL_STYLES = {
  'CRITICO': 'bg-red-100 text-red-700 border-red-200',
  'CRÍTICO': 'bg-red-100 text-red-700 border-red-200',
  'ALERTA': 'bg-amber-100 text-amber-700 border-amber-200',
  'CONFORME': 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const CATEGORIAS = ['proventos', 'descontos', 'encargos', 'beneficios', 'custosEmpresa'];

export default function PorColaborador({ colaboradores }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [funcaoFilter, setFuncaoFilter] = useState('Todas');
  const [selectedId, setSelectedId] = useState(null);

  // Derive unique funcoes from actual data
  const funcoes = useMemo(() => {
    const unique = [...new Set(colaboradores.map(c => c.funcao).filter(Boolean))].sort();
    return ['Todas', ...unique];
  }, [colaboradores]);

  const filtered = useMemo(() => {
    let result = [...colaboradores];
    if (funcaoFilter !== 'Todas') result = result.filter(c => c.funcao === funcaoFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c =>
        (c.nome || '').toLowerCase().includes(term) ||
        (c.cpf || '').includes(term) ||
        (c.matricula || '').includes(term)
      );
    }
    return result.sort((a, b) => (b.impactoAnual || 0) - (a.impactoAnual || 0));
  }, [colaboradores, searchTerm, funcaoFilter]);

  const selected = useMemo(() => {
    if (selectedId === null) return null;
    return colaboradores.find(c => c.id === selectedId) || null;
  }, [selectedId, colaboradores]);

  if (selected) {
    const sev = calcSeveridade(selected.totais.custoTotal.atual, selected.totais.custoTotal.cct);
    const discrepancias = selected.discrepancias || [];
    const resumo = selected.resumoAuditoria || {};
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
                <div className="text-sm text-texto-sec">
                  {selected.turno && <>Turno: {selected.turno} | </>}
                  {selected.escala && <>Escala: {selected.escala} | </>}
                  {selected.cargaHoraria ? <>CH: {selected.cargaHoraria}h</> : null}
                </div>
                {selected.dtAdmissao && (
                  <div className="text-sm text-texto-sec">Admissao: {selected.dtAdmissao}</div>
                )}
                {selected.centrosCusto && (
                  <div className="text-sm text-texto-sec">Centro de Custo: {selected.centrosCusto}</div>
                )}
                {selected.sindicato && (
                  <div className="text-sm text-texto-sec">Sindicato: {selected.sindicato}</div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-texto-sec mb-1">Impacto Anual Estimado</div>
              <div className={`tabular-nums text-2xl font-bold ${(selected.impactoAnual || 0) > 0 ? 'text-critico' : 'text-conforme'}`}>
                {formatCurrency(selected.impactoAnual || 0)}
              </div>
              <span className={`inline-block mt-1 text-[11px] font-semibold px-2.5 py-1 rounded uppercase tracking-wide ${SEVERITY_STYLES[sev]}`}>{sev}</span>
              {selected.statusGeral && (
                <div className={`inline-block ml-2 mt-1 text-[11px] font-semibold px-2.5 py-1 rounded border ${STATUS_GERAL_STYLES[selected.statusGeral] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {selected.statusGeral}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audit Summary */}
        {(resumo.conformidade_pct || resumo.itens_criticos !== undefined) && (
          <div className="card p-5 mb-6">
            <h3 className="text-sm font-semibold text-texto mb-3">Resumo da Auditoria</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selected.conformidade && (
                <div className="text-center">
                  <div className="text-[10px] uppercase text-texto-sec tracking-wide mb-1">Conformidade</div>
                  <div className="text-lg font-bold text-texto">{selected.conformidade}</div>
                </div>
              )}
              {resumo.itens_criticos !== undefined && (
                <div className="text-center">
                  <div className="text-[10px] uppercase text-texto-sec tracking-wide mb-1">Itens Criticos</div>
                  <div className="text-lg font-bold text-critico">{resumo.itens_criticos}</div>
                </div>
              )}
              {resumo.itens_alerta !== undefined && (
                <div className="text-center">
                  <div className="text-[10px] uppercase text-texto-sec tracking-wide mb-1">Itens Alerta</div>
                  <div className="text-lg font-bold text-amber-600">{resumo.itens_alerta}</div>
                </div>
              )}
              {resumo.impacto_anual !== undefined && (
                <div className="text-center">
                  <div className="text-[10px] uppercase text-texto-sec tracking-wide mb-1">Impacto Anual</div>
                  <div className="text-lg font-bold text-critico">{formatCurrency(resumo.impacto_anual)}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="section-label mb-4">Resumo de Totais</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {Object.entries(selected.totais).map(([key, val], i) => (
            <TripleComparisonCard
              key={key}
              title={TOTAIS_LABELS[key] || key}
              atual={val.atual}
              contrato={val.contrato}
              cct={val.cct}
              delay={i * 50}
            />
          ))}
        </div>

        {/* Per category */}
        {CATEGORIAS.map(categoria => {
          const items = selected[categoria];
          if (!items || Object.keys(items).length === 0) return null;
          return (
            <div key={categoria} className="mb-8">
              <div className="section-label mb-4">{CATEGORIA_LABELS[categoria] || categoria}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Object.entries(items).map(([key, val], i) => {
                  if (val.atual === 0 && val.contrato === 0 && val.cct === 0) return null;
                  return (
                    <TripleComparisonCard
                      key={key}
                      title={key}
                      atual={val.atual}
                      contrato={val.contrato}
                      cct={val.cct}
                      delay={i * 30}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Holerite Comparativo */}
        <div className="card p-5 mb-6">
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
                {CATEGORIAS.map(cat => {
                  const items = selected[cat];
                  if (!items || Object.keys(items).length === 0) return null;
                  return (
                    <Fragment key={cat}>
                      <tr className="bg-fundo">
                        <td colSpan={7} className="py-2 px-2 font-bold text-texto uppercase text-[10px] tracking-wider">
                          {CATEGORIA_LABELS[cat] || cat}
                        </td>
                      </tr>
                      {Object.entries(items).map(([key, val]) => {
                        if (val.atual === 0 && val.contrato === 0 && val.cct === 0) return null;
                        const dCont = val.cct - val.contrato;
                        const dCCT = val.cct - val.atual;
                        const itemSev = calcSeveridade(val.atual, val.cct);
                        return (
                          <tr key={`${cat}-${key}`} className="border-b border-borda/30 table-row-hover">
                            <td className="py-1.5 px-2 text-texto font-medium">{key}</td>
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
                              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded uppercase tracking-wide ${SEVERITY_STYLES[itemSev]}`}>{itemSev}</span>
                            </td>
                          </tr>
                        );
                      })}
                      {/* Subtotal */}
                      <tr className="border-b border-borda bg-fundo/30">
                        <td className="py-1.5 px-2 font-bold text-texto text-[11px]">TOTAL {(CATEGORIA_LABELS[cat] || cat).toUpperCase()}</td>
                        <td className="py-1.5 px-2 text-right tabular-nums font-bold text-atual">
                          {formatCurrency(Object.values(items).reduce((s, v) => s + v.atual, 0))}
                        </td>
                        <td className="py-1.5 px-2 text-right tabular-nums font-bold text-contrato">
                          {formatCurrency(Object.values(items).reduce((s, v) => s + v.contrato, 0))}
                        </td>
                        <td className="py-1.5 px-2 text-right tabular-nums font-bold text-cct">
                          {formatCurrency(Object.values(items).reduce((s, v) => s + v.cct, 0))}
                        </td>
                        <td className="py-1.5 px-2" />
                        <td className="py-1.5 px-2" />
                        <td className="py-1.5 px-2" />
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Discrepancias */}
        {discrepancias.length > 0 && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-texto mb-4">Discrepancias da Auditoria ({discrepancias.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-borda">
                    <th className="text-left py-2 px-2 text-texto-sec font-semibold uppercase tracking-wider">Grupo</th>
                    <th className="text-left py-2 px-2 text-texto-sec font-semibold uppercase tracking-wider">Item</th>
                    <th className="text-right py-2 px-2 text-texto-sec font-semibold">Valor Atual</th>
                    <th className="text-right py-2 px-2 text-texto-sec font-semibold">Valor CCT</th>
                    <th className="text-right py-2 px-2 text-texto-sec font-semibold">Diferenca</th>
                    <th className="text-right py-2 px-2 text-texto-sec font-semibold">Dif %</th>
                    <th className="text-center py-2 px-2 text-texto-sec font-semibold">Severidade</th>
                    <th className="text-center py-2 px-2 text-texto-sec font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {discrepancias.map((d, i) => {
                    const sevStyle = d.severidade === 'critica' || d.severidade === 'CRITICA' ? 'badge-critica'
                      : d.severidade === 'alerta' || d.severidade === 'ALERTA' ? 'badge-alerta'
                      : d.severidade === 'info' || d.severidade === 'INFO' ? 'badge-info'
                      : 'badge-conforme';
                    return (
                      <tr key={i} className="border-b border-borda/30 table-row-hover">
                        <td className="py-1.5 px-2 text-texto-sec">{d.grupo || '-'}</td>
                        <td className="py-1.5 px-2 text-texto font-medium">{d.item_atual || d.item_cct || '-'}</td>
                        <td className="py-1.5 px-2 text-right tabular-nums text-atual">{d.valor_atual !== undefined ? formatCurrency(d.valor_atual) : '-'}</td>
                        <td className="py-1.5 px-2 text-right tabular-nums text-cct">{d.valor_cct !== undefined ? formatCurrency(d.valor_cct) : '-'}</td>
                        <td className={`py-1.5 px-2 text-right tabular-nums ${(d.diferenca || 0) > 0 ? 'text-critico' : (d.diferenca || 0) < 0 ? 'text-conforme' : 'text-texto-sec'}`}>
                          {d.diferenca !== undefined ? formatCurrency(d.diferenca) : '-'}
                        </td>
                        <td className="py-1.5 px-2 text-right tabular-nums text-texto-sec">
                          {d.diferenca_pct !== undefined ? `${Number(d.diferenca_pct).toFixed(1)}%` : '-'}
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded uppercase tracking-wide ${sevStyle}`}>
                            {d.severidade || '-'}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-center text-texto-sec">{d.status || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
          {funcoes.map(f => <option key={f} value={f}>{f}</option>)}
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
                <span className={`tabular-nums font-bold ${(c.impactoAnual || 0) > 0 ? 'text-critico' : 'text-conforme'}`}>
                  {formatCurrency(c.impactoAnual || 0)}/ano
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
