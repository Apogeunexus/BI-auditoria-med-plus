import { useState, useMemo } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, ArrowUpDown, Layers, List } from 'lucide-react';
import { formatCurrency, LABELS, calcSeveridade } from '../data/generateData';

const SEVERITY_STYLES = {
  CRITICA: 'badge-critica',
  ALERTA: 'badge-alerta',
  INFO: 'badge-info',
  CONFORME: 'badge-conforme',
};

const CATEGORIAS = ['proventos', 'descontos', 'encargos', 'beneficios'];
const FUNCOES = ['Todas', 'Motorista Socorrista', 'Tecnico de Enfermagem', 'Bombeiro Civil', 'Auxiliar Administrativo'];
const SEVERIDADES = ['Todas', 'CRITICA', 'ALERTA', 'INFO', 'CONFORME'];

export default function TabelaAnalitica({ colaboradores }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [funcaoFilter, setFuncaoFilter] = useState('Todas');
  const [categoriaFilter, setCategoriaFilter] = useState('Todas');
  const [severidadeFilter, setSeveridadeFilter] = useState('Todas');
  const [groupBy, setGroupBy] = useState('colaborador'); // 'colaborador' or 'rubrica'
  const [sortField, setSortField] = useState('deltaCCT');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;

  // Flatten all data into rows
  const allRows = useMemo(() => {
    const rows = [];
    for (const colab of colaboradores) {
      for (const cat of CATEGORIAS) {
        for (const [key, val] of Object.entries(colab[cat])) {
          if (val.atual === 0 && val.contrato === 0 && val.cct === 0) continue;
          const deltaCont = val.cct - val.contrato;
          const deltaCCT = val.cct - val.atual;
          const sev = calcSeveridade(val.atual, val.cct);
          rows.push({
            colaborador: colab.nome,
            funcao: colab.funcao,
            cpf: colab.cpf,
            matricula: colab.matricula,
            rubrica: LABELS[cat][key] || key,
            tipo: cat,
            atual: val.atual,
            contrato: val.contrato,
            cct: val.cct,
            deltaCont,
            deltaCCT,
            severidade: sev,
          });
        }
      }
    }
    return rows;
  }, [colaboradores]);

  const filteredRows = useMemo(() => {
    let result = [...allRows];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r => r.colaborador.toLowerCase().includes(term) || r.rubrica.toLowerCase().includes(term) || r.cpf.includes(term));
    }
    if (funcaoFilter !== 'Todas') result = result.filter(r => r.funcao === funcaoFilter);
    if (categoriaFilter !== 'Todas') result = result.filter(r => r.tipo === categoriaFilter);
    if (severidadeFilter !== 'Todas') result = result.filter(r => r.severidade === severidadeFilter);

    result.sort((a, b) => {
      const va = typeof a[sortField] === 'string' ? a[sortField] : (a[sortField] ?? 0);
      const vb = typeof b[sortField] === 'string' ? b[sortField] : (b[sortField] ?? 0);
      if (typeof va === 'string') return sortDir === 'desc' ? vb.localeCompare(va) : va.localeCompare(vb);
      return sortDir === 'desc' ? Math.abs(vb) - Math.abs(va) : Math.abs(va) - Math.abs(vb);
    });

    return result;
  }, [allRows, searchTerm, funcaoFilter, categoriaFilter, severidadeFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filteredRows.length / perPage);
  const pagedRows = filteredRows.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Totals
  const totalAtual = filteredRows.reduce((s, r) => s + r.atual, 0);
  const totalContrato = filteredRows.reduce((s, r) => s + r.contrato, 0);
  const totalCCT = filteredRows.reduce((s, r) => s + r.cct, 0);
  const totalDeltaCCT = filteredRows.reduce((s, r) => s + r.deltaCCT, 0);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    else { setSortField(field); setSortDir('desc'); }
    setCurrentPage(1);
  };

  const exportCSV = () => {
    const headers = ['Colaborador', 'Funcao', 'Rubrica', 'Tipo', 'Atual', 'Contrato', 'CCT/CLT', 'Delta Contrato', 'Delta CCT', 'Severidade'];
    const csvRows = [headers.join(';')];
    for (const r of filteredRows) {
      csvRows.push([
        r.colaborador, r.funcao, r.rubrica, r.tipo,
        r.atual.toFixed(2), r.contrato.toFixed(2), r.cct.toFixed(2),
        r.deltaCont.toFixed(2), r.deltaCCT.toFixed(2), r.severidade
      ].join(';'));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_analitica_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[20px] font-semibold text-texto">Tabela Analitica</h1>
          <p className="text-[13px] text-texto-sec mt-1">Visao completa cruzada de todos os dados de auditoria</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#16A34A] text-white rounded-md text-[13px] font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Download size={16} />
          Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-sec" />
            <input
              type="text"
              placeholder="Buscar colaborador, rubrica, CPF..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-8 pr-4 py-2 text-sm border border-borda-input rounded-md bg-fundo text-texto focus:outline-none focus:ring-2 focus:ring-atual/30"
            />
          </div>
          <select value={funcaoFilter} onChange={(e) => { setFuncaoFilter(e.target.value); setCurrentPage(1); }}
            className="text-sm border border-borda-input rounded-md px-3 py-2 bg-fundo text-texto">
            {FUNCOES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select value={categoriaFilter} onChange={(e) => { setCategoriaFilter(e.target.value); setCurrentPage(1); }}
            className="text-sm border border-borda-input rounded-md px-3 py-2 bg-fundo text-texto">
            <option value="Todas">Todas Rubricas</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <select value={severidadeFilter} onChange={(e) => { setSeveridadeFilter(e.target.value); setCurrentPage(1); }}
            className="text-sm border border-borda-input rounded-md px-3 py-2 bg-fundo text-texto">
            {SEVERIDADES.map(s => <option key={s} value={s}>{s === 'Todas' ? 'Todas Severidades' : s}</option>)}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card p-3">
          <div className="text-[10px] text-texto-sec uppercase tracking-wider mb-1">Registros</div>
          <div className="tabular-nums text-lg font-bold text-texto">{filteredRows.length.toLocaleString()}</div>
        </div>
        <div className="card p-3">
          <div className="text-[10px] text-texto-sec uppercase tracking-wider mb-1">Total Atual</div>
          <div className="tabular-nums text-lg font-bold text-atual">{formatCurrency(totalAtual)}</div>
        </div>
        <div className="card p-3">
          <div className="text-[10px] text-texto-sec uppercase tracking-wider mb-1">Total CCT</div>
          <div className="tabular-nums text-lg font-bold text-cct">{formatCurrency(totalCCT)}</div>
        </div>
        <div className="card p-3">
          <div className="text-[10px] text-texto-sec uppercase tracking-wider mb-1">Δ Total CCT</div>
          <div className={`tabular-nums text-lg font-bold ${totalDeltaCCT > 0 ? 'text-critico' : 'text-conforme'}`}>
            {formatCurrency(totalDeltaCCT)}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-fundo border-b border-borda">
                {[
                  { key: 'colaborador', label: 'Colaborador', align: 'left' },
                  { key: 'funcao', label: 'Funcao', align: 'left' },
                  { key: 'rubrica', label: 'Rubrica', align: 'left' },
                  { key: 'tipo', label: 'Tipo', align: 'left' },
                  { key: 'atual', label: 'Atual', align: 'right' },
                  { key: 'contrato', label: 'Contrato', align: 'right' },
                  { key: 'cct', label: 'CCT/CLT', align: 'right' },
                  { key: 'deltaCont', label: 'Δ Contrato', align: 'right' },
                  { key: 'deltaCCT', label: 'Δ CCT', align: 'right' },
                  { key: 'severidade', label: 'Severidade', align: 'center' },
                ].map(col => (
                  <th
                    key={col.key}
                    className={`py-2.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280] cursor-pointer hover:text-texto transition-colors ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                    onClick={() => handleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {sortField === col.key && <span>{sortDir === 'desc' ? '↓' : '↑'}</span>}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((row, i) => (
                <tr key={i} className="border-b border-[#F3F4F6] table-row-hover transition-colors">
                  <td className="py-2 px-2 font-medium text-texto truncate max-w-[140px]">{row.colaborador}</td>
                  <td className="py-2 px-2 text-texto-sec truncate max-w-[120px]">{row.funcao}</td>
                  <td className="py-2 px-2 text-texto truncate max-w-[160px]">{row.rubrica}</td>
                  <td className="py-2 px-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-fundo text-texto-sec capitalize">{row.tipo}</span>
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums text-atual">{formatCurrency(row.atual)}</td>
                  <td className="py-2 px-2 text-right tabular-nums text-contrato">{formatCurrency(row.contrato)}</td>
                  <td className="py-2 px-2 text-right tabular-nums text-cct">{formatCurrency(row.cct)}</td>
                  <td className={`py-2 px-2 text-right tabular-nums ${row.deltaCont > 0 ? 'text-critico' : row.deltaCont < 0 ? 'text-conforme' : 'text-texto-sec'}`}>
                    {row.deltaCont !== 0 ? formatCurrency(row.deltaCont) : '-'}
                  </td>
                  <td className={`py-2 px-2 text-right tabular-nums font-semibold ${row.deltaCCT > 0 ? 'text-critico' : row.deltaCCT < 0 ? 'text-conforme' : 'text-texto-sec'}`}>
                    {row.deltaCCT !== 0 ? formatCurrency(row.deltaCCT) : '-'}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded uppercase tracking-wide ${SEVERITY_STYLES[row.severidade]}`}>{row.severidade}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Footer totals */}
            <tfoot>
              <tr className="bg-fundo border-t-2 border-borda font-semibold">
                <td colSpan={4} className="py-2.5 px-2 text-[10px] text-texto uppercase tracking-wider">
                  Total ({filteredRows.length} registros)
                </td>
                <td className="py-2.5 px-2 text-right tabular-nums text-atual">{formatCurrency(totalAtual)}</td>
                <td className="py-2.5 px-2 text-right tabular-nums text-contrato">{formatCurrency(totalContrato)}</td>
                <td className="py-2.5 px-2 text-right tabular-nums text-cct">{formatCurrency(totalCCT)}</td>
                <td className="py-2.5 px-2" />
                <td className={`py-2.5 px-2 text-right tabular-nums font-bold ${totalDeltaCCT > 0 ? 'text-critico' : 'text-conforme'}`}>
                  {formatCurrency(totalDeltaCCT)}
                </td>
                <td className="py-2.5 px-2" />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-borda">
            <div className="text-xs text-texto-sec">
              Mostrando {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filteredRows.length)} de {filteredRows.length}
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-borda hover:bg-fundo disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 7) page = i + 1;
                else if (currentPage <= 4) page = i + 1;
                else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
                else page = currentPage - 3 + i;
                if (page < 1 || page > totalPages) return null;
                return (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-md text-xs font-medium cursor-pointer transition-all ${
                      page === currentPage ? 'bg-atual text-white' : 'border border-borda hover:bg-fundo text-texto'
                    }`}>
                    {page}
                  </button>
                );
              })}
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-borda hover:bg-fundo disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
