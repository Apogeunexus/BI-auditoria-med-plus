import { useState, useMemo } from 'react';
import Header from './components/Header';
import GlobalFilters from './components/GlobalFilters';
import VisaoExecutiva from './pages/VisaoExecutiva';
import Proventos from './pages/Proventos';
import Descontos from './pages/Descontos';
import Encargos from './pages/Encargos';
import Beneficios from './pages/Beneficios';
import PorColaborador from './pages/PorColaborador';
import TabelaAnalitica from './pages/TabelaAnalitica';
import { gerarDadosSimulados, calcSeveridade } from './data/generateData';

function App() {
  const [activePage, setActivePage] = useState('executiva');
  const [filters, setFilters] = useState({
    competencia: '2026/01',
    funcao: 'Todas',
    severidade: 'Todas',
  });

  const { contrato, colaboradores: allColaboradores } = useMemo(() => gerarDadosSimulados(), []);

  const colaboradores = useMemo(() => {
    let result = allColaboradores;
    if (filters.funcao !== 'Todas') {
      result = result.filter(c => c.funcao === filters.funcao);
    }
    if (filters.severidade !== 'Todas') {
      result = result.filter(c => {
        const sev = calcSeveridade(c.totais.custoTotal.atual, c.totais.custoTotal.cct);
        return sev === filters.severidade;
      });
    }
    return result;
  }, [allColaboradores, filters]);

  const renderPage = () => {
    switch (activePage) {
      case 'executiva': return <VisaoExecutiva colaboradores={colaboradores} />;
      case 'proventos': return <Proventos colaboradores={colaboradores} />;
      case 'descontos': return <Descontos colaboradores={colaboradores} />;
      case 'encargos': return <Encargos colaboradores={colaboradores} />;
      case 'beneficios': return <Beneficios colaboradores={colaboradores} />;
      case 'colaborador': return <PorColaborador colaboradores={allColaboradores} />;
      case 'analitica': return <TabelaAnalitica colaboradores={colaboradores} />;
      default: return <VisaoExecutiva colaboradores={colaboradores} />;
    }
  };

  return (
    <div className="min-h-screen bg-fundo">
      <Header activePage={activePage} onNavigate={setActivePage} />

      {/* Filter bar */}
      <div className="bg-white border-b border-borda">
        <div className="max-w-[1440px] mx-auto px-6">
          <GlobalFilters filters={filters} onFilterChange={setFilters} />
        </div>
      </div>

      {/* Content */}
      <main className="max-w-[1440px] mx-auto px-6 py-6">
        <div key={activePage} className="page-enter">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;
