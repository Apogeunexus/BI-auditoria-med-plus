import { useEffect, useState } from 'react';
import { formatCurrency, calcSeveridade } from '../data/supabaseData';

const SEVERITY_CLASSES = {
  CRITICA: 'badge-critica',
  ALERTA: 'badge-alerta',
  INFO: 'badge-info',
  CONFORME: 'badge-conforme',
};

export default function TripleComparisonCard({ title, atual, contrato, cct, delay = 0 }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay + 100);
    return () => clearTimeout(t);
  }, [delay]);

  const severidade = calcSeveridade(atual, cct);
  const diffContrato = cct - contrato;
  const diffAtual = cct - atual;
  const maxVal = Math.max(atual, contrato, cct, 1);

  const barAtual = (atual / maxVal) * 100;
  const barContrato = (contrato / maxVal) * 100;
  const barCCT = (cct / maxVal) * 100;

  return (
    <div
      className="card p-6 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Title + badge */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-texto pr-2 leading-tight">{title}</h3>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded whitespace-nowrap uppercase tracking-wide ${SEVERITY_CLASSES[severidade]}`}>
          {severidade}
        </span>
      </div>

      {/* Summary values */}
      <div className="space-y-1 text-[12px] text-texto-sec mb-5">
        <div className="flex justify-between">
          <span>CCT:</span>
          <span className="font-medium text-texto">{formatCurrency(cct)}</span>
        </div>
        <div className="flex justify-between">
          <span>Contrato:</span>
          <span className="font-medium text-texto">{formatCurrency(contrato)}</span>
        </div>
        <div className="flex justify-between">
          <span>Dif. Contrato:</span>
          <span className={`font-semibold ${diffContrato > 0 ? 'text-critico' : diffContrato < 0 ? 'text-conforme' : 'text-texto-sec'}`}>
            {diffContrato > 0 ? '-' : diffContrato < 0 ? '+' : ''}{formatCurrency(Math.abs(diffContrato))}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Dif. Atual:</span>
          <span className={`font-semibold ${diffAtual > 0 ? 'text-critico' : diffAtual < 0 ? 'text-conforme' : 'text-texto-sec'}`}>
            {diffAtual > 0 ? '-' : diffAtual < 0 ? '+' : ''}{formatCurrency(Math.abs(diffAtual))}
          </span>
        </div>
      </div>

      {/* Comparison bars */}
      <div className="space-y-3">
        {[
          { label: 'Atual', value: atual, width: barAtual, colorClass: 'bar-atual', textColor: 'text-atual' },
          { label: 'Contrato', value: contrato, width: barContrato, colorClass: 'bar-contrato', textColor: 'text-contrato' },
          { label: 'CCT', value: cct, width: barCCT, colorClass: 'bar-cct', textColor: 'text-cct' },
        ].map((bar) => (
          <div key={bar.label} className="flex items-center gap-3">
            <span className="text-[12px] font-medium text-texto-sec w-[70px] shrink-0">{bar.label}</span>
            <div className="flex-1 bar-track h-2.5">
              <div
                className={`h-full ${bar.colorClass} transition-all duration-600 ease-out`}
                style={{ width: animated ? `${bar.width}%` : '0%' }}
              />
            </div>
            <span className={`text-[14px] font-semibold tabular-nums w-[100px] text-right shrink-0 ${bar.textColor}`}>
              {formatCurrency(bar.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
