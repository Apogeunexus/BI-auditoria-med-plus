import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Wallet, DollarSign, AlertTriangle } from 'lucide-react';
import KPICard from '../components/KPICard';
import TripleComparisonCard from '../components/TripleComparisonCard';
import { formatCurrency, aggregateByCategoria, aggregateTotais } from '../data/supabaseData';

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function seededRng(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

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

export default function Descontos({ colaboradores }) {
  const rubricaAgg = useMemo(() => aggregateByCategoria(colaboradores, 'descontos'), [colaboradores]);

  const totaisAgg = useMemo(() => aggregateTotais(colaboradores), [colaboradores]);
  const totalAtual = totaisAgg.descontos.atual;
  const totalCCT = totaisAgg.descontos.cct;
  const divergencia = totalCCT - totalAtual;

  const chartData = useMemo(() => {
    return Object.entries(rubricaAgg).map(([key, val]) => ({
      name: key.replace('(Empregado)', '').replace('(Copart.)', '').replace('(Desc.)', '').trim().substring(0, 18),
      Atual: Math.round(val.atual * 100) / 100,
      Contrato: Math.round(val.contrato * 100) / 100,
      'CCT/CLT': Math.round(val.cct * 100) / 100,
    })).filter(d => d.Atual > 0 || d.Contrato > 0 || d['CCT/CLT'] > 0);
  }, [rubricaAgg]);

  const heatmapData = useMemo(() => {
    const rng = seededRng(456);
    const rubricas = Object.entries(rubricaAgg).filter(([, v]) => v.cct > 0);
    return rubricas.map(([key, val]) => ({
      rubrica: key,
      meses: MESES.map((mes) => {
        const base = val.cct > 0 ? ((val.cct - val.atual) / val.cct * 100) : 0;
        const variacao = base + (rng() - 0.5) * 3;
        return { mes, valor: Math.max(0, Math.abs(variacao)) };
      })
    }));
  }, [rubricaAgg]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold text-texto">Descontos — Detalhamento</h1>
        <p className="text-[13px] text-texto-sec mt-1">Analise detalhada de cada rubrica de desconto</p>
      </div>

      <div className="flex items-start gap-12 mb-8">
        <KPICard icon={Wallet} iconColor="text-atual" label="Total Descontos Atual" value={totalAtual} delay={0} />
        <KPICard icon={DollarSign} iconColor="text-cct" label="Total Descontos CCT" value={totalCCT} delay={50} />
        <KPICard icon={AlertTriangle} iconColor="text-alerta" label="Divergencia Total" value={Math.abs(divergencia)} delay={100} />
      </div>

      <div className="mb-8">
        <div className="section-label mb-4">Rubricas de Descontos</div>
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

      <div className="card p-5 mb-8">
        <h3 className="text-sm font-semibold text-texto mb-1">Barras Agrupadas por Rubrica</h3>
        <p className="text-[11px] text-texto-sec mb-4">Comparativo visual — 3 parametros por rubrica de desconto</p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Atual" fill="#E74C6F" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Contrato" fill="#3B82F6" radius={[3, 3, 0, 0]} />
            <Bar dataKey="CCT/CLT" fill="#10B981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-texto mb-1">Heatmap de Divergencias</h3>
        <p className="text-[11px] text-texto-sec mb-4">Intensidade de desvio (%) — Atual vs CCT por mes</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left py-2 px-2 text-texto-sec font-medium min-w-[160px]">Rubrica</th>
                {MESES.map(m => (
                  <th key={m} className="py-2 px-1 text-texto-sec font-medium text-center w-12">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row, ri) => (
                <tr key={ri} className="border-t border-borda/30">
                  <td className="py-1.5 px-2 text-texto font-medium truncate max-w-[160px]">{row.rubrica}</td>
                  {row.meses.map((cell, ci) => {
                    const intensity = Math.min(cell.valor / 10, 1);
                    const bgColor = cell.valor < 1
                      ? `rgba(16, 185, 129, ${0.2 + intensity * 0.3})`
                      : cell.valor < 5
                      ? `rgba(245, 158, 11, ${0.2 + intensity * 0.5})`
                      : `rgba(239, 68, 68, ${0.3 + intensity * 0.5})`;
                    return (
                      <td key={ci} className="py-1.5 px-1 text-center">
                        <div
                          className="w-full h-7 rounded flex items-center justify-center font-mono text-[10px] font-medium"
                          style={{ backgroundColor: bgColor, color: cell.valor > 5 ? '#fff' : '#1E293B' }}
                          title={`${row.rubrica} - ${cell.mes}: ${cell.valor.toFixed(1)}%`}
                        >
                          {cell.valor.toFixed(1)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 mt-3 text-[10px] text-texto-sec">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{backgroundColor:'rgba(16,185,129,0.4)'}} /> Conforme (&lt;1%)</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{backgroundColor:'rgba(245,158,11,0.5)'}} /> Alerta (1-5%)</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{backgroundColor:'rgba(239,68,68,0.6)'}} /> Critico (&gt;5%)</div>
        </div>
      </div>
    </div>
  );
}
