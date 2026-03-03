// ===== DATA GENERATION MODULE =====
// Generates realistic payroll audit data for ~118 employees

const SALARIO_MINIMO = 1518.00;

const CONTRATO = {
  nome: "Contrato Inframerica BA — Aeroporto Salvador",
  cliente: "Inframerica Concessionaria",
  competencia: "2026/01",
  totalColaboradores: 118,
  funcoes: [
    { nome: "Motorista Socorrista", qtd: 42, pisoSalarial: 1578.72, insalubridade: 0.20, periculosidade: 0, adicionalNoturno: 0.35 },
    { nome: "Tecnico de Enfermagem", qtd: 35, pisoSalarial: 1812.45, insalubridade: 0.20, periculosidade: 0, adicionalNoturno: 0.30 },
    { nome: "Bombeiro Civil", qtd: 28, pisoSalarial: 2150.00, insalubridade: 0, periculosidade: 0.30, adicionalNoturno: 0.25 },
    { nome: "Auxiliar Administrativo", qtd: 13, pisoSalarial: 1518.00, insalubridade: 0, periculosidade: 0, adicionalNoturno: 0 }
  ]
};

const NOMES = [
  "Rafael Silva de Aquino","Alex Pereira da Silva","Ayeda Santos de Jesus","Maria Fernanda Oliveira Costa",
  "Joao Pedro Souza Lima","Lucas Gabriel Ferreira Santos","Ana Carolina Ribeiro Mendes","Carlos Eduardo Almeida Rocha",
  "Juliana Cristina Barbosa Nunes","Marcos Antonio de Oliveira","Patricia Souza Nascimento","Fernando Henrique Costa Dias",
  "Camila Rodrigues Pinto","Roberto Carlos Santos Filho","Larissa Beatriz Moreira Lima","Thiago Augusto Pereira Gomes",
  "Vanessa Cristiane Silva Ramos","Diego Fernando Carvalho Melo","Isabela Fernandes Castro","Anderson Luis Martins Soares",
  "Bruna Aparecida Lima Santos","Eduardo Jorge Nascimento Cruz","Gabriela Monteiro de Souza","Henrique Paulo Teixeira Matos",
  "Leticia Mariana Araujo Pires","Matheus Ryan Costa Moreira","Natalia Cristina Duarte Farias","Pedro Henrique Lopes Correia",
  "Raquel Fernanda Vieira Reis","Samuel Lucas Machado Borges","Tatiane Aline Cardoso Neves","Victor Hugo Azevedo Freitas",
  "Amanda Kelly Santos Guimaraes","Bruno Cesar Domingos Luz","Daniele Priscila Nogueira Roque","Ednaldo Pereira Silveira Junior",
  "Fabricia Monique Brito Tavares","Gustavo Renato Campos Viana","Helena Patricia Fonseca Batista","Igor Matheus Prado Andrade",
  "Jessica Tamires Leite Amorim","Kleber Ronaldo Medeiros Brum","Luana Beatrice Cunha Figueredo","Marcelo Augusto Rezende Paiva",
  "Nadia Simone Coelho Marques","Otavio Cesar Braga Miranda","Priscila Andressa Rangel Monteiro","Rodrigo Felipe Xavier Amaral",
  "Sabrina Michelle Torres Valente","Tiago Alexandre Siqueira Leal","Ursula Viviane Moura Peixoto","Vinicius Daniel Esteves Rosa",
  "Wesley Patrick Barreto Fontes","Ximena Carolina Aguiar Sampaio","Yasmin Lorena Pacheco Diniz","Zenaldo Marcos Lobato Cruz",
  "Adriana Luiza Queiroz Dantas","Bernardo Felipe Lacerda Galvao","Cintia Raquel Pessoa Moreno","Davi Lucas Serpa Magalhaes",
  "Eliane Marta Vargas Flores","Flavio Roberto Rego Damasceno","Gisele Nathalia Pimentel Bastos","Hugo Leonardo Cordeiro Maciel",
  "Iara Melissa Dourado Canuto","Jonas Ricardo Milhomem Porto","Karen Vitoria Penha Rubim","Leonardo Murilo Trindade Lago",
  "Michele Regiane Scaff Dutra","Nicolas Arthur Palhano Vilela","Olga Beatriz Franca Lustosa","Paulo Victor Avelar Quintas",
  "Rosa Helena Gentil Brandao","Sergio Luiz Feitosa Cabral","Teresa Margarida Veloso Negreiros","Ulisses Demetrio Falcao Sena",
  "Valdirene Suzana Calixto Romao","Wagner Dimas Assuncao Lobo","Xuxa Celina Pantoja Gouveia","Yuri Caio Maranhao Rabelo",
  "Zelia Rosana Coutinho Borba","Antonio Marcos Proenca Sales","Beatriz Helena Simoes Queiros","Claudio Renato Espindola Tavora",
  "Denise Fatima Cavalcante Muniz","Emerson Luiz Fragoso Bueno","Francisca Joana Girardi Hermes","Geraldo Nivaldo Bandeira Castelo",
  "Heloisa Jane Xaves Coimbra","Italo Magno Parente Noronha","Josefa Lucimar Penteado Gurgel","Kevin Bryan Tupinamba Otoni",
  "Lidia Aurora Mascarenhas Gobbi","Manoel Raimundo Bacelar Junco","Neide Sonia Lameira Pitanga","Osvaldo Nelson Couto Mariano",
  "Paloma Ivete Torquato Jardim","Quirino Tadeu Alcantara Egito","Rita Dalva Samudio Palhares","Silvana Noemi Travasos Medina",
  "Teresinha Odete Fagundes Crespo","Ubirajara Valdomiro Chagas Portela","Vilma Neuza Belmonte Saldanha","Wanderley Renildo Aragao Seabra",
  "Alexia Mirela Tourinho Simas","Benedito Claudio Linhares Gondim","Cassia Dolores Modesto Habib","Dalton Eraldo Manduca Farinha",
  "Elisa Mara Bezerra Caldeira","Fabiano Jorge Alencar Neiva","Gloria Angelica Coqueiro Lustosa","Haroldo Ismael Barata Meirelles",
  "Ines Carmem Quaresma Macedo","Jailson Romeu Catunda Beraldo","Keila Sandra Vasconcelos Barreira","Lucineia Aparecida Godoy Valenca"
];

