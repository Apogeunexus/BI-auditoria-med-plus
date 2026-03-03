import { supabase } from '../lib/supabase';

const TABLE = 'folha_de_pagamento_ia_duplicate';

// ===== FETCH =====
export async function fetchFolhaData(periodo) {
  let query = supabase
    .from(TABLE)
    .select('id, nome, cpf, matricula, funcao, centro_custo, sindicato, competencia, periodo, folha_cct_contrato, folha_atual, auditoria');

  if (periodo) {
    query = query.eq('periodo', periodo);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchPeriodosDisponiveis() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('periodo')
    .order('periodo', { ascending: false });
  if (error) throw error;
  const unique = [...new Set(data.map(r => r.periodo).filter(Boolean))];
  return unique;
}

export async function fetchFuncoesDisponiveis() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('funcao');
  if (error) throw error;
  const unique = [...new Set(data.map(r => r.funcao).filter(Boolean))].sort();
  return unique;
}

// ===== TRANSFORM =====

// Build items for a category from auditoria.discrepancias.por_grupo
// Uses pre-matched item names (item_cct + item_atual) to avoid name mismatch issues
function buildCategoryFromAuditoria(items, contratoLookup) {
  const result = {};
  if (!items) return result;
  for (const item of items) {
    // Use item_cct as key, fallback to item_atual for extras not in CCT
    let key = item.item_cct && item.item_cct !== '—' ? item.item_cct : item.item_atual;
    if (!key || key === '—') continue;

    const valorAtual = typeof item.valor_atual === 'number' ? item.valor_atual : 0;
    const valorCCT = typeof item.valor_cct === 'number' ? item.valor_cct : 0;
    // Contrato: from CCT vs Contrato discrepancies, otherwise same as CCT
    const valorContrato = contratoLookup[key] !== undefined ? contratoLookup[key] : valorCCT;

    // Accumulate values for duplicate keys (e.g. multiple vacation sub-items)
    result[key] = {
      atual: (result[key]?.atual || 0) + valorAtual,
      contrato: (result[key]?.contrato || 0) + valorContrato,
      cct: (result[key]?.cct || 0) + valorCCT,
    };
  }
  return result;
}

