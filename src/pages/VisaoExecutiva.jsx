import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Area, AreaChart, ComposedChart, ReferenceLine
} from 'recharts';
import { DollarSign, TrendingUp, AlertTriangle, Scale, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import KPICard from '../components/KPICard';
import TripleComparisonCard from '../components/TripleComparisonCard';
import { formatCurrency, aggregateTotais, gerarEvolucaoMensal } from '../data/generateData';
import { useState } from 'react';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-3 rounded-lg border border-borda text-[12px]">
      <div className="font-semibold text-texto mb-2">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-texto-sec">{p.name}:</span>
          <span className="tabular-nums font-semibold text-texto">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function VisaoExecutiva({ colaboradores }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('riscoAnual');
  const [sortDir, setSortDir] = useState('desc');
  const perPage = 15;

  const totais = useMemo(() => aggregateTotais(colaboradores), [colaboradores]);
  const evolucao = useMemo(() => gerarEvolucaoMensal(colaboradores), [colaboradores]);

  const custoAtual = totais.custoTotal.atual;
  const custoCCT = totais.custoTotal.cct;
  const aumentoNecessario = custoCCT - custoAtual;
  const riscoAnual = aumentoNecessario * 12;

  // Waterfall data
  const waterfall = useMemo(() => {
    let acumulado = 0;
    return evolucao.map((m) => {
      const increment = m.risco;
      acumulado += increment;
      return { ...m, incremento: increment, acumulado };
    });
  }, [evolucao]);

  // Filtered and sorted collaborators
  const filteredColabs = useMemo(() => {
    let result = [...colaboradores];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.nome.toLowerCase().includes(term) ||
        c.cpf.includes(term) ||
        c.matricula.includes(term)
      );
    }
    result.sort((a, b) => {
      const va = a[sortBy] ?? 0;
      const vb = b[sortBy] ?? 0;
      return sortDir === 'desc' ? vb - va : va - vb;
    });
    return result;
  }, [colaboradores, searchTerm, sortBy, sortDir]);

  const totalPages = Math.ceil(filteredColabs.length / perPage);
  const pagedColabs = filteredColabs.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold text-texto">Visao Executiva</h1>
        <p className="text-[13px] text-texto-sec mt-1">Panorama geral da auditoria de folha de pagamento</p>
      </div>

      {/* KPIs */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-12">
          <KPICard
            icon={DollarSign} iconColor="text-atual"
            label="Custo Atual (Efetivado)" value={custoAtual}
            subtitle="Total pago na folha mensal" delay={0}
          />
          <KPICard
            icon={Scale} iconColor="text-cct"
            label="Custo Correto (CCT/CLT)" value={custoCCT}
            subtitle="Conforme legislacao vigente" delay={50}
          />
          <KPICard
            icon={TrendingUp} iconColor="text-alerta"
            label="Aumento Necessario" value={aumentoNecessario}
            subtitle="Diferenca para regularizacao" trend={((aumentoNecessario / custoAtual) * 100)} delay={100}
          />
          <KPICard
            icon={AlertTriangle} iconColor="text-critico"
            label="Risco/Passivo Anual" value={riscoAnual}
            subtitle="Projecao 12 meses do risco" delay={150}
          />
        </div>
        <div className="text-right text-[13px] text-texto-sec">
          <div>sexta-feira, 27 de fevereiro de 2026</div>
          <div>Ultima atualizacao: 21:36</div>
        </div>
      </div>

      {/* Where is the difference? */}
      <div className="mb-8">
        <div className="section-label mb-4">Onde Esta a Diferenca?</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(totais).map(([key, val], i) => (
            <TripleComparisonCard
              key={key}
              title={{
                proventos: 'Total Proventos',
                descontos: 'Total Descontos',
                encargos: 'Total Encargos',
                beneficios: 'Custo Total Beneficios',
                liquido: 'Liquido Funcionario',
                custoTotal: 'Custo Total Empresa'
              }[key]}
              atual={val.atual}
              contrato={val.contrato}
              cct={val.cct}
              delay={i * 50}
            />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Waterfall */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-texto mb-1">Risco Acumulado (Waterfall)</h3>
          <p className="text-[11px] text-texto-sec mb-4">Passivo trabalhista acumulando mes a mes</p>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={waterfall}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="incremento" name="Risco Mensal" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="acumulado" name="Acumulado" stroke="#EF4444" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Evolution */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-texto mb-1">Evolucao Mensal</h3>
          <p className="text-[11px] text-texto-sec mb-4">Comparativo de custo total — 3 parametros</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={evolucao}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cct" name="CCT/CLT" stroke="#10B981" fill="#10B981" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="contrato" name="Contrato" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="atual" name="Atual" stroke="#E74C6F" fill="#E74C6F" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-texto">Comparativo por Colaborador</h3>
            <p className="text-[11px] text-texto-sec">{filteredColabs.length} colaboradores encontrados</p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-sec" />
            <input
              type="text"
              placeholder="Buscar nome, CPF, matricula..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-8 pr-4 py-2 text-sm border border-borda rounded-md bg-fundo text-texto focus:outline-none focus:ring-2 focus:ring-atual/30 w-72"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-borda">
                <th className="text-left py-3 px-3 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Colaborador</th>
                <th className="text-left py-3 px-3 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Funcao</th>
                <th className="text-left py-3 px-3 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">CPF</th>
                <th className="text-left py-3 px-3 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Matricula</th>
                <th className="text-left py-3 px-3 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Competencia</th>
                <th
                  className="text-right py-3 px-3 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280] cursor-pointer hover:text-texto"
                  onClick={() => { setSortDir(sortDir === 'desc' ? 'asc' : 'desc'); }}
                >
                  Risco Anual {sortDir === 'desc' ? '↓' : '↑'}
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedColabs.map((c, i) => (
                <tr key={c.id} className="border-b border-borda/50 table-row-hover transition-colors">
                  <td className="py-2.5 px-3 font-medium text-texto">{c.nome}</td>
                  <td className="py-2.5 px-3 text-texto-sec">{c.funcao}</td>
                  <td className="py-2.5 px-3 tabular-nums text-texto-sec text-xs">{c.cpf}</td>
                  <td className="py-2.5 px-3 tabular-nums text-texto-sec text-xs">{c.matricula}</td>
                  <td className="py-2.5 px-3 text-texto-sec">{c.competencia}</td>
                  <td className={`py-2.5 px-3 text-right tabular-nums font-semibold ${c.riscoAnual > 0 ? 'text-critico' : 'text-contrato'}`}>
                    {formatCurrency(c.riscoAnual)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-borda">
            <div className="text-xs text-texto-sec">
              Pagina {currentPage} de {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-borda hover:bg-fundo disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                if (page < 1 || page > totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-md text-xs font-medium cursor-pointer transition-all ${
                      page === currentPage ? 'bg-atual text-white' : 'border border-borda hover:bg-fundo text-texto'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-borda hover:bg-fundo disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