function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateCPF(rng) {
  const d = () => Math.floor(rng() * 10);
  return `${d()}${d()}${d()}.${d()}${d()}${d()}.${d()}${d()}${d()}-${d()}${d()}`;
}

function generateMatricula(index) {
  return String(18000 + index).padStart(6, '0');
}

function calcINSS(salarioBruto) {
  let inss = 0;
  const faixas = [
    { limite: 1518.00, aliquota: 0.075 },
    { limite: 2793.88, aliquota: 0.09 },
    { limite: 4190.83, aliquota: 0.12 },
    { limite: 8157.41, aliquota: 0.14 }
  ];
  let base = salarioBruto;
  let anterior = 0;
  for (const f of faixas) {
    if (base <= 0) break;
    const faixa = Math.min(base, f.limite - anterior);
    inss += faixa * f.aliquota;
    base -= faixa;
    anterior = f.limite;
  }
  return Math.min(inss, 951.63);
}

function calcIRRF(salarioBruto, inss, dependentes = 0) {
  const base = salarioBruto - inss - (dependentes * 189.59);
  if (base <= 2259.20) return 0;
  if (base <= 2826.65) return base * 0.075 - 169.44;
  if (base <= 3751.05) return base * 0.15 - 381.44;
  if (base <= 4664.68) return base * 0.225 - 662.77;
  return base * 0.275 - 896.00;
}