// Normalize a single row into the dashboard format
function transformRow(row) {
  const auditoria = row.auditoria || {};
  const porGrupo = auditoria.discrepancias?.por_grupo || {};
  const discCCTContrato = row.folha_cct_contrato?.discrepancias?.itens || [];

  // Build contrato lookup from CCT vs Contrato discrepancies
  const contratoLookup = {};
  for (const d of discCCTContrato) {
    if (d.item && d.valor_contrato !== undefined) {
      contratoLookup[d.item] = d.valor_contrato;
      // Also strip "Custo Empresa: " prefix for custos_empresa items
      if (d.item.startsWith('Custo Empresa: ')) {
        contratoLookup[d.item.replace('Custo Empresa: ', '')] = d.valor_contrato;
      }
    }
  }

  // Build items per category using auditoria matched data
  const proventos = buildCategoryFromAuditoria(porGrupo.proventos, contratoLookup);
  const descontos = buildCategoryFromAuditoria(porGrupo.descontos, contratoLookup);
  const encargos = buildCategoryFromAuditoria(porGrupo.encargos, contratoLookup);
  const beneficios = buildCategoryFromAuditoria(porGrupo.beneficios, contratoLookup);
  const custosEmpresa = buildCategoryFromAuditoria(porGrupo.custos_empresa, contratoLookup);

  // Totals from pre-calculated values
  const cct = row.folha_cct_contrato?.folha_cct || {};
  const atual = row.folha_atual?.folha_atual || {};
  const cctTotais = cct.totais || {};
  const atualTotais = atual.totais || {};

  // Calculate contrato totals from individual items
  const sumContrato = (items) => Object.values(items).reduce((s, v) => s + (v.contrato || 0), 0);

  const totalProventosContrato = sumContrato(proventos);
  const totalDescontosContrato = sumContrato(descontos);
  const totalEncargosContrato = sumContrato(encargos);
  const totalBeneficiosContrato = sumContrato(beneficios);
  const totalCustosEmpresaContrato = sumContrato(custosEmpresa);

  const totais = {
    proventos: {
      atual: atualTotais.total_proventos || 0,
      contrato: totalProventosContrato,
      cct: cctTotais.total_proventos || 0,
    },
    descontos: {
      atual: atualTotais.total_descontos || 0,
      contrato: totalDescontosContrato,
      cct: cctTotais.total_descontos || 0,
    },
    encargos: {
      atual: atualTotais.total_encargos || 0,
      contrato: totalEncargosContrato,
      cct: cctTotais.total_encargos || 0,
    },
    beneficios: {
      atual: atualTotais.total_beneficios || 0,
      contrato: totalBeneficiosContrato,
      cct: cctTotais.total_beneficios || 0,
    },
    custosEmpresa: {
      atual: atualTotais.total_custos_empresa || 0,
      contrato: totalCustosEmpresaContrato,
      cct: cctTotais.total_custos_empresa || 0,
    },
    liquido: {
      atual: atualTotais.liquido || 0,
      contrato: totalProventosContrato - totalDescontosContrato,
      cct: cctTotais.liquido || 0,
    },
    custoTotal: {
      atual: atualTotais.custo_total_empresa || 0,
      contrato: totalProventosContrato + totalEncargosContrato + totalCustosEmpresaContrato,
      cct: cctTotais.custo_total_empresa || 0,
    },
  };

  // Discrepancies from auditoria
  const discrepancias = auditoria.discrepancias?.todos || [];
  const resumoAuditoria = auditoria.resumo || {};

  // Employee info
  const funcCCT = row.folha_cct_contrato?.funcionario || {};
  const funcAtual = row.folha_atual?.funcionario || {};

  return {
    id: row.id,
    nome: row.nome,
    cpf: row.cpf,
    matricula: row.matricula || funcAtual.matricula || '',
    funcao: row.funcao,
    centrosCusto: row.centro_custo,
    sindicato: row.sindicato,
    competencia: row.competencia || row.periodo,
    turno: funcCCT.turno || '',
    escala: funcCCT.escala_contrato || funcCCT.escala_funcionario || '',
    cargaHoraria: funcCCT.carga_horaria || funcAtual.carga_horaria || 0,
    dtAdmissao: funcAtual.dt_admissao || '',
    proventos,
    descontos,
    encargos,
    beneficios,
    custosEmpresa,
    totais,
    discrepancias,
    resumoAuditoria,
    conformidade: resumoAuditoria.conformidade_pct || resumoAuditoria.conformidade || '0%',
    impactoAnual: resumoAuditoria.impacto_anual || 0,
    statusGeral: resumoAuditoria.status_geral || '',
  };
}

// ===== MAIN EXPORT =====
export async function carregarDados(periodo) {
  const rows = await fetchFolhaData(periodo);
  const colaboradores = rows.map(transformRow);
  return colaboradores;
}

// ===== UTILITY FUNCTIONS =====

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
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

// Aggregate a category across all colaboradores
// Returns: { "Salario Base": {atual, contrato, cct}, "Periculosidade": {atual, contrato, cct}, ... }
export function aggregateByCategoria(colaboradores, categoria) {
  const result = {};
  for (const c of colaboradores) {
    const items = c[categoria] || {};
    for (const [key, val] of Object.entries(items)) {
      if (!result[key]) result[key] = { atual: 0, contrato: 0, cct: 0 };
      result[key].atual += val.atual || 0;
      result[key].contrato += val.contrato || 0;
      result[key].cct += val.cct || 0;
    }
  }
  return result;
}

// Aggregate totals across all colaboradores
export function aggregateTotais(colaboradores) {
  const result = {};
  const keys = ['proventos', 'descontos', 'encargos', 'beneficios', 'custosEmpresa', 'liquido', 'custoTotal'];
  for (const key of keys) {
    result[key] = { atual: 0, contrato: 0, cct: 0 };
    for (const c of colaboradores) {
      if (c.totais[key]) {
        result[key].atual += c.totais[key].atual || 0;
        result[key].contrato += c.totais[key].contrato || 0;
        result[key].cct += c.totais[key].cct || 0;
      }
    }
  }
  return result;
}
