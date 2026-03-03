import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Gift, DollarSign, AlertTriangle, XCircle, Building } from 'lucide-react';
import KPICard from '../components/KPICard';
import TripleComparisonCard from '../components/TripleComparisonCard';
import { formatCurrency, aggregateByCategoria, aggregateTotais, calcSeveridade } from '../data/supabaseData';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-3 rounded-lg border border-borda text-[12px]">
      <div className="font-semibold text-texto mb-2">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.fill || p.color }} />
          <span className="text-texto-sec">{p.name}:</span>
          <span className="font-mono font-semibold text-texto">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Beneficios({ colaboradores }) {
  const rubricaAgg = useMemo(() => aggregateByCategoria(colaboradores, 'beneficios'), [colaboradores]);
  const custosEmpresaAgg = useMemo(() => aggregateByCategoria(colaboradores, 'custosEmpresa'), [colaboradores]);

  const totaisAgg = useMemo(() => aggregateTotais(colaboradores), [colaboradores]);
  const totalAtual = totaisAgg.beneficios.atual;
  const totalCCT = totaisAgg.beneficios.cct;
  const divergencia = totalCCT - totalAtual;

  const totalCustosAtual = totaisAgg.custosEmpresa.atual;
  const totalCustosCCT = totaisAgg.custosEmpresa.cct;

  // Horizontal bar data sorted by divergence (beneficios only)
  const horizontalData = useMemo(() => {
    return Object.entries(rubricaAgg)
      .map(([key, val]) => ({
        name: key.replace('(Empresa)', '').trim().substring(0, 22),
        Atual: Math.round(val.atual * 100) / 100,
        Contrato: Math.round(val.contrato * 100) / 100,
        'CCT/CLT': Math.round(val.cct * 100) / 100,
        divergencia: Math.abs(val.cct - val.atual),
      }))
      .filter(d => d.Atual > 0 || d.Contrato > 0 || d['CCT/CLT'] > 0)
      .sort((a, b) => b.divergencia - a.divergencia);
  }, [rubricaAgg]);

  // Benefits required by CCT but not provided or insufficient (dynamic check)
  const beneficiosAusentes = useMemo(() => {
    const ausentes = [];
    // Check all beneficios: flag any where atual < cct * 0.9
    Object.entries(rubricaAgg).forEach(([key, val]) => {
      if (val.cct > 0 && val.atual < val.cct * 0.9) {
        ausentes.push({
          nome: key,
          valorCCT: val.cct,
          valorAtual: val.atual,
          risco: (val.cct - val.atual) * 12,
        });
      }
    });
    // Also check custosEmpresa for missing/insufficient items
    Object.entries(custosEmpresaAgg).forEach(([key, val]) => {
      if (val.cct > 0 && val.atual < val.cct * 0.9) {
        ausentes.push({
          nome: key,
          valorCCT: val.cct,
          valorAtual: val.atual,
          risco: (val.cct - val.atual) * 12,
        });
      }
    });
    return ausentes;
  }, [rubricaAgg, custosEmpresaAgg]);

  // Horizontal bar data for custos empresa
  const custosHorizontalData = useMemo(() => {
    return Object.entries(custosEmpresaAgg)
      .map(([key, val]) => ({
        name: key.substring(0, 22),
        Atual: Math.round(val.atual * 100) / 100,
        Contrato: Math.round(val.contrato * 100) / 100,
        'CCT/CLT': Math.round(val.cct * 100) / 100,
        divergencia: Math.abs(val.cct - val.atual),
      }))
      .filter(d => d.Atual > 0 || d.Contrato > 0 || d['CCT/CLT'] > 0)
      .sort((a, b) => b.divergencia - a.divergencia);
  }, [custosEmpresaAgg]);

  const hasCustosEmpresa = Object.keys(custosEmpresaAgg).length > 0;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold text-texto">Beneficios — Detalhamento</h1>
        <p className="text-[13px] text-texto-sec mt-1">Analise detalhada do custo empresa de cada beneficio</p>
      </div>

      <div className="flex flex-row gap-12 mb-8">
        <KPICard icon={Gift} iconColor="text-atual" label="Total Beneficios Atual" value={totalAtual} delay={0} />
        <KPICard icon={DollarSign} iconColor="text-cct" label="Total Beneficios CCT" value={totalCCT} delay={50} />
        <KPICard icon={AlertTriangle} iconColor="text-alerta" label="Divergencia Total" value={Math.abs(divergencia)} delay={100} />
      </div>

      {/* Missing benefits alert */}
      {beneficiosAusentes.length > 0 && (
        <div className="mb-8">
          <div className="section-label mb-4">Beneficios Previstos na CCT Nao Fornecidos ou Insuficientes</div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {beneficiosAusentes.map((b, i) => (
              <div key={i} className="card p-5 border-l-4 border-l-[#DC2626] animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <XCircle size={18} className="text-critico" />
                    <h3 className="text-sm font-semibold text-texto">{b.nome}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full badge-critica">CRITICA</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-texto-sec">Valor CCT obrigatorio:</span>
                    <span className="font-mono font-semibold text-cct">{formatCurrency(b.valorCCT)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-texto-sec">Valor atual fornecido:</span>
                    <span className="font-mono font-semibold text-atual">{formatCurrency(b.valorAtual)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-borda">
                    <span className="text-texto-sec font-medium">Risco Anual Estimado:</span>
                    <span className="font-mono font-bold text-critico">{formatCurrency(b.risco)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="section-label mb-4">Beneficios Individuais</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(rubricaAgg).map(([key, val], i) => (
            <TripleComparisonCard
              key={key}
              title={key}
              atual={val.atual}
              contrato={val.contrato}
              cct={val.cct}
              delay={i * 50}
            />
          ))}
        </div>
      </div>

      {/* Horizontal Bar Chart - Beneficios */}
      <div className="card p-5 mb-8">
        <h3 className="text-sm font-semibold text-texto mb-1">Comparativo Horizontal por Beneficio</h3>
        <p className="text-[11px] text-texto-sec mb-4">Ordenado por maior divergencia</p>
        <ResponsiveContainer width="100%" height={Math.max(300, horizontalData.length * 50)}>
          <BarChart data={horizontalData} layout="vertical" margin={{ left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} width={100} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Atual" fill="#E74C6F" radius={[0, 3, 3, 0]} barSize={12} />
            <Bar dataKey="Contrato" fill="#3B82F6" radius={[0, 3, 3, 0]} barSize={12} />
            <Bar dataKey="CCT/CLT" fill="#10B981" radius={[0, 3, 3, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Custos Empresa Section */}
      {hasCustosEmpresa && (
        <>
          <div className="mb-6 mt-10">
            <h2 className="text-[18px] font-semibold text-texto flex items-center gap-2">
              <Building size={20} className="text-texto-sec" />
              Custos Empresa
            </h2>
            <p className="text-[13px] text-texto-sec mt-1">Plano ambulatorial, seguro de vida e demais custos da empresa</p>
          </div>

          <div className="flex flex-row gap-12 mb-8">
            <KPICard icon={Building} iconColor="text-atual" label="Total Custos Empresa Atual" value={totalCustosAtual} delay={0} />
            <KPICard icon={DollarSign} iconColor="text-cct" label="Total Custos Empresa CCT" value={totalCustosCCT} delay={50} />
            <KPICard icon={AlertTriangle} iconColor="text-alerta" label="Divergencia Custos" value={Math.abs(totalCustosCCT - totalCustosAtual)} delay={100} />
          </div>

          <div className="mb-8">
            <div className="section-label mb-4">Custos Empresa Individuais</div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Object.entries(custosEmpresaAgg).map(([key, val], i) => (
                <TripleComparisonCard
                  key={key}
                  title={key}
                  atual={val.atual}
                  contrato={val.contrato}
                  cct={val.cct}
                  delay={i * 50}
                />
              ))}
            </div>
          </div>

          {custosHorizontalData.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-texto mb-1">Comparativo Horizontal — Custos Empresa</h3>
              <p className="text-[11px] text-texto-sec mb-4">Ordenado por maior divergencia</p>
              <ResponsiveContainer width="100%" height={Math.max(300, custosHorizontalData.length * 50)}>
                <BarChart data={custosHorizontalData} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Atual" fill="#E74C6F" radius={[0, 3, 3, 0]} barSize={12} />
                  <Bar dataKey="Contrato" fill="#3B82F6" radius={[0, 3, 3, 0]} barSize={12} />
                  <Bar dataKey="CCT/CLT" fill="#10B981" radius={[0, 3, 3, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