export function gerarDadosSimulados() {
  const rng = seededRandom(42);
  const colaboradores = [];
  let globalIndex = 0;

  for (const funcao of CONTRATO.funcoes) {
    for (let i = 0; i < funcao.qtd; i++) {
      const nome = NOMES[globalIndex] || `Colaborador ${globalIndex + 1}`;
      const cpf = generateCPF(rng);
      const matricula = generateMatricula(globalIndex);
      const isNoturno = rng() > 0.55;
      const temHoraExtra = rng() > 0.4;
      const dependentes = Math.floor(rng() * 4);
      const isConforme = rng() > 0.82;

      // ===== CCT Values (correct by law) =====
      const cct = {};
      cct.salarioBase = funcao.pisoSalarial;
      cct.insalubridade = funcao.insalubridade > 0 ? SALARIO_MINIMO * funcao.insalubridade : 0;
      cct.periculosidade = funcao.periculosidade > 0 ? cct.salarioBase * funcao.periculosidade : 0;
      cct.adicionalNoturno = isNoturno ? cct.salarioBase * funcao.adicionalNoturno * 0.2 : 0;
      cct.horasExtras50 = temHoraExtra ? cct.salarioBase / 220 * 1.5 * Math.floor(rng() * 20 + 5) : 0;
      cct.horasExtras100 = temHoraExtra && rng() > 0.6 ? cct.salarioBase / 220 * 2 * Math.floor(rng() * 8 + 2) : 0;
      cct.dsrHorasExtras = (cct.horasExtras50 + cct.horasExtras100) / 6;
      cct.adicionalFuncao = funcao.nome === "Bombeiro Civil" ? 150.00 : funcao.nome === "Tecnico de Enfermagem" ? 100.00 : 0;
      cct.salarioFamilia = dependentes > 0 && cct.salarioBase <= 1819.26 ? dependentes * 62.04 : 0;
      cct.outrosProventos = rng() > 0.8 ? Math.round(rng() * 150 * 100) / 100 : 0;

      const totalProventosCCT = cct.salarioBase + cct.insalubridade + cct.periculosidade +
        cct.adicionalNoturno + cct.horasExtras50 + cct.horasExtras100 + cct.dsrHorasExtras +
        cct.adicionalFuncao + cct.salarioFamilia + cct.outrosProventos;

      cct.inss = calcINSS(totalProventosCCT);
      cct.irrf = Math.max(0, calcIRRF(totalProventosCCT, cct.inss, dependentes));
      cct.valeTransporteDesc = Math.min(cct.salarioBase * 0.06, 200);
      cct.valeRefeicaoDesc = 0;
      cct.planoSaudeDesc = rng() > 0.3 ? 45.00 : 0;
      cct.planoOdontologicoDesc = rng() > 0.5 ? 15.00 : 0;
      cct.pensaoAlimenticia = rng() > 0.9 ? Math.round(totalProventosCCT * 0.15 * 100) / 100 : 0;
      cct.adiantamento = rng() > 0.6 ? Math.round(cct.salarioBase * 0.4 * 100) / 100 : 0;
      cct.faltasAtrasos = rng() > 0.85 ? Math.round(cct.salarioBase / 30 * Math.floor(rng() * 3 + 1) * 100) / 100 : 0;
      cct.outrosDescontos = rng() > 0.9 ? Math.round(rng() * 80 * 100) / 100 : 0;

      const totalDescontosCCT = cct.inss + cct.irrf + cct.valeTransporteDesc + cct.valeRefeicaoDesc +
        cct.planoSaudeDesc + cct.planoOdontologicoDesc + cct.pensaoAlimenticia + cct.adiantamento +
        cct.faltasAtrasos + cct.outrosDescontos;

      // Encargos CCT
      cct.inssPatronal = totalProventosCCT * 0.20;
      cct.ratFap = totalProventosCCT * 0.03;
      cct.sistemaS = totalProventosCCT * 0.058;
      cct.fgts = totalProventosCCT * 0.08;
      cct.fgts13 = cct.salarioBase * 0.08 / 12;
      cct.fgtsFerias = (cct.salarioBase + cct.salarioBase / 3) * 0.08 / 12;
      cct.provisao13 = cct.salarioBase / 12;
      cct.provisaoFerias = cct.salarioBase / 12;
      cct.provisao13Ferias = cct.salarioBase / 3 / 12;
      cct.multaFGTS = totalProventosCCT * 0.08 * 0.40 / 12;

      const totalEncargosCCT = cct.inssPatronal + cct.ratFap + cct.sistemaS + cct.fgts +
        cct.fgts13 + cct.fgtsFerias + cct.provisao13 + cct.provisaoFerias + cct.provisao13Ferias + cct.multaFGTS;

      // Beneficios CCT
      cct.valeTransporteCusto = 11.00 * 22 - cct.valeTransporteDesc;
      cct.valeRefeicaoCusto = 30.00 * 22;
      cct.valeAlimentacaoCusto = 200.00;
      cct.planoSaudeCusto = 320.00;
      cct.planoOdontologicoCusto = 35.00;
      cct.seguroVida = 18.50;
      cct.cestaBasica = 150.00;
      cct.auxilioCreche = dependentes > 0 && rng() > 0.5 ? 150.00 : 0;
      cct.outrosBeneficios = 0;

      const totalBeneficiosCCT = cct.valeTransporteCusto + cct.valeRefeicaoCusto + cct.valeAlimentacaoCusto +
        cct.planoSaudeCusto + cct.planoOdontologicoCusto + cct.seguroVida + cct.cestaBasica +
        cct.auxilioCreche + cct.outrosBeneficios;

      // ===== Contrato Values =====
      const contrato = {};
      const contratoDefasagem = isConforme ? 1.0 : (0.94 + rng() * 0.04);
      contrato.salarioBase = Math.round(cct.salarioBase * contratoDefasagem * 100) / 100;
      contrato.insalubridade = funcao.insalubridade > 0 ? (isConforme ? cct.insalubridade : Math.round(contrato.salarioBase * funcao.insalubridade * 100) / 100) : 0;
      contrato.periculosidade = funcao.periculosidade > 0 ? Math.round(contrato.salarioBase * funcao.periculosidade * 100) / 100 : 0;
      contrato.adicionalNoturno = isNoturno ? Math.round(contrato.salarioBase * funcao.adicionalNoturno * 0.2 * 100) / 100 : 0;
      contrato.horasExtras50 = Math.round(cct.horasExtras50 * (contrato.salarioBase / cct.salarioBase) * 100) / 100;
      contrato.horasExtras100 = Math.round(cct.horasExtras100 * (contrato.salarioBase / cct.salarioBase) * 100) / 100;
      contrato.dsrHorasExtras = Math.round((contrato.horasExtras50 + contrato.horasExtras100) / 6 * 100) / 100;
      contrato.adicionalFuncao = cct.adicionalFuncao;
      contrato.salarioFamilia = cct.salarioFamilia;
      contrato.outrosProventos = cct.outrosProventos;

      const totalProventosContrato = contrato.salarioBase + contrato.insalubridade + contrato.periculosidade +
        contrato.adicionalNoturno + contrato.horasExtras50 + contrato.horasExtras100 + contrato.dsrHorasExtras +
        contrato.adicionalFuncao + contrato.salarioFamilia + contrato.outrosProventos;

      contrato.inss = calcINSS(totalProventosContrato);
      contrato.irrf = Math.max(0, calcIRRF(totalProventosContrato, contrato.inss, dependentes));
      contrato.valeTransporteDesc = Math.min(contrato.salarioBase * 0.06, 200);
      contrato.valeRefeicaoDesc = 0;
      contrato.planoSaudeDesc = cct.planoSaudeDesc;
      contrato.planoOdontologicoDesc = cct.planoOdontologicoDesc;
      contrato.pensaoAlimenticia = cct.pensaoAlimenticia > 0 ? Math.round(totalProventosContrato * 0.15 * 100) / 100 : 0;
      contrato.adiantamento = cct.adiantamento > 0 ? Math.round(contrato.salarioBase * 0.4 * 100) / 100 : 0;
      contrato.faltasAtrasos = cct.faltasAtrasos > 0 ? Math.round(contrato.salarioBase / 30 * Math.ceil(cct.faltasAtrasos / (cct.salarioBase / 30)) * 100) / 100 : 0;
      contrato.outrosDescontos = cct.outrosDescontos;

      const totalDescontosContrato = contrato.inss + contrato.irrf + contrato.valeTransporteDesc + contrato.valeRefeicaoDesc +
        contrato.planoSaudeDesc + contrato.planoOdontologicoDesc + contrato.pensaoAlimenticia + contrato.adiantamento +
        contrato.faltasAtrasos + contrato.outrosDescontos;

      contrato.inssPatronal = totalProventosContrato * 0.20;
      contrato.ratFap = totalProventosContrato * 0.03;
      contrato.sistemaS = totalProventosContrato * 0.058;
      contrato.fgts = totalProventosContrato * 0.08;
      contrato.fgts13 = contrato.salarioBase * 0.08 / 12;
      contrato.fgtsFerias = (contrato.salarioBase + contrato.salarioBase / 3) * 0.08 / 12;
      contrato.provisao13 = contrato.salarioBase / 12;
      contrato.provisaoFerias = contrato.salarioBase / 12;
      contrato.provisao13Ferias = contrato.salarioBase / 3 / 12;
      contrato.multaFGTS = totalProventosContrato * 0.08 * 0.40 / 12;

      const totalEncargosContrato = contrato.inssPatronal + contrato.ratFap + contrato.sistemaS + contrato.fgts +
        contrato.fgts13 + contrato.fgtsFerias + contrato.provisao13 + contrato.provisaoFerias +
        contrato.provisao13Ferias + contrato.multaFGTS;

      contrato.valeTransporteCusto = 10.50 * 22 - contrato.valeTransporteDesc;
      contrato.valeRefeicaoCusto = isConforme ? 30.00 * 22 : 28.00 * 22;
      contrato.valeAlimentacaoCusto = isConforme ? 200.00 : 180.00;
      contrato.planoSaudeCusto = isConforme ? 320.00 : 290.00;
      contrato.planoOdontologicoCusto = 35.00;
      contrato.seguroVida = 18.50;
      contrato.cestaBasica = isConforme ? 150.00 : 130.00;
      contrato.auxilioCreche = cct.auxilioCreche > 0 ? (isConforme ? 150.00 : 120.00) : 0;
      contrato.outrosBeneficios = 0;

      const totalBeneficiosContrato = contrato.valeTransporteCusto + contrato.valeRefeicaoCusto + contrato.valeAlimentacaoCusto +
        contrato.planoSaudeCusto + contrato.planoOdontologicoCusto + contrato.seguroVida + contrato.cestaBasica +
        contrato.auxilioCreche + contrato.outrosBeneficios;

      // ===== Atual Values (what is actually paid — with some errors) =====
      const atual = {};
      const atualVariacao = isConforme ? 1.0 : (0.97 + rng() * 0.04);
      atual.salarioBase = Math.round(contrato.salarioBase * atualVariacao * 100) / 100;
      atual.insalubridade = isConforme ? cct.insalubridade : Math.round(contrato.insalubridade * (0.95 + rng() * 0.1) * 100) / 100;
      atual.periculosidade = Math.round(contrato.periculosidade * (isConforme ? 1 : (0.96 + rng() * 0.06)) * 100) / 100;
      atual.adicionalNoturno = Math.round(contrato.adicionalNoturno * (isConforme ? 1 : (0.9 + rng() * 0.15)) * 100) / 100;
      atual.horasExtras50 = Math.round(contrato.horasExtras50 * (0.98 + rng() * 0.04) * 100) / 100;
      atual.horasExtras100 = Math.round(contrato.horasExtras100 * (0.97 + rng() * 0.06) * 100) / 100;
      atual.dsrHorasExtras = Math.round((atual.horasExtras50 + atual.horasExtras100) / 6 * 100) / 100;
      atual.adicionalFuncao = contrato.adicionalFuncao;
      atual.salarioFamilia = contrato.salarioFamilia;
      atual.outrosProventos = contrato.outrosProventos;

      const totalProventosAtual = atual.salarioBase + atual.insalubridade + atual.periculosidade +
        atual.adicionalNoturno + atual.horasExtras50 + atual.horasExtras100 + atual.dsrHorasExtras +
        atual.adicionalFuncao + atual.salarioFamilia + atual.outrosProventos;

      atual.inss = calcINSS(totalProventosAtual);
      atual.irrf = Math.max(0, calcIRRF(totalProventosAtual, atual.inss, dependentes));
      atual.valeTransporteDesc = Math.min(atual.salarioBase * 0.06, 200);
      atual.valeRefeicaoDesc = 0;
      atual.planoSaudeDesc = contrato.planoSaudeDesc;
      atual.planoOdontologicoDesc = contrato.planoOdontologicoDesc;
      atual.pensaoAlimenticia = contrato.pensaoAlimenticia > 0 ? Math.round(totalProventosAtual * 0.15 * 100) / 100 : 0;
      atual.adiantamento = contrato.adiantamento > 0 ? Math.round(atual.salarioBase * 0.4 * 100) / 100 : 0;
      atual.faltasAtrasos = contrato.faltasAtrasos;
      atual.outrosDescontos = contrato.outrosDescontos;

      const totalDescontosAtual = atual.inss + atual.irrf + atual.valeTransporteDesc + atual.valeRefeicaoDesc +
        atual.planoSaudeDesc + atual.planoOdontologicoDesc + atual.pensaoAlimenticia + atual.adiantamento +
        atual.faltasAtrasos + atual.outrosDescontos;

      atual.inssPatronal = totalProventosAtual * 0.20;
      atual.ratFap = totalProventosAtual * 0.03;
      atual.sistemaS = totalProventosAtual * 0.058;
      atual.fgts = totalProventosAtual * 0.08;
      atual.fgts13 = atual.salarioBase * 0.08 / 12;
      atual.fgtsFerias = (atual.salarioBase + atual.salarioBase / 3) * 0.08 / 12;
      atual.provisao13 = atual.salarioBase / 12;
      atual.provisaoFerias = atual.salarioBase / 12;
      atual.provisao13Ferias = atual.salarioBase / 3 / 12;
      atual.multaFGTS = totalProventosAtual * 0.08 * 0.40 / 12;

      const totalEncargosAtual = atual.inssPatronal + atual.ratFap + atual.sistemaS + atual.fgts +
        atual.fgts13 + atual.fgtsFerias + atual.provisao13 + atual.provisaoFerias + atual.provisao13Ferias + atual.multaFGTS;

      atual.valeTransporteCusto = contrato.valeTransporteCusto;
      atual.valeRefeicaoCusto = contrato.valeRefeicaoCusto;
      atual.valeAlimentacaoCusto = contrato.valeAlimentacaoCusto;
      atual.planoSaudeCusto = contrato.planoSaudeCusto;
      atual.planoOdontologicoCusto = contrato.planoOdontologicoCusto;
      atual.seguroVida = contrato.seguroVida;
      atual.cestaBasica = contrato.cestaBasica;
      atual.auxilioCreche = contrato.auxilioCreche;
      atual.outrosBeneficios = 0;

      const totalBeneficiosAtual = atual.valeTransporteCusto + atual.valeRefeicaoCusto + atual.valeAlimentacaoCusto +
        atual.planoSaudeCusto + atual.planoOdontologicoCusto + atual.seguroVida + atual.cestaBasica +
        atual.auxilioCreche + atual.outrosBeneficios;

      const liquidoAtual = totalProventosAtual - totalDescontosAtual;
      const liquidoContrato = totalProventosContrato - totalDescontosContrato;
      const liquidoCCT = totalProventosCCT - totalDescontosCCT;

      const custoTotalAtual = totalProventosAtual + totalEncargosAtual + totalBeneficiosAtual;
      const custoTotalContrato = totalProventosContrato + totalEncargosContrato + totalBeneficiosContrato;
      const custoTotalCCT = totalProventosCCT + totalEncargosCCT + totalBeneficiosCCT;

      const riscoMensal = custoTotalCCT - custoTotalAtual;
      const riscoAnual = riscoMensal * 12;

      colaboradores.push({
        id: globalIndex,
        nome,
        cpf,
        matricula,
        funcao: funcao.nome,
        competencia: CONTRATO.competencia,
        dependentes,
        isNoturno,
        temHoraExtra,
        isConforme,
        proventos: {
          salarioBase: { atual: atual.salarioBase, contrato: contrato.salarioBase, cct: cct.salarioBase },
          insalubridade: { atual: atual.insalubridade, contrato: contrato.insalubridade, cct: cct.insalubridade },
          periculosidade: { atual: atual.periculosidade, contrato: contrato.periculosidade, cct: cct.periculosidade },
          adicionalNoturno: { atual: atual.adicionalNoturno, contrato: contrato.adicionalNoturno, cct: cct.adicionalNoturno },
          horasExtras50: { atual: atual.horasExtras50, contrato: contrato.horasExtras50, cct: cct.horasExtras50 },
          horasExtras100: { atual: atual.horasExtras100, contrato: contrato.horasExtras100, cct: cct.horasExtras100 },
          dsrHorasExtras: { atual: atual.dsrHorasExtras, contrato: contrato.dsrHorasExtras, cct: cct.dsrHorasExtras },
          adicionalFuncao: { atual: atual.adicionalFuncao, contrato: contrato.adicionalFuncao, cct: cct.adicionalFuncao },
          salarioFamilia: { atual: atual.salarioFamilia, contrato: contrato.salarioFamilia, cct: cct.salarioFamilia },
          outrosProventos: { atual: atual.outrosProventos, contrato: contrato.outrosProventos, cct: cct.outrosProventos },
        },
        descontos: {
          inss: { atual: atual.inss, contrato: contrato.inss, cct: cct.inss },
          irrf: { atual: atual.irrf, contrato: contrato.irrf, cct: cct.irrf },
          valeTransporte: { atual: atual.valeTransporteDesc, contrato: contrato.valeTransporteDesc, cct: cct.valeTransporteDesc },
          valeRefeicao: { atual: atual.valeRefeicaoDesc, contrato: contrato.valeRefeicaoDesc, cct: cct.valeRefeicaoDesc },
          planoSaude: { atual: atual.planoSaudeDesc, contrato: contrato.planoSaudeDesc, cct: cct.planoSaudeDesc },
          planoOdontologico: { atual: atual.planoOdontologicoDesc, contrato: contrato.planoOdontologicoDesc, cct: cct.planoOdontologicoDesc },
          pensaoAlimenticia: { atual: atual.pensaoAlimenticia, contrato: contrato.pensaoAlimenticia, cct: cct.pensaoAlimenticia },
          adiantamento: { atual: atual.adiantamento, contrato: contrato.adiantamento, cct: cct.adiantamento },
          faltasAtrasos: { atual: atual.faltasAtrasos, contrato: contrato.faltasAtrasos, cct: cct.faltasAtrasos },
          outrosDescontos: { atual: atual.outrosDescontos, contrato: contrato.outrosDescontos, cct: cct.outrosDescontos },
        },
        encargos: {
          inssPatronal: { atual: atual.inssPatronal, contrato: contrato.inssPatronal, cct: cct.inssPatronal },
          ratFap: { atual: atual.ratFap, contrato: contrato.ratFap, cct: cct.ratFap },
          sistemaS: { atual: atual.sistemaS, contrato: contrato.sistemaS, cct: cct.sistemaS },
          fgts: { atual: atual.fgts, contrato: contrato.fgts, cct: cct.fgts },
          fgts13: { atual: atual.fgts13, contrato: contrato.fgts13, cct: cct.fgts13 },
          fgtsFerias: { atual: atual.fgtsFerias, contrato: contrato.fgtsFerias, cct: cct.fgtsFerias },
          provisao13: { atual: atual.provisao13, contrato: contrato.provisao13, cct: cct.provisao13 },
          provisaoFerias: { atual: atual.provisaoFerias, contrato: contrato.provisaoFerias, cct: cct.provisaoFerias },
          provisao13Ferias: { atual: atual.provisao13Ferias, contrato: contrato.provisao13Ferias, cct: cct.provisao13Ferias },
          multaFGTS: { atual: atual.multaFGTS, contrato: contrato.multaFGTS, cct: cct.multaFGTS },
        },
        beneficios: {
          valeTransporte: { atual: atual.valeTransporteCusto, contrato: contrato.valeTransporteCusto, cct: cct.valeTransporteCusto },
          valeRefeicao: { atual: atual.valeRefeicaoCusto, contrato: contrato.valeRefeicaoCusto, cct: cct.valeRefeicaoCusto },
          valeAlimentacao: { atual: atual.valeAlimentacaoCusto, contrato: contrato.valeAlimentacaoCusto, cct: cct.valeAlimentacaoCusto },
          planoSaude: { atual: atual.planoSaudeCusto, contrato: contrato.planoSaudeCusto, cct: cct.planoSaudeCusto },
          planoOdontologico: { atual: atual.planoOdontologicoCusto, contrato: contrato.planoOdontologicoCusto, cct: cct.planoOdontologicoCusto },
          seguroVida: { atual: atual.seguroVida, contrato: contrato.seguroVida, cct: cct.seguroVida },
          cestaBasica: { atual: atual.cestaBasica, contrato: contrato.cestaBasica, cct: cct.cestaBasica },
          auxilioCreche: { atual: atual.auxilioCreche, contrato: contrato.auxilioCreche, cct: cct.auxilioCreche },
          outrosBeneficios: { atual: atual.outrosBeneficios, contrato: contrato.outrosBeneficios, cct: cct.outrosBeneficios },
        },
        totais: {
          proventos: { atual: totalProventosAtual, contrato: totalProventosContrato, cct: totalProventosCCT },
          descontos: { atual: totalDescontosAtual, contrato: totalDescontosContrato, cct: totalDescontosCCT },
          encargos: { atual: totalEncargosAtual, contrato: totalEncargosContrato, cct: totalEncargosCCT },
          beneficios: { atual: totalBeneficiosAtual, contrato: totalBeneficiosContrato, cct: totalBeneficiosCCT },
          liquido: { atual: liquidoAtual, contrato: liquidoContrato, cct: liquidoCCT },
          custoTotal: { atual: custoTotalAtual, contrato: custoTotalContrato, cct: custoTotalCCT },
        },
        riscoMensal,
        riscoAnual,
      });

      globalIndex++;
    }
  }

  return { contrato: CONTRATO, colaboradores };
}

