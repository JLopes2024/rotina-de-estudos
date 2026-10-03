export const DIAS = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
];

const TIPOS = [
  ['empresa', 'Empresa'],
  ['formacao', 'Formação de aprendizagem'],
  ['escola', 'Escola ou faculdade'],
];

function texto(valor) {
  return typeof valor === 'string' ? valor : '';
}

export function criarCompromisso(nome = '') {
  return {
    nome,
    uniforme: true,
    inicio: '',
    fim: '',
    dias: DIAS.map((dia) => ({
      dia,
      ativo: false,
      inicio: '',
      fim: '',
    })),
  };
}

export function criarAgenda() {
  return {
    empresa: criarCompromisso(),
    formacao: criarCompromisso(),
    escola: criarCompromisso(),
    estudaAtualmente: '',
    ida: '',
    volta: '',
    sonoInicio: '',
    sonoFim: '',
    outros: [],
    notasAnteriores: {},
  };
}

function normalizarCompromisso(valor) {
  const base = criarCompromisso();

  return {
    nome: texto(valor?.nome),
    uniforme: valor?.uniforme !== false,
    inicio: texto(valor?.inicio),
    fim: texto(valor?.fim),

    dias: base.dias.map((item) => {
      const salvo = Array.isArray(valor?.dias)
        ? valor.dias.find((dia) => dia?.dia === item.dia)
        : null;

      return {
        ...item,
        ativo: salvo?.ativo === true,
        inicio: texto(salvo?.inicio),
        fim: texto(salvo?.fim),
      };
    }),
  };
}

export function normalizarAgenda(valor, rotinaAnterior = {}) {
  const base = criarAgenda();

  if (!valor || typeof valor !== 'object') {
    // Guarda o preenchimento antigo para consulta durante a mudança.
    const notasAnteriores = {};

    for (const campo of [
      'trabalho',
      'escola',
      'deslocamento',
      'descanso',
      'outros',
    ]) {
      if (texto(rotinaAnterior[campo]).trim()) {
        notasAnteriores[campo] = rotinaAnterior[campo];
      }
    }

    return { ...base, notasAnteriores };
  }

  const notasAnteriores = {};

  for (const campo of [
    'trabalho',
    'escola',
    'deslocamento',
    'descanso',
    'outros',
  ]) {
    const nota = texto(valor.notasAnteriores?.[campo]);

    if (nota.trim()) {
      notasAnteriores[campo] = nota;
    }
  }

  return {
    empresa: normalizarCompromisso(valor.empresa),
    formacao: normalizarCompromisso(valor.formacao),
    escola: normalizarCompromisso(valor.escola),

    estudaAtualmente: ['sim', 'nao'].includes(valor.estudaAtualmente)
      ? valor.estudaAtualmente
      : '',

    ida: texto(valor.ida),
    volta: texto(valor.volta),
    sonoInicio: texto(valor.sonoInicio),
    sonoFim: texto(valor.sonoFim),

    outros: Array.isArray(valor.outros)
      ? valor.outros.map(normalizarCompromisso)
      : [],

    notasAnteriores,
  };
}

export function horariosSelecionados(compromisso) {
  return compromisso.dias
    .filter((item) => item.ativo)
    .map((item) => ({
      ...item,
      inicio: compromisso.uniforme
        ? compromisso.inicio
        : item.inicio,
      fim: compromisso.uniforme
        ? compromisso.fim
        : item.fim,
    }));
}

function minuto(horario) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(horario)) {
    return null;
  }

  const [hora, minutos] = horario.split(':').map(Number);
  return hora * 60 + minutos;
}

function validarCompromisso(compromisso, nome) {
  const dias = horariosSelecionados(compromisso);

  if (!dias.length) {
    return [`${nome}: selecione pelo menos um dia.`];
  }

  const erros = [];

  for (const dia of dias) {
    const inicio = minuto(dia.inicio);
    const fim = minuto(dia.fim);

    if (inicio === null || fim === null) {
      erros.push(`${nome}, ${dia.dia}: preencha início e fim.`);
    } else if (fim <= inicio) {
      erros.push(
        `${nome}, ${dia.dia}: o fim deve ser depois do início, no mesmo dia.`,
      );
    }
  }

  return erros;
}

function duracaoValida(valor) {
  return /^\d+$/.test(valor) && Number(valor) <= 1440;
}

export function validarAgenda(agenda) {
  if (!agenda) {
    return ['Atualize sua rotina usando os novos campos de dias e horários.'];
  }

  const erros = [
    ...validarCompromisso(agenda.empresa, 'Empresa'),
    ...validarCompromisso(agenda.formacao, 'Formação'),
  ];

  if (!['sim', 'nao'].includes(agenda.estudaAtualmente)) {
    erros.push('Informe se estuda em escola ou faculdade atualmente.');
  } else if (agenda.estudaAtualmente === 'sim') {
    erros.push(...validarCompromisso(agenda.escola, 'Escola ou faculdade'));
  }

  if (!duracaoValida(agenda.ida)) {
    erros.push('Informe o deslocamento de ida em minutos. Use 0 se não houver.');
  }

  if (!duracaoValida(agenda.volta)) {
    erros.push('Informe o deslocamento de volta em minutos. Use 0 se não houver.');
  }

  const dormir = minuto(agenda.sonoInicio);
  const acordar = minuto(agenda.sonoFim);

  if (dormir === null || acordar === null) {
    erros.push('Informe os horários habituais de dormir e acordar.');
  } else if (dormir === acordar) {
    erros.push('Os horários de dormir e acordar precisam ser diferentes.');
  }

  agenda.outros.forEach((item, indice) => {
    const nome = item.nome.trim();

    if (!nome) {
      erros.push(`Compromisso ${indice + 1}: informe um nome.`);
    }

    erros.push(
      ...validarCompromisso(item, nome || `Compromisso ${indice + 1}`),
    );
  });

  return erros;
}

