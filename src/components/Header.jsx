const navItems = [
  { id: 'executiva', label: 'Executivo' },
  { id: 'proventos', label: 'Proventos' },
  { id: 'descontos', label: 'Descontos' },
  { id: 'encargos', label: 'Encargos' },
  { id: 'beneficios', label: 'Beneficios' },
  { id: 'colaborador', label: 'Colaboradores' },
  { id: 'analitica', label: 'Analitico' },
];

export default function Header({ activePage, onNavigate }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-borda">
      <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0 mr-8">
          <div className="w-8 h-8 rounded-full border border-borda-input flex items-center justify-center">
            <span className="text-[14px] font-bold leading-none">
              <span className="text-texto">med</span>
              <span className="text-[#E74C3C]">+</span>
            </span>
          </div>
          <span className="text-texto-label text-[12px] font-medium">Group</span>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative px-3 py-4 text-[14px] whitespace-nowrap cursor-pointer transition-colors ${
                activePage === item.id
                  ? 'nav-tab-active'
                  : 'text-texto-sec hover:text-texto font-normal'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right side spacer */}
        <div className="shrink-0 w-8" />
      </div>
    </header>
  );
}