// Labels for display
export const LABELS = {
  proventos: {
    salarioBase: "Salario Base",
    insalubridade: "Adicional de Insalubridade",
    periculosidade: "Adicional de Periculosidade",
    adicionalNoturno: "Adicional Noturno",
    horasExtras50: "Horas Extras 50%",
    horasExtras100: "Horas Extras 100%",
    dsrHorasExtras: "DSR sobre Horas Extras",
    adicionalFuncao: "Adicional de Funcao",
    salarioFamilia: "Salario Familia",
    outrosProventos: "Outros Proventos",
  },
  descontos: {
    inss: "INSS (Empregado)",
    irrf: "IRRF",
    valeTransporte: "Vale Transporte (6%)",
    valeRefeicao: "Vale Refeicao (Desc.)",
    planoSaude: "Plano de Saude (Copart.)",
    planoOdontologico: "Plano Odontologico (Desc.)",
    pensaoAlimenticia: "Pensao Alimenticia",
    adiantamento: "Adiantamento/Vale",
    faltasAtrasos: "Faltas e Atrasos",
    outrosDescontos: "Outros Descontos",
  },
  encargos: {
    inssPatronal: "INSS Patronal (20%)",
    ratFap: "RAT / FAP",
    sistemaS: "Sistema S",
    fgts: "FGTS (8%)",
    fgts13: "FGTS 13o",
    fgtsFerias: "FGTS Ferias",
    provisao13: "Provisao 13o Salario",
    provisaoFerias: "Provisao Ferias",
    provisao13Ferias: "Provisao 1/3 Ferias",
    multaFGTS: "Multa FGTS (Prov. Rescisoria)",
  },
  beneficios: {
    valeTransporte: "Vale Transporte (Empresa)",
    valeRefeicao: "Vale Refeicao (Empresa)",
    valeAlimentacao: "Vale Alimentacao (Empresa)",
    planoSaude: "Plano de Saude (Empresa)",
    planoOdontologico: "Plano Odontologico (Empresa)",
    seguroVida: "Seguro de Vida",
    cestaBasica: "Cesta Basica",
    auxilioCreche: "Auxilio Creche",
    outrosBeneficios: "Outros Beneficios",
  },
  totais: {
    proventos: "Total Proventos",
    descontos: "Total Descontos",
    encargos: "Total Encargos",
    beneficios: "Total Beneficios",
    liquido: "Liquido Funcionario",
    custoTotal: "Custo Total Empresa",
  }
};

