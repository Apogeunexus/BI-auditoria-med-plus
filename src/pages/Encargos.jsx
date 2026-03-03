import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { Building2, DollarSign, AlertTriangle } from 'lucide-react';
import KPICard from '../components/KPICard';
import TripleComparisonCard from '../components/TripleComparisonCard';
import { formatCurrency, aggregateByCategoria, aggregateTotais } from '../data/supabaseData';

const ENCARGO_COLORS = [
  '#E74C6F', '#3B82F6', '#10B981', '#F59E0B', '#6366F1',
  '#EC4899', '#14B8A6', '#F97316', '#8B5CF6', '#06B6D4'
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-3 rounded-lg border border-borda text-[12px] max-w-xs">
      <div className="font-semibold text-texto mb-2">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.fill || p.color }} />
          <span className="text-texto-sec truncate">{p.name}:</span>
          <span className="font-mono font-semibold text-texto">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function DonutLabel({ viewBox, value }) {
  const { cx, cy } = viewBox;
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-8" className="text-lg font-bold fill-texto" style={{ fontFamily: 'var(--font-mono)' }}>
        {formatCurrency(value)}
      </tspan>
      <tspan x={cx} dy="18" className="text-[10px] fill-texto-sec">Total</tspan>
    </text>
  );
}

export default function Encargos({ colaboradores }) {
  const rubricaAgg = useMemo(() => aggregateByCategoria(colaboradores, 'encargos'), [colaboradores]);

  const totaisAgg = useMemo(() => aggregateTotais(colaboradores), [colaboradores]);
  const totalAtual = totaisAgg.encargos.atual;
  const totalCCT = totaisAgg.encargos.cct;
  const divergencia = totalCCT - totalAtual;

  const encargoKeys = Object.keys(rubricaAgg);
  const shortLabels = encargoKeys.map(k => k.replace('Provisao ', 'Prov. ').replace('Patronal', 'Patr.').replace('(Prov. Rescisoria)', 'Resc.'));

  // Stacked bar data
  const stackedData = useMemo(() => {
    return [
      { name: 'Atual', ...Object.fromEntries(encargoKeys.map(k => [k, rubricaAgg[k].atual])) },
      { name: 'Contrato', ...Object.fromEntries(encargoKeys.map(k => [k, rubricaAgg[k].contrato])) },
      { name: 'CCT/CLT', ...Object.fromEntries(encargoKeys.map(k => [k, rubricaAgg[k].cct])) },
    ];
  }, [rubricaAgg]);

  // Donut data
  const donutAtual = useMemo(() =>
    encargoKeys.map((k, i) => ({
      name: k.substring(0, 20),
      value: Math.round(rubricaAgg[k].atual * 100) / 100,
      fill: ENCARGO_COLORS[i % ENCARGO_COLORS.length],
    })).filter(d => d.value > 0),
    [rubricaAgg]
  );

  const donutCCT = useMemo(() =>
    encargoKeys.map((k, i) => ({
      name: k.substring(0, 20),
      value: Math.round(rubricaAgg[k].cct * 100) / 100,
      fill: ENCARGO_COLORS[i % ENCARGO_COLORS.length],
    })).filter(d => d.value > 0),
    [rubricaAgg]
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold text-texto">Encargos — Detalhamento</h1>
        <p className="text-[13px] text-texto-sec mt-1">Analise detalhada de cada encargo trabalhista e previdenciario</p>
      </div>

      <div className="flex items-start gap-12 mb-8">
        <KPICard icon={Building2} iconColor="text-atual" label="Total Encargos Atual" value={totalAtual} delay={0} />
        <KPICard icon={DollarSign} iconColor="text-cct" label="Total Encargos CCT" value={totalCCT} delay={50} />
        <KPICard icon={AlertTriangle} iconColor="text-alerta" label="Diferenca" value={Math.abs(divergencia)} trend={totalAtual > 0 ? (divergencia / totalAtual * 100) : 0} delay={100} />
      </div>

      <div className="mb-8">
        <div className="section-label mb-4">Encargos Individuais</div>
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

      {/* Stacked Bar */}
      <div className="card p-5 mb-8">
        <h3 className="text-sm font-semibold text-texto mb-1">Composicao dos Encargos (Empilhado)</h3>
        <p className="text-[11px] text-texto-sec mb-4">Composicao percentual dos encargos para cada parametro</p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={stackedData} layout="vertical" margin={{ left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#64748B', fontWeight: 600 }} width={80} />
            <Tooltip content={<CustomTooltip />} />
            {encargoKeys.map((k, i) => (
              <Bar key={k} dataKey={k} stackId="a" fill={ENCARGO_COLORS[i % ENCARGO_COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-3 mt-4">
          {encargoKeys.map((k, i) => (
            <div key={k} className="flex items-center gap-1.5 text-[10px] text-texto-sec">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: ENCARGO_COLORS[i % ENCARGO_COLORS.length] }} />
              {k.substring(0, 25)}
            </div>
          ))}
        </div>
      </div>

      {/* Donut Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-texto mb-1">Distribuicao — Atual</h3>
          <p className="text-[11px] text-texto-sec mb-4">Participacao de cada encargo no total atual</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={donutAtual} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value">
                {donutAtual.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center font-mono text-lg font-bold text-texto">{formatCurrency(totalAtual)}</div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-texto mb-1">Distribuicao — CCT/CLT</h3>
          <p className="text-[11px] text-texto-sec mb-4">Participacao de cada encargo no total correto</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={donutCCT} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value">
                {donutCCT.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center font-mono text-lg font-bold text-texto">{formatCurrency(totalCCT)}</div>
        </div>
      </div>
    </div>
  );
}
