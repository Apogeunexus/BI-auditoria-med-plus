import { useEffect, useState, useRef } from 'react';
import { formatCurrency } from '../data/generateData';

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(target * eased);
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);
  return value;
}

export default function KPICard({ icon: Icon, iconColor, label, value, subtitle, trend, delay = 0 }) {
  const animatedValue = useCountUp(value);
  return (
    <div
      className="animate-fade-in flex items-start gap-3"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon size={24} className="text-[#374151] mt-0.5 shrink-0" />
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] font-bold text-texto tabular-nums leading-tight">
            {formatCurrency(animatedValue)}
          </span>
          {trend !== undefined && (
            <span className={`text-[12px] font-semibold ${trend >= 0 ? 'text-critico' : 'text-conforme'}`}>
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
          )}
        </div>
        <div className="text-[12px] text-texto-sec mt-0.5">{label}</div>
      </div>
    </div>
  );
}
