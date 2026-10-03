export const DIAS = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];
export const HORIZONTES = {
  curto: "Curto prazo",
  medio: "Médio prazo",
  longo: "Longo prazo",
};
export const SMART = [
  {
    letra: "S",
    titulo: "Específica",
    pergunta: "O que exatamente você pretende aprender ou realizar?",
    ajuda: "Escolha um resultado concreto.",
  },
  {
    letra: "M",
    titulo: "Mensurável",
    pergunta: "Como você vai acompanhar e comprovar seu progresso?",
    ajuda: "Pense em uma quantidade, entrega ou demonstração.",
  },
  {
    letra: "A",
    titulo: "Atingível",
    pergunta: "Como realizar essa meta com seu tempo e seus recursos?",
    ajuda: "Considere materiais, apoio e dificuldades.",
  },
  {
    letra: "R",
    titulo: "Relevante",
    pergunta: "Por que essa meta é importante para você?",
    ajuda: "Relacione a meta com sua vida.",
  },
  {
    letra: "T",
    titulo: "Temporal",
    pergunta: "Qual é o prazo e quais serão as etapas até a conclusão?",
    ajuda: "Defina um prazo e pequenas entregas.",
  },
];
export const uid = () => globalThis.crypto.randomUUID();
const str = (x) => (typeof x === "string" ? x : "");
export function compromisso(nome = "") {
  return {
    nome,
    uniforme: true,
    inicio: "",
    fim: "",
    remoto: false,
    ida: "",
    volta: "",
    dias: DIAS.map((dia) => ({ dia, ativo: false, inicio: "", fim: "" })),
  };
}
export function agendaVazia() {
  return {
    empresa: compromisso(),
    formacao: compromisso(),
    escola: compromisso(),
    estudaAtualmente: "",
    sonoInicio: "",
    sonoFim: "",
    outros: [],
    notasAnteriores: {},
  };
}
export function estadoVazio() {
  return {
    schemaVersion: 2,
    rotina: { agenda: agendaVazia(), estudos: [] },
    metas: [],
  };
}
export function novaMeta() {
  return {
    id: uid(),
    descricao: "",
    horizonte: "",
    sugestaoId: "",
    dataAlvo: "",
    smart: { S: "", M: "", A: "", R: "", T: "" },
    etapas: [],
  };
}
export function normalizarAgenda(a, anterior = {}) {
  const base = agendaVazia();
  const normalizar = (c) => ({
    ...compromisso(),
    nome: str(c?.nome),
    uniforme: c?.uniforme !== false,
    inicio: str(c?.inicio),
    fim: str(c?.fim),
    remoto: c?.remoto === true,
    ida: str(c?.ida ?? a?.ida),
    volta: str(c?.volta ?? a?.volta),
    dias: DIAS.map((dia) => {
      const d = Array.isArray(c?.dias)
        ? c.dias.find((x) => x?.dia === dia)
        : null;
      return {
        dia,
        ativo: d?.ativo === true,
        inicio: str(d?.inicio),
        fim: str(d?.fim),
      };
    }),
  });
  const notas = {};
  for (const k of [
    "trabalho",
    "escola",
    "deslocamento",
    "descanso",
    "outros",
  ]) {
    const v = str(a?.notasAnteriores?.[k] ?? (!a ? anterior[k] : ""));
    if (v.trim()) notas[k] = v;
  }
  return {
    ...base,
    empresa: normalizar(a?.empresa),
    formacao: normalizar(a?.formacao),
    escola: normalizar(a?.escola),
    estudaAtualmente: ["sim", "nao"].includes(a?.estudaAtualmente)
      ? a.estudaAtualmente
      : "",
    sonoInicio: str(a?.sonoInicio),
    sonoFim: str(a?.sonoFim),
    outros: Array.isArray(a?.outros)
      ? a.outros.filter((x) => x && typeof x === "object").map(normalizar)
      : [],
    notasAnteriores: notas,
  };
}
function normalizarMeta(m) {
  return {
    ...novaMeta(),
    id: str(m?.id) || uid(),
    descricao: str(m?.descricao),
    horizonte: Object.hasOwn(HORIZONTES, m?.horizonte) ? m.horizonte : "",
    sugestaoId: str(m?.sugestaoId),
    dataAlvo: str(m?.dataAlvo),
    smart: Object.fromEntries(
      SMART.map(({ letra }) => [letra, str(m?.smart?.[letra])]),
    ),
    etapas: Array.isArray(m?.etapas)
      ? m.etapas
          .filter((x) => x && typeof x === "object")
          .map((e) => ({
            id: str(e.id) || uid(),
            titulo: str(e.titulo),
            prazo: str(e.prazo),
            concluida: e.concluida === true,
          }))
      : [],
  };
}
export function normalizarEstado(raw) {
  if (!raw || typeof raw !== "object" || !raw.rotina)
    throw Error("O arquivo não contém um plano reconhecido.");
  const state = estadoVazio();
  state.rotina.agenda = normalizarAgenda(raw.rotina.agenda, raw.rotina);
  if (raw.schemaVersion === 2) {
    if (!Array.isArray(raw.metas) || !Array.isArray(raw.rotina.estudos))
      throw Error("Estrutura do plano inválida.");
    state.metas = raw.metas.map(normalizarMeta);
  } else if (raw.meta && raw.smart) {
    if (
      str(raw.meta.descricao).trim() ||
      Object.values(raw.smart).some((x) => str(x).trim())
    )
      state.metas = [normalizarMeta({ ...raw.meta, smart: raw.smart })];
  } else throw Error("Versão do plano não reconhecida.");
  const ids = new Set();
  state.metas = state.metas.map((m) => {
    if (ids.has(m.id)) m = { ...m, id: uid() };
    ids.add(m.id);
    return m;
  });
  state.rotina.estudos = (
    Array.isArray(raw.rotina.estudos) ? raw.rotina.estudos : []
  )
    .filter(
      (e) =>
        e &&
        DIAS.includes(e.dia) &&
        (raw.schemaVersion === 2 || e.ativo === true),
    )
    .map((e) => ({
      id: uid(),
      dia: e.dia,
      inicio: str(e.inicio),
      fim: str(e.fim),
      atividade: str(e.atividade),
      metaId:
        raw.schemaVersion === 2
          ? ids.has(e.metaId)
            ? e.metaId
            : ""
          : (state.metas[0]?.id ?? ""),
    }));
  return state;
}
export function minutos(h) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(h)) return null;
  const [a, b] = h.split(":").map(Number);
  return a * 60 + b;
}
export function horario(m) {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}
export function duracao(e) {
  const a = minutos(e.inicio),
    b = minutos(e.fim);
  return a !== null && b !== null && b > a ? b - a : 0;
}
export function formatarDuracao(m) {
  return `${Math.floor(m / 60) ? Math.floor(m / 60) + " h " : ""}${m % 60 || !m ? (m % 60) + " min" : ""}`.trim();
}
export function horarios(c) {
  return c.dias
    .filter((d) => d.ativo)
    .map((d) => ({
      ...d,
      inicio: c.uniforme ? c.inicio : d.inicio,
      fim: c.uniforme ? c.fim : d.fim,
    }));
}
export function listaCompromissos(a) {
  return [
    { nome: "Empresa", c: a.empresa },
    { nome: "Formação", c: a.formacao },
    ...(a.estudaAtualmente === "sim"
      ? [{ nome: "Escola / faculdade", c: a.escola }]
      : []),
    ...a.outros.map((c) => ({ nome: c.nome.trim() || "Outro compromisso", c })),
  ];
}
const semana = 10080;
function adicionar(lista, a, b, nome, tipo = "compromisso") {
  if (b <= a) return;
  const inicio = ((a % semana) + semana) % semana,
    fim = inicio + b - a;
  if (fim <= semana) lista.push({ inicio, fim, nome, tipo });
  else {
    lista.push({ inicio, fim: semana, nome, tipo });
    lista.push({ inicio: 0, fim: fim - semana, nome, tipo });
  }
}
export function ocupados(rotina, incluirEstudos = true) {
  const a = rotina.agenda,
    lista = [];
  for (const { nome, c } of listaCompromissos(a)) {
    for (const d of horarios(c)) {
      const inicio = minutos(d.inicio),
        fim = minutos(d.fim);
      if (inicio === null || fim === null || fim <= inicio) continue;
      const base = DIAS.indexOf(d.dia) * 1440;
      adicionar(lista, base + inicio, base + fim, nome);
      if (!c.remoto) {
        const ida = /^\d+$/.test(c.ida) ? Number(c.ida) : 0,
          volta = /^\d+$/.test(c.volta) ? Number(c.volta) : 0;
        adicionar(
          lista,
          base + inicio - ida,
          base + inicio,
          `Ida: ${nome}`,
          "deslocamento",
        );
        adicionar(
          lista,
          base + fim,
          base + fim + volta,
          `Volta: ${nome}`,
          "deslocamento",
        );
      }
    }
  }
  const dormir = minutos(a.sonoInicio),
    acordar = minutos(a.sonoFim);
  if (dormir !== null && acordar !== null && dormir !== acordar)
    DIAS.forEach((_, i) =>
      adicionar(
        lista,
        i * 1440 + dormir,
        i * 1440 + acordar + (acordar < dormir ? 1440 : 0),
        "Sono",
        "sono",
      ),
    );
  if (incluirEstudos)
    for (const e of rotina.estudos) {
      if (duracao(e))
        adicionar(
          lista,
          DIAS.indexOf(e.dia) * 1440 + minutos(e.inicio),
          DIAS.indexOf(e.dia) * 1440 + minutos(e.fim),
          "Outro período de estudo",
          "estudo",
        );
    }
  return lista;
}
export function validarAgenda(a) {
  const erros = [];
  for (const { nome, c } of listaCompromissos(a)) {
    if (nome === "Outro compromisso" && !c.nome.trim())
      erros.push("Dê um nome ao outro compromisso.");
    const hs = horarios(c);
    if (!hs.length) erros.push(`${nome}: selecione pelo menos um dia.`);
    for (const d of hs)
      if (!duracao(d))
        erros.push(
          `${nome}, ${d.dia}: informe início e fim válidos no mesmo dia.`,
        );
    if (!c.remoto)
      for (const campo of ["ida", "volta"])
        if (!/^\d+$/.test(c[campo]) || Number(c[campo]) > 1440)
          erros.push(`${nome}: informe minutos de ${campo} (0 se não houver).`);
  }
  if (!["sim", "nao"].includes(a.estudaAtualmente))
    erros.push("Informe se estuda atualmente.");
  const ini = minutos(a.sonoInicio),
    fim = minutos(a.sonoFim);
  if (ini === null || fim === null || ini === fim)
    erros.push("Informe horários diferentes para dormir e acordar.");
  return [...new Set(erros)];
}
export function validarEstudo(e, rotina, metas) {
  const erros = [];
  if (!DIAS.includes(e.dia) || !duracao(e))
    erros.push("Escolha um dia e horários válidos no mesmo dia.");
  if (!metas.some((m) => m.id === e.metaId))
    erros.push("Vincule o período a uma meta.");
  if (duracao(e)) {
    const base = DIAS.indexOf(e.dia) * 1440,
      a = base + minutos(e.inicio),
      b = base + minutos(e.fim);
    const blocks = ocupados({
      ...rotina,
      estudos: rotina.estudos.filter((x) => x.id !== e.id),
    });
    const conflito = [
      ...new Set(
        blocks.filter((x) => a < x.fim && b > x.inicio).map((x) => x.nome),
      ),
    ];
    if (conflito.length)
      erros.push(`Horário coincide com: ${conflito.join(", ")}.`);
  }
  return erros;
}
export function validarRotina(rotina, metas) {
  return [
    ...validarAgenda(rotina.agenda),
    ...rotina.estudos.flatMap((e) =>
      validarEstudo(e, rotina, metas).map((msg) => `${e.dia}: ${msg}`),
    ),
  ];
}
export function validarMetaEtapa(m, etapa) {
  if (etapa === 0) {
    return [
      !m.descricao.trim() ? "Escreva sua meta." : "",
      !Object.hasOwn(HORIZONTES, m.horizonte) ? "Escolha um horizonte." : "",
    ].filter(Boolean);
  }
  const letra = SMART[etapa - 1].letra;
  const erros = [];
  if (!m.smart[letra].trim())
    erros.push(`Preencha ${letra} — ${SMART[etapa - 1].titulo}.`);
  if (letra === "T") {
    if (!dataValida(m.dataAlvo)) erros.push("Defina a data-alvo da meta.");
    for (const e of m.etapas) {
      if (!e.titulo.trim() || !dataValida(e.prazo))
        erros.push("Cada pequena etapa precisa de nome e prazo.");
      else if (dataValida(m.dataAlvo) && e.prazo > m.dataAlvo)
        erros.push(
          "O prazo da pequena etapa não pode ultrapassar a data-alvo.",
        );
    }
  }
  return [...new Set(erros)];
}
export function dataValida(d) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const date = new Date(d + "T12:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === d;
}
export function metaCompleta(m) {
  return Array.from({ length: 6 }, (_, i) => validarMetaEtapa(m, i)).every(
    (e) => !e.length,
  );
}
export function sugerir(rotina, p, rodada = 0) {
  const erros = validarAgenda(rotina.agenda);
  if (erros.length)
    return {
      sugestoes: [],
      mensagem: "Complete a rotina antes de buscar horários.",
      erros,
    };
  const faixas = {
    qualquer: [480, 1320],
    manha: [480, 720],
    tarde: [780, 1080],
    noite: [1080, 1320],
  };
  const [de, ate] = faixas[p.periodo] ?? faixas.qualquer;
  const blocks = ocupados(rotina),
    dur = Number(p.duracao),
    margem = Number(p.margem);
  if (
    ![15, 30, 45, 60].includes(dur) ||
    !Number.isInteger(Number(p.quantidade)) ||
    p.quantidade < 1 ||
    p.quantidade > 7 ||
    ![0, 15, 30, 45, 60].includes(margem)
  )
    return { sugestoes: [], mensagem: "Preferências inválidas.", erros: [] };
  const dias = DIAS.map((dia, index) => {
    const opts = [];
    for (let t = de; t + dur <= ate; t += 15) {
      const a = index * 1440 + t,
        b = a + dur;
      const conflito = blocks.some((x) =>
        [-semana, 0, semana].some(
          (s) => a < x.fim + s + margem && b > x.inicio + s - margem,
        ),
      );
      const refeicao =
        p.refeicoes &&
        [
          [720, 780],
          [1140, 1200],
        ].some(([ini, fim]) => t < fim && t + dur > ini);
      if (!conflito && !refeicao)
        opts.push({ dia, inicio: horario(t), fim: horario(t + dur) });
    }
    return { dia, index, opts };
  }).filter((d) => d.opts.length);
  if (!dias.length)
    return {
      sugestoes: [],
      mensagem:
        "Não há horários com essas preferências. Experimente sessões menores ou outro período.",
      erros: [],
    };
  const freq = new Map();
  for (const d of dias)
    for (const o of d.opts) freq.set(o.inicio, (freq.get(o.inicio) || 0) + 1);
  const horas = [...freq].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
  const hora = horas[rodada % horas.length][0];
  const comum = dias.filter((d) => d.opts.some((o) => o.inicio === hora));
  const n = Math.min(Number(p.quantidade), dias.length);
  const pool = comum.length >= n ? comum : dias;
  const sugestoes = Array.from({ length: n }, (_, i) => {
    const d = pool[Math.floor((i * pool.length) / n)];
    return (
      d.opts.find((o) => o.inicio === hora) ?? d.opts[rodada % d.opts.length]
    );
  });
  return {
    sugestoes,
    mensagem:
      n < Number(p.quantidade)
        ? `Encontrei ${n} períodos dos ${p.quantidade} pedidos.`
        : "Confira se esses períodos também cabem na sua realidade.",
    erros: [],
  };
}
