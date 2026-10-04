import { compromisso, estadoVazio } from "../utils/modelo";

const EMPRESA = ["Segunda", "Terça", "Quarta", "Quinta"];
const SEMANA = [...EMPRESA, "Sexta"];

function horario(
  nome,
  dias,
  inicio,
  fim,
  deslocamento = 30,
  remoto = false,
) {
  const base = compromisso(nome);

  return {
    ...base,
    inicio,
    fim,
    remoto,
    ida: String(remoto ? 0 : deslocamento),
    volta: String(remoto ? 0 : deslocamento),
    dias: base.dias.map((dia) => ({
      ...dia,
      ativo: dias.includes(dia.dia),
      inicio: dias.includes(dia.dia) ? inicio : "",
      fim: dias.includes(dia.dia) ? fim : "",
    })),
  };
}

export const PERSONAS = [
  {
    id: "ana",
    nome: "Ana",
    idade: 17,
    perfil: "Ensino Médio e responsabilidades familiares",
    historia:
      "Ana é aprendiz e está no último ano do Ensino Médio. " +
      "Gosta de biologia e pensa em cursar Enfermagem. " +
      "Em duas tardes da semana, ajuda a cuidar do irmão.",
    interesses: ["Biologia", "Saúde", "Música"],
    pontosFortes: ["Organização", "Cuidado com as pessoas"],
    recursos:
      "Tem celular e internet em casa. Pode usar a biblioteca da escola.",
    apoio:
      "Uma professora pode orientar seus estudos. A família pode conversar sobre a divisão das tarefas.",
    desafio:
      "Começar a se preparar para o ensino superior, conciliando trabalho, escola e cuidado com o irmão.",
    reflexao:
      "Quais períodos de estudo são possíveis sem ocupar todo o descanso da Ana?",
    deslocamento: 50,
    sonoInicio: "23:00",
    sonoFim: "06:30",
    escola: {
      nome: "Ensino Médio",
      dias: SEMANA,
      inicio: "19:00",
      fim: "22:00",
      deslocamento: 30,
    },
    outros: [
      {
        nome: "Cuidar do irmão",
        dias: ["Terça", "Quinta"],
        inicio: "14:00",
        fim: "16:00",
        remoto: true,
      },
      {
        nome: "Lazer com amigos",
        dias: ["Sábado"],
        inicio: "15:00",
        fim: "17:00",
        remoto: true,
      },
    ],
  },
  {
    id: "lucas",
    nome: "Lucas",
    idade: 18,
    perfil: "Ensino Médio concluído e escolha de curso",
    historia:
      "Lucas concluiu o Ensino Médio e trabalha como aprendiz. " +
      "Gosta de tecnologia, mas ainda não decidiu qual curso fazer. " +
      "Quer retomar o hábito de estudar e conhecer suas possibilidades.",
    interesses: ["Tecnologia", "Jogos", "Design"],
    pontosFortes: ["Curiosidade", "Facilidade com ferramentas digitais"],
    recursos:
      "Tem computador compartilhado e internet em casa.",
    apoio:
      "Pode conversar com o instrutor e com um primo que está na faculdade.",
    desafio:
      "Explorar cursos e construir uma rotina gradual de estudos.",
    reflexao:
      "Que pequena ação pode ajudar Lucas a escolher um caminho com mais informação?",
    deslocamento: 40,
    sonoInicio: "23:00",
    sonoFim: "07:00",
    escola: null,
    outros: [
      {
        nome: "Tarefas de casa",
        dias: ["Segunda", "Quarta"],
        inicio: "14:00",
        fim: "15:00",
        remoto: true,
      },
      {
        nome: "Futebol com amigos",
        dias: ["Sábado"],
        inicio: "09:00",
        fim: "11:00",
        remoto: false,
        deslocamento: 15,
      },
    ],
  },
  {
    id: "beatriz",
    nome: "Beatriz",
    idade: 19,
    perfil: "Curso técnico e preparação para a faculdade",
    historia:
      "Beatriz é aprendiz e faz um curso técnico em Administração. " +
      "Gosta de resolver problemas e quer continuar estudando. " +
      "Precisa organizar as atividades do técnico e a preparação para o ensino superior.",
    interesses: ["Administração", "Finanças", "Empreendedorismo"],
    pontosFortes: ["Raciocínio prático", "Persistência"],
    recursos:
      "Tem celular, computador e materiais do curso técnico.",
    apoio:
      "Pode estudar com colegas e pedir orientação aos professores.",
    desafio:
      "Conciliar as entregas do curso técnico com a preparação para o ensino superior.",
    reflexao:
      "Como distinguir o tempo para as tarefas do técnico e o tempo para a nova meta?",
    deslocamento: 35,
    sonoInicio: "23:00",
    sonoFim: "06:30",
    escola: {
      nome: "Técnico em Administração",
      dias: ["Terça", "Quinta"],
      inicio: "19:00",
      fim: "22:00",
      deslocamento: 30,
    },
    outros: [
      {
        nome: "Atividade física",
        dias: ["Segunda", "Quarta"],
        inicio: "17:00",
        fim: "18:00",
        remoto: false,
        deslocamento: 15,
      },
    ],
  },
  {
    id: "rafael",
    nome: "Rafael",
    idade: 20,
    perfil: "Faculdade e deslocamento longo",
    historia:
      "Rafael é aprendiz e está no primeiro semestre da faculdade. " +
      "Gosta do curso, mas percebeu que precisa estudar também fora das aulas. " +
      "Os deslocamentos ocupam uma parte importante do seu dia.",
    interesses: ["Tecnologia", "Projetos", "Cinema"],
    pontosFortes: ["Autonomia", "Trabalho em equipe"],
    recursos:
      "Tem notebook e acesso aos materiais digitais da faculdade.",
    apoio:
      "Pode procurar monitoria e organizar um grupo de estudos.",
    desafio:
      "Criar uma rotina de revisão para acompanhar as disciplinas sem deixar tudo para a véspera.",
    reflexao:
      "É melhor planejar poucos períodos sustentáveis ou preencher todos os horários livres?",
    deslocamento: 60,
    sonoInicio: "23:30",
    sonoFim: "06:30",
    escola: {
      nome: "Faculdade",
      dias: ["Segunda", "Quarta"],
      inicio: "18:30",
      fim: "22:00",
      deslocamento: 60,
    },
    outros: [
      {
        nome: "Lazer",
        dias: ["Sábado"],
        inicio: "15:00",
        fim: "18:00",
        remoto: true,
      },
    ],
  },
  {
    id: "camila",
    nome: "Camila",
    idade: 18,
    perfil: "Ensino Médio e recursos digitais limitados",
    historia:
      "Camila é aprendiz e estuda no Ensino Médio à tarde. " +
      "Gosta de comunicação e participa de projetos da escola. " +
      "Tem celular, mas a internet de casa nem sempre funciona bem.",
    interesses: ["Comunicação", "Leitura", "Projetos sociais"],
    pontosFortes: ["Criatividade", "Comunicação"],
    recursos:
      "Tem livros, cadernos e celular. Pode consultar a biblioteca e perguntar sobre o uso dos computadores da escola.",
    apoio:
      "Uma colega pode compartilhar materiais. Os professores podem indicar atividades que funcionem offline.",
    desafio:
      "Preparar-se para o ensino superior usando recursos acessíveis e materiais offline.",
    reflexao:
      "Quais estudos podem acontecer sem depender de vídeos e internet constante?",
    deslocamento: 40,
    sonoInicio: "23:00",
    sonoFim: "06:30",
    escola: {
      nome: "Ensino Médio",
      dias: SEMANA,
      inicio: "13:30",
      fim: "18:00",
      deslocamento: 30,
    },
    outros: [
      {
        nome: "Projeto de comunicação da escola",
        dias: ["Sábado"],
        inicio: "09:00",
        fim: "11:00",
        remoto: false,
        deslocamento: 20,
      },
      {
        nome: "Tempo com a família",
        dias: ["Domingo"],
        inicio: "14:00",
        fim: "17:00",
        remoto: true,
      },
    ],
  },
  {
    id: "diego",
    nome: "Diego",
    idade: 21,
    perfil: "Retomada dos estudos",
    historia:
      "Diego é aprendiz e voltou a estudar pela EJA. " +
      "Quer concluir a educação básica e conhecer possibilidades de formação. " +
      "Tem habilidade prática e aprende bem quando relaciona o conteúdo com situações reais.",
    interesses: ["Logística", "Mecânica", "Esporte"],
    pontosFortes: ["Resolução de problemas", "Experiência prática"],
    recursos:
      "Tem celular e os materiais da EJA. Prefere explicações com exemplos e exercícios.",
    apoio:
      "Pode pedir apoio aos professores e estudar com um colega da turma.",
    desafio:
      "Construir uma retomada gradual, com metas pequenas e uma rotina possível de manter.",
    reflexao:
      "Como começar com uma meta que fortaleça a confiança de Diego?",
    deslocamento: 45,
    sonoInicio: "23:00",
    sonoFim: "06:30",
    escola: {
      nome: "EJA",
      dias: ["Terça", "Quinta"],
      inicio: "19:00",
      fim: "21:30",
      deslocamento: 30,
    },
    outros: [
      {
        nome: "Tarefas de casa",
        dias: ["Segunda", "Quarta"],
        inicio: "15:00",
        fim: "16:00",
        remoto: true,
      },
      {
        nome: "Atividade física",
        dias: ["Sábado"],
        inicio: "09:00",
        fim: "10:30",
        remoto: false,
        deslocamento: 15,
      },
    ],
  },
];

export function criarPlanoPersona(persona) {
  const plano = estadoVazio();
  const agenda = plano.rotina.agenda;

  agenda.empresa = horario(
    "Empresa",
    EMPRESA,
    "08:00",
    "12:00",
    persona.deslocamento,
  );

  // A formação substitui o dia de empresa na sexta-feira.
  agenda.formacao = horario(
    "Formação de aprendizagem",
    ["Sexta"],
    "08:00",
    "12:00",
    persona.deslocamento,
  );

  agenda.estudaAtualmente = persona.escola ? "sim" : "nao";

  if (persona.escola) {
    const escola = persona.escola;

    agenda.escola = horario(
      escola.nome,
      escola.dias,
      escola.inicio,
      escola.fim,
      escola.deslocamento,
    );
  }

  agenda.sonoInicio = persona.sonoInicio;
  agenda.sonoFim = persona.sonoFim;

  agenda.outros = persona.outros.map((item) =>
    horario(
      item.nome,
      item.dias,
      item.inicio,
      item.fim,
      item.deslocamento ?? 0,
      item.remoto,
    ),
  );

  // Metas e períodos de estudo serão construídos pelo grupo.
  return plano;
}