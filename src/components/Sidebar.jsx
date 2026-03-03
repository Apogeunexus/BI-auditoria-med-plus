import {
  LayoutDashboard, TrendingUp, Wallet, Building2, Gift,
  Users, Table2, ChevronLeft, ChevronRight, Shield, Zap
} from 'lucide-react';

const menuItems = [
  { id: 'executiva', label: 'Visao Executiva', icon: LayoutDashboard, emoji: '' },
  { id: 'proventos', label: 'Proventos', icon: TrendingUp },
  { id: 'descontos', label: 'Descontos', icon: Wallet },
  { id: 'encargos', label: 'Encargos', icon: Building2 },
  { id: 'beneficios', label: 'Beneficios', icon: Gift },
  { id: 'colaborador', label: 'Por Colaborador', icon: Users },
  { id: 'analitica', label: 'Tabela Analitica', icon: Table2 },
];

export default function Sidebar({ activePage, onNavigate, collapsed, onToggleCollapse }) {
  return (
    <aside
      className="fixed left-0 top-0 h-screen glass-dark flex flex-col z-50 transition-all duration-300"
      style={{ width: collapsed ? 72 : 264 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-atual via-info to-cct flex items-center justify-center shrink-0 shadow-lg shadow-atual/20">
          <Shield size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <div className="text-white font-bold text-[15px] font-[var(--font-heading)] leading-tight tracking-tight">Auditoria</div>
            <div className="text-gray-500 text-[11px] font-medium">Folha de Pagamento</div>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="text-[10px] text-gray-600 font-bold uppercase tracking-[3px] px-3 mb-4">Navegacao</div>
        )}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-250 cursor-pointer group ${
                isActive
                  ? 'bg-white/[0.08] text-white sidebar-active-glow'
                  : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-300'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 ${
                isActive
                  ? 'bg-gradient-to-br from-atual to-atual/60 text-white shadow-md shadow-atual/20'
                  : 'bg-white/[0.04] text-gray-500 group-hover:bg-white/[0.08] group-hover:text-gray-300'
              }`}>
                <Icon size={16} />
              </div>
              {!collapsed && (
                <span className={`text-[13px] truncate transition-all ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-atual shadow-sm shadow-atual/50" />
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-white/[0.05] hover:text-gray-300 transition-all cursor-pointer"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="text-[11px] font-medium">Recolher menu</span>}
        </button>
      </div>

      {/* Contract info */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-white/[0.06] animate-fade-in">
          <div className="bg-white/[0.04] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={12} className="text-alerta" />
              <div className="text-[9px] text-gray-500 font-bold uppercase tracking-[2px]">Contrato Ativo</div>
            </div>
            <div className="text-white text-xs font-semibold leading-tight">Inframerica BA</div>
            <div className="text-gray-500 text-[11px] mt-0.5">Aeroporto Salvador</div>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cct animate-pulse" />
              <span className="text-gray-600 text-[10px]">Comp. 2026/01</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
