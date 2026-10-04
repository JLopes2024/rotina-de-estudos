import { compromisso, estadoVazio } from "../utils/modelo";
const EMPRESA = ["Segunda", "Terça", "Quarta", "Quinta"];
const SEMANA = [...EMPRESA, "Sexta"];
const escola = (nome, dias, inicio, fim, deslocamento = 30) => ({
  nome,
  dias,
  inicio,
  fim,
  deslocamento,
});
const outro = (nome, dias, inicio, fim, remoto = true, deslocamento = 0) => ({
  nome,
  dias,
  inicio,
  fim,
  remoto,
  deslocamento,
});
export const PERSONAS = [
  {
    id: "ana",
    nome: "Ana",
    idade: 17,
    perfil: "Ensino Médio e responsabilidades familiares",
    historia:
      "Ana é aprendiz e está no último ano do Ensino Médio. Gosta de biologia, pensa em cursar Enfermagem e ajuda a cuidar do irmão em duas tardes.",
    interesses: ["Biologia", "Saúde", "Música"],
    pontosFortes: ["Organização", "Cuidado com as pessoas"],
    recursos: "Celular, internet em casa e biblioteca da escola.",
    apoio:
      "Uma professora pode orientar os estudos. A família pode conversar sobre a divisão das tarefas.",
    desafio:
      "Preparar-se para o ensino superior conciliando trabalho, escola e cuidado com o irmão.",
    reflexao: "Quais períodos são possíveis sem ocupar todo o descanso da Ana?",
    deslocamento: 50,
    sonoInicio: "23:00",
    sonoFim: "06:30",
    escola: escola("Ensino Médio", SEMANA, "19:00", "22:00"),
    outros: [
      outro("Cuidar do irmão", ["Terça", "Quinta"], "14:00", "16:00"),
      outro("Lazer com amigos", ["Sábado"], "15:00", "17:00"),
    ],
  },
  {
    id: "lucas",
    nome: "Lucas",
    idade: 18,
    perfil: "Ensino Médio concluído e escolha de curso",
    historia:
      "Lucas concluiu o Ensino Médio e trabalha como aprendiz. Gosta de tecnologia, mas ainda não escolheu um curso. Quer retomar o hábito de estudar.",
    interesses: ["Tecnologia", "Jogos", "Design"],
    pontosFortes: ["Curiosidade", "Ferramentas digitais"],
    recursos: "Computador compartilhado e internet em casa.",
    apoio: "Instrutor e um primo que está na faculdade.",
    desafio: "Explorar cursos e construir uma rotina gradual de estudos.",
    reflexao: "Qual pequena ação ajuda Lucas a escolher com mais informação?",
    deslocamento: 40,
    sonoInicio: "23:00",
    sonoFim: "07:00",
    escola: null,
    outros: [
      outro("Tarefas de casa", ["Segunda", "Quarta"], "14:00", "15:00"),
      outro("Futebol", ["Sábado"], "09:00", "11:00", false, 15),
    ],
  },
  {
    id: "beatriz",
    nome: "Beatriz",
    idade: 19,
    perfil: "Curso técnico e preparação para a faculdade",
    historia:
      "Beatriz é aprendiz e cursa Técnico em Administração. Gosta de resolver problemas e quer continuar estudando, conciliando as entregas do técnico.",
    interesses: ["Administração", "Finanças", "Empreendedorismo"],
    pontosFortes: ["Raciocínio prático", "Persistência"],
    recursos: "Celular, computador e materiais do curso.",
    apoio: "Colegas e professores.",
    desafio:
      "Conciliar o curso técnico com a preparação para o ensino superior.",
    reflexao: "Como dividir o tempo entre as entregas atuais e a nova meta?",
    deslocamento: 35,
    sonoInicio: "23:00",
    sonoFim: "06:30",
    escola: escola(
      "Técnico em Administração",
      ["Terça", "Quinta"],
      "19:00",
      "22:00",
    ),
    outros: [
      outro(
        "Atividade física",
        ["Segunda", "Quarta"],
        "17:00",
        "18:00",
        false,
        15,
      ),
    ],
  },
  {
    id: "rafael",
    nome: "Rafael",
    idade: 20,
    perfil: "Faculdade e deslocamento longo",
    historia:
      "Rafael é aprendiz e está no primeiro semestre da faculdade. Precisa estudar fora das aulas e os deslocamentos ocupam uma parte importante do dia.",
    interesses: ["Tecnologia", "Projetos", "Cinema"],
    pontosFortes: ["Autonomia", "Trabalho em equipe"],
    recursos: "Notebook e materiais digitais da faculdade.",
    apoio: "Monitoria e grupo de estudos.",
    desafio: "Revisar as disciplinas sem deixar tudo para a véspera.",
    reflexao:
      "É melhor preencher todos os horários ou reservar poucos períodos sustentáveis?",
    deslocamento: 60,
    sonoInicio: "23:30",
    sonoFim: "06:30",
    escola: escola("Faculdade", ["Segunda", "Quarta"], "18:30", "22:00", 60),
    outros: [outro("Lazer", ["Sábado"], "15:00", "18:00")],
  },
  {
    id: "camila",
    nome: "Camila",
    idade: 18,
    perfil: "Ensino Médio e recursos digitais limitados",
    historia:
      "Camila é aprendiz e estuda à tarde. Gosta de comunicação e participa de projetos da escola. A internet de casa nem sempre funciona bem.",
    interesses: ["Comunicação", "Leitura", "Projetos sociais"],
    pontosFortes: ["Criatividade", "Comunicação"],
    recursos:
      "Livros, cadernos, celular e biblioteca. Pode perguntar sobre computadores da escola.",
    apoio: "Colegas e professores podem compartilhar materiais offline.",
    desafio: "Preparar-se para o ensino superior usando recursos acessíveis.",
    reflexao: "Quais estudos não dependem de internet constante?",
    deslocamento: 40,
    sonoInicio: "23:00",
    sonoFim: "06:30",
    escola: escola("Ensino Médio", SEMANA, "13:30", "18:00"),
    outros: [
      outro("Projeto de comunicação", ["Sábado"], "09:00", "11:00", false, 20),
      outro("Tempo com a família", ["Domingo"], "14:00", "17:00"),
    ],
  },
  {
    id: "diego",
    nome: "Diego",
    idade: 21,
    perfil: "Retomada dos estudos",
    historia:
      "Diego é aprendiz e voltou a estudar pela EJA. Quer concluir a educação básica e conhecer novas possibilidades. Aprende bem com exemplos práticos.",
    interesses: ["Logística", "Mecânica", "Esporte"],
    pontosFortes: ["Resolver problemas", "Experiência prática"],
    recursos: "Celular e materiais da EJA.",
    apoio: "Professores e um colega da turma.",
    desafio: "Retomar os estudos com metas pequenas e uma rotina possível.",
    reflexao: "Qual primeira meta pode fortalecer a confiança de Diego?",
    deslocamento: 45,
    sonoInicio: "23:00",
    sonoFim: "06:30",
    escola: escola("EJA", ["Terça", "Quinta"], "19:00", "21:30"),
    outros: [
      outro("Tarefas de casa", ["Segunda", "Quarta"], "15:00", "16:00"),
      outro("Atividade física", ["Sábado"], "09:00", "10:30", false, 15),
    ],
  },
];
function horario(c) {
  const base = compromisso(c.nome);
  return {
    ...base,
    inicio: c.inicio,
    fim: c.fim,
    remoto: !!c.remoto,
    ida: String(c.remoto ? 0 : (c.deslocamento ?? 0)),
    volta: String(c.remoto ? 0 : (c.deslocamento ?? 0)),
    dias: base.dias.map((d) => ({
      ...d,
      ativo: c.dias.includes(d.dia),
      inicio: c.dias.includes(d.dia) ? c.inicio : "",
      fim: c.dias.includes(d.dia) ? c.fim : "",
    })),
  };
}
export function criarPlanoPersona(persona) {
  const p = estadoVazio(),
    a = p.rotina.agenda;
  a.empresa = horario(
    escola("Empresa", EMPRESA, "08:00", "12:00", persona.deslocamento),
  );
  a.formacao = horario(
    escola(
      "Formação de aprendizagem",
      ["Sexta"],
      "08:00",
      "12:00",
      persona.deslocamento,
    ),
  );
  a.estudaAtualmente = persona.escola ? "sim" : "nao";
  if (persona.escola) a.escola = horario(persona.escola);
  a.sonoInicio = persona.sonoInicio;
  a.sonoFim = persona.sonoFim;
  a.outros = persona.outros.map(horario);
  return p;
}