// Generate monthly evolution data
export function gerarEvolucaoMensal(colaboradores) {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const rng = seededRandom(99);
  return meses.map((mes, i) => {
    const fator = 1 + (rng() - 0.5) * 0.03;
    const totalAtual = colaboradores.reduce((s, c) => s + c.totais.custoTotal.atual, 0) * fator;
    const totalContrato = colaboradores.reduce((s, c) => s + c.totais.custoTotal.contrato, 0) * fator;
    const totalCCT = colaboradores.reduce((s, c) => s + c.totais.custoTotal.cct, 0) * fator;
    const risco = totalCCT - totalAtual;
    return { mes, mesIndex: i, atual: totalAtual, contrato: totalContrato, cct: totalCCT, risco };
  });
}

export function calcSeveridade(atual, cct) {
  if (atual === 0 && cct === 0) return 'CONFORME';
  const diff = Math.abs(cct - atual);
  const pct = cct !== 0 ? (diff / cct) * 100 : (atual !== 0 ? 100 : 0);
  if (pct === 0) return 'CONFORME';
  if (pct < 1) return 'INFO';
  if (pct < 5) return 'ALERTA';
  return 'CRITICA';
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatPercent(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
}

export function aggregateByRubrica(colaboradores, categoria) {
  const keys = Object.keys(colaboradores[0][categoria]);
  const result = {};
  for (const key of keys) {
    result[key] = {
      atual: colaboradores.reduce((s, c) => s + c[categoria][key].atual, 0),
      contrato: colaboradores.reduce((s, c) => s + c[categoria][key].contrato, 0),
      cct: colaboradores.reduce((s, c) => s + c[categoria][key].cct, 0),
    };
  }
  return result;
}

export function aggregateTotais(colaboradores) {
  const keys = Object.keys(colaboradores[0].totais);
  const result = {};
  for (const key of keys) {
    result[key] = {
      atual: colaboradores.reduce((s, c) => s + c.totais[key].atual, 0),
      contrato: colaboradores.reduce((s, c) => s + c.totais[key].contrato, 0),
      cct: colaboradores.reduce((s, c) => s + c.totais[key].cct, 0),
    };
  }
  return result;
}
