import {
  validarAgenda,
  conflitosEstudos,
} from './rotina';

export const etapasSmart = [
  {
    letra: 'S',
    titulo: 'Específica',
    pergunta: 'O que exatamente você pretende aprender ou realizar?',
    exemplo:
      'Aprender a criar planilhas com fórmulas para organizar despesas.',
    ajuda: 'Evite uma resposta muito ampla, como “estudar mais”.',
  },
  {
    letra: 'M',
    titulo: 'Mensurável',
    pergunta: 'Como você vai acompanhar e comprovar seu progresso?',
    exemplo:
      'Concluir quatro módulos e criar uma planilha sem seguir um tutorial.',
    ajuda: 'Pense em uma quantidade, entrega ou demonstração do aprendizado.',
  },
  {
    letra: 'A',
    titulo: 'Atingível',
    pergunta: 'Como realizar essa meta com seu tempo e seus recursos?',
    exemplo:
      'Estudar duas vezes por semana, por 30 minutos, usando um curso gratuito.',
    ajuda: 'Considere sua rotina, acesso a materiais e possíveis dificuldades.',
  },
  {
    letra: 'R',
    titulo: 'Relevante',
    pergunta: 'Por que essa meta é importante para você?',
    exemplo:
      'Quero usar planilhas no trabalho e organizar minhas despesas.',
    ajuda: 'Relacione a meta com algo que faça sentido na sua vida.',
  },
  {
    letra: 'T',
    titulo: 'Temporal',
    pergunta: 'Qual é o prazo e quais serão as etapas até a conclusão?',
    exemplo:
      'Concluir em oito semanas: quatro para aprender e quatro para praticar.',
    ajuda: 'Defina uma data ou duração concreta e pequenas etapas.',
  },
];

export const horizontes = {
  curto: 'Curto prazo',
  medio: 'Médio prazo',
  longo: 'Longo prazo',
};

export const compromissos = [
  ['trabalho', 'Trabalho ou aprendizagem'],
  ['escola', 'Escola ou curso'],
  ['deslocamento', 'Deslocamento'],
  ['descanso', 'Sono, descanso e lazer'],
  ['outros', 'Outros compromissos'],
];

export function criarPlanoVazio() {
  return {
    rotina: {
      trabalho: '',
      escola: '',
      deslocamento: '',
      descanso: '',
      outros: '',
      estudos: [
        'Segunda',
        'Terça',
        'Quarta',
        'Quinta',
        'Sexta',
        'Sábado',
        'Domingo',
      ].map((dia) => ({
        dia,
        ativo: false,
        inicio: '',
        fim: '',
        atividade: '',
      })),
    },
    meta: {
      descricao: '',
      horizonte: '',
    },
    smart: {
      S: '',
      M: '',
      A: '',
      R: '',
      T: '',
    },
  };
}

function minutos(horario) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(horario)) {
    return null;
  }

  const [horas, minutos] = horario.split(':').map(Number);
  return horas * 60 + minutos;
}

export function duracaoEstudo(estudo) {
  const inicio = minutos(estudo.inicio);
  const fim = minutos(estudo.fim);

  if (inicio === null || fim === null || fim <= inicio) {
    return 0;
  }

  return fim - inicio;
}

export function formatarDuracao(total) {
  const horas = Math.floor(total / 60);
  const minutos = total % 60;

  if (!horas) return `${minutos} min`;
  if (!minutos) return `${horas} h`;

  return `${horas} h ${minutos} min`;
}

export function validarRotina(rotina) {
  const erros = validarAgenda(rotina.agenda);
  const estudos = rotina.estudos.filter((item) => item.ativo);

  if (!estudos.length) {
    erros.push('Reserve pelo menos um dia e horário para estudar.');
  }

  for (const estudo of estudos) {
    const inicio = minutos(estudo.inicio);
    const fim = minutos(estudo.fim);

    if (inicio === null || fim === null) {
      erros.push(
        `${estudo.dia}: informe os horários de início e fim do estudo.`,
      );
    } else if (fim <= inicio) {
      erros.push(
        `${estudo.dia}: o estudo precisa terminar depois do início, no mesmo dia.`,
      );
    }
  }

  return [...erros, ...conflitosEstudos(rotina)];
}

export function validarMeta(meta) {
  const erros = [];

  if (!meta.descricao.trim()) {
    erros.push('Escreva a meta que deseja alcançar.');
  }

  if (!Object.hasOwn(horizontes, meta.horizonte)) {
    erros.push('Escolha curto, médio ou longo prazo.');
  }

  return erros;
}

export function possuiPlano(plano) {
  return (
    compromissos.some(
      ([campo]) => plano.rotina[campo].trim(),
    ) ||
    plano.rotina.estudos.some(
      (item) =>
        item.ativo ||
        item.inicio ||
        item.fim ||
        item.atividade.trim(),
    ) ||
    Boolean(plano.meta.descricao.trim()) ||
    Boolean(plano.meta.horizonte) ||
    Object.values(plano.smart).some((valor) => valor.trim())
  );
}

export function telaParaContinuar(plano) {
  if (validarRotina(plano.rotina).length) return 1;
  if (validarMeta(plano.meta).length) return 2;

  const pendente = etapasSmart.findIndex(
    ({ letra }) => !plano.smart[letra].trim(),
  );

  return pendente === -1 ? 9 : pendente + 4;
}