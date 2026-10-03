import {
  DIAS,
  intervalosOcupados,
  validarAgenda,
} from './rotina';

const PERIODOS = {
  qualquer: [8 * 60, 22 * 60],
  manha: [8 * 60, 12 * 60],
  tarde: [13 * 60, 18 * 60],
  noite: [18 * 60, 22 * 60],
};

function paraMinutos(horario) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(horario)) {
    return null;
  }

  const [hora, minuto] = horario.split(':').map(Number);
  return hora * 60 + minuto;
}

function paraHorario(minutos) {
  const hora = Math.floor(minutos / 60);
  const minuto = minutos % 60;

  return (
    String(hora).padStart(2, '0') +
    ':' +
    String(minuto).padStart(2, '0')
  );
}

function horarioLivre(
  inicio,
  fim,
  ocupados,
  margem,
  protegerRefeicoes,
) {
  const semana = 7 * 1440;

  for (const compromisso of ocupados) {
    // Considera também compromissos na virada da semana.
    for (const deslocamento of [-semana, 0, semana]) {
      const inicioProtegido =
        compromisso.inicio + deslocamento - margem;

      const fimProtegido =
        compromisso.fim + deslocamento + margem;

      if (inicio < fimProtegido && fim > inicioProtegido) {
        return false;
      }
    }
  }

  if (protegerRefeicoes) {
    const baseDia = Math.floor(inicio / 1440) * 1440;

    const refeicoes = [
      [12 * 60, 13 * 60],
      [19 * 60, 20 * 60],
    ];

    for (const [comeco, termino] of refeicoes) {
      if (
        inicio < baseDia + termino &&
        fim > baseDia + comeco
      ) {
        return false;
      }
    }
  }

  return true;
}

function listarCandidatos(rotina, preferencias) {
  const ocupados = intervalosOcupados(rotina.agenda);

  const [inicioPeriodo, fimPeriodo] =
    PERIODOS[preferencias.periodo] ?? PERIODOS.qualquer;

  const duracao = Number(preferencias.duracao);
  const margem = Number(preferencias.margem);

  return DIAS.map((dia, indice) => {
    const estudoExistente = rotina.estudos.find(
      (item) => item.dia === dia && item.ativo,
    );

    // O modelo atual permite um período de estudo por dia.
    if (estudoExistente) {
      return { dia, indice, opcoes: [] };
    }

    const opcoes = [];
    const baseDia = indice * 1440;

    for (
      let inicio = inicioPeriodo;
      inicio + duracao <= fimPeriodo;
      inicio += 15
    ) {
      const fim = inicio + duracao;

      if (
        horarioLivre(
          baseDia + inicio,
          baseDia + fim,
          ocupados,
          margem,
          preferencias.refeicoes,
        )
      ) {
        opcoes.push({
          dia,
          indice,
          inicio: paraHorario(inicio),
          fim: paraHorario(fim),
        });
      }
    }

    return { dia, indice, opcoes };
  }).filter((item) => item.opcoes.length > 0);
}

export function gerarSugestoes(
  rotina,
  preferencias,
  rodada = 0,
) {
  const erros = validarAgenda(rotina.agenda);

  if (erros.length > 0) {
    return {
      sugestoes: [],
      mensagem:
        'Complete os compromissos, deslocamento e sono antes de gerar sugestões.',
      erros,
    };
  }

  const existentes = rotina.estudos.filter((item) => item.ativo);

  const incompletos = existentes.some((item) => {
    const inicio = paraMinutos(item.inicio);
    const fim = paraMinutos(item.fim);

    return inicio === null || fim === null || fim <= inicio;
  });

  if (incompletos) {
    return {
      sugestoes: [],
      mensagem:
        'Complete ou desmarque os períodos de estudo já selecionados antes de gerar sugestões.',
      erros: [],
    };
  }

  const faltam = Math.max(
    0,
    Number(preferencias.frequencia) - existentes.length,
  );

  if (faltam === 0) {
    return {
      sugestoes: [],
      mensagem:
        'Você já reservou a quantidade de dias escolhida. Seus horários foram mantidos.',
      erros: [],
    };
  }

  const candidatos = listarCandidatos(rotina, preferencias);

  if (!candidatos.length) {
    return {
      sugestoes: [],
      mensagem:
        'Não encontrei um período com essas preferências. Tente uma sessão menor ou outro período do dia.',
      erros: [],
    };
  }

  // Favorece horários que se repetem em vários dias.
  const frequencias = new Map();

  for (const dia of candidatos) {
    for (const opcao of dia.opcoes) {
      frequencias.set(
        opcao.inicio,
        (frequencias.get(opcao.inicio) ?? 0) + 1,
      );
    }
  }

  const horarios = [...frequencias.entries()].sort(
    (a, b) =>
      b[1] - a[1] ||
      a[0].localeCompare(b[0]),
  );

  const horarioPreferido =
    horarios[rodada % horarios.length][0];

  const diasComHorarioComum = candidatos.filter(
    (dia) =>
      dia.opcoes.some(
        (opcao) => opcao.inicio === horarioPreferido,
      ),
  );

  const quantidade = Math.min(faltam, candidatos.length);

  const diasDisponiveis =
    diasComHorarioComum.length >= quantidade
      ? diasComHorarioComum
      : [
          ...diasComHorarioComum,
          ...candidatos.filter(
            (dia) =>
              !diasComHorarioComum.some(
                (comum) => comum.dia === dia.dia,
              ),
          ),
        ];

  const sugestoes = [];

  // Distribui as escolhas entre os dias disponíveis.
  for (let posicao = 0; posicao < quantidade; posicao++) {
    const indice = Math.floor(
      (posicao * diasDisponiveis.length) / quantidade,
    );

    const dia = diasDisponiveis[indice];

    const escolha =
      dia.opcoes.find(
        (opcao) => opcao.inicio === horarioPreferido,
      ) ??
      dia.opcoes[rodada % dia.opcoes.length];

    sugestoes.push(escolha);
  }

  sugestoes.sort((a, b) => a.indice - b.indice);

  return {
    sugestoes,
    erros: [],
    mensagem:
      quantidade < faltam
        ? `Encontrei ${quantidade} dos ${faltam} dias que faltavam. Você pode aceitar esses horários ou ajustar as preferências.`
        : 'Encontrei estes períodos livres. Confira se também fazem sentido para sua rotina real.',
  };
}

export function sugestaoDisponivel(
  rotina,
  preferencias,
  sugestao,
) {
  if (validarAgenda(rotina.agenda).length > 0) {
    return false;
  }

  return listarCandidatos(rotina, preferencias).some(
    (dia) =>
      dia.dia === sugestao.dia &&
      dia.opcoes.some(
        (opcao) =>
          opcao.inicio === sugestao.inicio &&
          opcao.fim === sugestao.fim,
      ),
  );
}