// Divide intervalos que passam da virada da semana.
function adicionarIntervalo(lista, inicio, fim, nome) {
  const semana = 7 * 1440;

  if (fim <= inicio) return;

  const duracao = fim - inicio;
  const normalizado = ((inicio % semana) + semana) % semana;
  const final = normalizado + duracao;

  if (final <= semana) {
    lista.push({ inicio: normalizado, fim: final, nome });
  } else {
    lista.push({ inicio: normalizado, fim: semana, nome });
    lista.push({ inicio: 0, fim: final - semana, nome });
  }
}

export function intervalosOcupados(agenda) {
  const lista = [];
  const ida = duracaoValida(agenda.ida) ? Number(agenda.ida) : 0;
  const volta = duracaoValida(agenda.volta) ? Number(agenda.volta) : 0;

  const compromissos = TIPOS
    .filter(([tipo]) =>
      tipo !== 'escola' || agenda.estudaAtualmente === 'sim',
    )
    .map(([tipo, nome]) => ({
      compromisso: agenda[tipo],
      nome,
      deslocamento: true,
    }));

  agenda.outros.forEach((compromisso) => {
    compromissos.push({
      compromisso,
      nome: compromisso.nome.trim() || 'Outro compromisso',
      deslocamento: false,
    });
  });

  for (const item of compromissos) {
    for (const dia of horariosSelecionados(item.compromisso)) {
      const inicio = minuto(dia.inicio);
      const fim = minuto(dia.fim);

      if (inicio === null || fim === null || fim <= inicio) continue;

      const base = DIAS.indexOf(dia.dia) * 1440;

      adicionarIntervalo(
        lista,
        base + inicio,
        base + fim,
        item.nome,
      );

      if (item.deslocamento) {
        adicionarIntervalo(
          lista,
          base + inicio - ida,
          base + inicio,
          `deslocamento para ${item.nome}`,
        );

        adicionarIntervalo(
          lista,
          base + fim,
          base + fim + volta,
          `deslocamento após ${item.nome}`,
        );
      }
    }
  }

  const dormir = minuto(agenda.sonoInicio);
  const acordar = minuto(agenda.sonoFim);

  if (dormir !== null && acordar !== null && dormir !== acordar) {
    DIAS.forEach((_, indice) => {
      const base = indice * 1440;

      adicionarIntervalo(
        lista,
        base + dormir,
        base + acordar + (acordar < dormir ? 1440 : 0),
        'sono',
      );
    });
  }

  return lista;
}

export function conflitosEstudos(rotina) {
  if (!rotina.agenda) return [];

  const ocupados = intervalosOcupados(rotina.agenda);
  const erros = [];

  for (const estudo of rotina.estudos.filter((item) => item.ativo)) {
    const inicio = minuto(estudo.inicio);
    const fim = minuto(estudo.fim);

    if (inicio === null || fim === null || fim <= inicio) continue;

    const base = DIAS.indexOf(estudo.dia) * 1440;

    const conflitos = ocupados.filter(
      (item) =>
        base + inicio < item.fim &&
        base + fim > item.inicio,
    );

    const nomes = [...new Set(conflitos.map((item) => item.nome))];

    if (nomes.length) {
      erros.push(
        `${estudo.dia}: o estudo coincide com ${nomes.join(', ')}. Ajuste os horários.`,
      );
    }
  }

  return erros;
}

function descreverCompromisso(compromisso) {
  const dias = horariosSelecionados(compromisso);

  return dias.length
    ? dias
        .map(
          (dia) =>
            `${dia.dia}: ${dia.inicio || '—'} às ${dia.fim || '—'}`,
        )
        .join('\n')
    : 'Dias ainda não definidos.';
}

export function resumirAgenda(agenda) {
  return {
    trabalho:
      `Empresa\n${descreverCompromisso(agenda.empresa)}\n\n` +
      `Formação de aprendizagem\n${descreverCompromisso(agenda.formacao)}`,

    escola:
      agenda.estudaAtualmente === 'nao'
        ? 'Não estudo atualmente em escola ou faculdade.'
        : agenda.estudaAtualmente === 'sim'
          ? descreverCompromisso(agenda.escola)
          : 'Ainda não informado.',

    deslocamento:
      `Ida: ${agenda.ida || '—'} minutos.\n` +
      `Volta: ${agenda.volta || '—'} minutos.`,

    descanso:
      `Sono habitual: ${agenda.sonoInicio || '—'} às ${agenda.sonoFim || '—'}.`,

    outros: agenda.outros.length
      ? agenda.outros
          .map(
            (item) =>
              `${item.nome.trim() || 'Sem nome'}\n${descreverCompromisso(item)}`,
          )
          .join('\n\n')
      : 'Nenhum outro compromisso registrado.',
  };
}