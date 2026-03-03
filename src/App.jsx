import { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import GlobalFilters from './components/GlobalFilters';
import VisaoExecutiva from './pages/VisaoExecutiva';
import Proventos from './pages/Proventos';
import Descontos from './pages/Descontos';
import Encargos from './pages/Encargos';
import Beneficios from './pages/Beneficios';
import PorColaborador from './pages/PorColaborador';
import TabelaAnalitica from './pages/TabelaAnalitica';
import { carregarDados, fetchPeriodosDisponiveis, calcSeveridade } from './data/supabaseData';

function App() {
  const [activePage, setActivePage] = useState('executiva');
  const [allColaboradores, setAllColaboradores] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    competencia: '',
    funcao: 'Todas',
    severidade: 'Todas',
  });

  // Load available periods on mount
  useEffect(() => {
    fetchPeriodosDisponiveis().then(p => {
      setPeriodos(p);
      if (p.length > 0) {
        setFilters(f => ({ ...f, competencia: p[0] }));
      }
    }).catch(err => console.error('Erro ao carregar periodos:', err));
  }, []);

  // Load data when competencia changes
  useEffect(() => {
    if (!filters.competencia) return;
    setLoading(true);
    setError(null);
    carregarDados(filters.competencia)
      .then(data => {
        setAllColaboradores(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar dados:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [filters.competencia]);

  // Derive unique funcoes from data
  const funcoes = useMemo(() => {
    const unique = [...new Set(allColaboradores.map(c => c.funcao).filter(Boolean))].sort();
    return ['Todas', ...unique];
  }, [allColaboradores]);

  // Apply filters
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
    if (loading) {
      return (
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-atual border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-texto-sec text-sm">Carregando dados da folha...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <p className="text-critico font-semibold mb-2">Erro ao carregar dados</p>
            <p className="text-texto-sec text-sm">{error}</p>
          </div>
        </div>
      );
    }

    if (allColaboradores.length === 0) {
      return (
        <div className="flex items-center justify-center py-32">
          <p className="text-texto-sec text-sm">Nenhum dado encontrado para este periodo.</p>
        </div>
      );
    }

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
          <GlobalFilters
            filters={filters}
            onFilterChange={setFilters}
            periodos={periodos}
            funcoes={funcoes}
          />
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
