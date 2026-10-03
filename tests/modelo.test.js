import test from "node:test";
import assert from "node:assert/strict";
import {
  estadoVazio,
  novaMeta,
  normalizarEstado,
  validarEstudo,
  validarMetaEtapa,
  sugerir,
  ocupados,
  dataValida,
} from "../src/utils/modelo.js";
function base() {
  const p = estadoVazio();
  p.metas = [{ ...novaMeta(), descricao: "Excel", horizonte: "curto" }];
  const a = p.rotina.agenda;
  a.empresa = {
    ...a.empresa,
    inicio: "08:00",
    fim: "14:00",
    ida: "30",
    volta: "60",
    dias: a.empresa.dias.map((d, i) => ({ ...d, ativo: i < 4 })),
  };
  a.formacao = {
    ...a.formacao,
    inicio: "08:00",
    fim: "14:00",
    ida: "30",
    volta: "60",
    dias: a.formacao.dias.map((d, i) => ({ ...d, ativo: i === 4 })),
  };
  a.estudaAtualmente = "nao";
  a.sonoInicio = "23:00";
  a.sonoFim = "07:00";
  return p;
}
test("migra meta, SMART e estudos antigos sem perder referência", () => {
  const p = normalizarEstado({
    meta: { descricao: "Inglês", horizonte: "medio", sugestaoId: "ingles" },
    smart: {
      S: "Falar",
      M: "Gravar",
      A: "Praticar",
      R: "Trabalho",
      T: "4 semanas",
    },
    rotina: {
      trabalho: "texto preservado",
      estudos: [{ dia: "Segunda", ativo: true, inicio: "16:00", fim: "16:30" }],
    },
  });
  assert.equal(p.metas.length, 1);
  assert.equal(p.metas[0].smart.M, "Gravar");
  assert.equal(p.metas[0].sugestaoId, "ingles");
  assert.equal(p.rotina.estudos[0].metaId, p.metas[0].id);
  assert.equal(p.rotina.agenda.notasAnteriores.trabalho, "texto preservado");
});
test("JSON v2 conserva múltiplas metas e seus vínculos", () => {
  const p = base();
  p.metas.push({ ...novaMeta(), descricao: "Leitura", horizonte: "longo" });
  p.rotina.estudos.push({
    id: "s",
    dia: "Segunda",
    inicio: "16:00",
    fim: "16:30",
    metaId: p.metas[1].id,
    atividade: "Ler",
  });
  const q = normalizarEstado(JSON.parse(JSON.stringify(p)));
  assert.equal(q.metas.length, 2);
  assert.equal(q.rotina.estudos[0].metaId, p.metas[1].id);
});
test("bloqueia estudo durante deslocamento, libera no limite", () => {
  const p = base();
  const e = {
    id: "x",
    dia: "Segunda",
    inicio: "14:30",
    fim: "15:30",
    metaId: p.metas[0].id,
  };
  assert.match(validarEstudo(e, p.rotina, p.metas).join(" "), /Volta/);
  assert.equal(
    validarEstudo({ ...e, inicio: "15:00" }, p.rotina, p.metas).length,
    0,
  );
});
test("estudos de metas diferentes não podem sobrepor", () => {
  const p = base();
  p.rotina.estudos = [
    {
      id: "1",
      dia: "Segunda",
      inicio: "16:00",
      fim: "17:00",
      metaId: p.metas[0].id,
    },
  ];
  assert.match(
    validarEstudo(
      {
        id: "2",
        dia: "Segunda",
        inicio: "16:30",
        fim: "17:30",
        metaId: p.metas[0].id,
      },
      p.rotina,
      p.metas,
    ).join(" "),
    /Outro período/,
  );
});
test("sono atravessa domingo e segunda", () => {
  const p = base();
  const sono = ocupados(p.rotina).filter((x) => x.tipo === "sono");
  assert(sono.some((x) => x.inicio === 0 && x.fim === 420));
  assert(
    validarEstudo(
      {
        id: "x",
        dia: "Segunda",
        inicio: "00:30",
        fim: "01:00",
        metaId: p.metas[0].id,
      },
      p.rotina,
      p.metas,
    ).some((x) => x.includes("Sono")),
  );
});
test("sugestões respeitam compromissos, estudos, margem e refeições", () => {
  const p = base();
  p.rotina.estudos = [
    {
      id: "1",
      dia: "Segunda",
      inicio: "16:00",
      fim: "17:00",
      metaId: p.metas[0].id,
    },
  ];
  const r = sugerir(p.rotina, {
    duracao: 30,
    quantidade: 3,
    periodo: "tarde",
    margem: 30,
    refeicoes: true,
  });
  assert.equal(r.sugestoes.length, 3);
  for (const e of r.sugestoes)
    assert.equal(
      validarEstudo(
        { ...e, id: "new", metaId: p.metas[0].id },
        p.rotina,
        p.metas,
      ).length,
      0,
    );
});
test("temporal exige prazo das etapas dentro da data-alvo", () => {
  const m = {
    ...novaMeta(),
    dataAlvo: "2026-12-01",
    smart: { T: "Concluir" },
    etapas: [{ id: "x", titulo: "Primeira entrega", prazo: "2026-12-02" }],
  };
  assert(validarMetaEtapa(m, 5).some((e) => e.includes("ultrapassar")));
});
test("rejeita backup estranho e datas impossíveis", () => {
  assert.throws(() => normalizarEstado({ foo: "bar" }));
  assert.equal(dataValida("2026-02-30"), false);
  assert.equal(dataValida("2026-02-28"), true);
});
