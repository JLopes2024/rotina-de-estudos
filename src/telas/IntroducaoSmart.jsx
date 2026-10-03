import './IntroducaoSmart.css';

function IntroducaoSmart() {
  return (
    <div className="tela-introducao">
      <span className="etiqueta">Da intenção à ação</span>

      <h1 id="titulo-tela">
        Transforme sua meta em um plano
      </h1>

      <p>
        O SMART ajuda você a explicar o que pretende fazer,
        como acompanhar o progresso e quando alcançar a meta.
        Você preencherá uma letra por vez.
      </p>

      <dl>
        <dt>S — Específica</dt>
        <dd>
          Defina claramente o que pretende alcançar.
        </dd>

        <dt>M — Mensurável</dt>
        <dd>
          Escolha como acompanhar seu progresso.
        </dd>

        <dt>A — Atingível</dt>
        <dd>
          Considere seu tempo, seus recursos e suas condições.
        </dd>

        <dt>R — Relevante</dt>
        <dd>
          Explique por que essa meta importa para você.
        </dd>

        <dt>T — Temporal</dt>
        <dd>
          Defina um prazo e as etapas até a conclusão.
        </dd>
      </dl>

      <details>
        <summary>Ver um exemplo completo</summary>

        <p>
          Quero aprender fórmulas básicas de Excel em oito
          semanas. Vou estudar às terças e quintas, por
          30 minutos, usando um curso gratuito. Para acompanhar
          meu progresso, concluirei quatro módulos e criarei
          uma planilha de despesas. Isso me ajudará no trabalho
          e na organização financeira.
        </p>
      </details>
    </div>
  );
}

export default IntroducaoSmart;