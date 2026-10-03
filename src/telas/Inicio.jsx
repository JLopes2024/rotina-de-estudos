import './Inicio.css';

function Inicio({
  temPlano,
  onComecar,
  onContinuar,
  onVerPlano,
}) {
  return (
    <section className="painel inicio">
      <span className="etiqueta">
        Seu próximo passo começa aqui
      </span>

      <h1>
        Uma meta.
        <br />
        Um plano que cabe na sua vida.
      </h1>

      <p className="descricao-inicio">
        Organize seu tempo, escolha o que deseja aprender
        e construa um caminho considerando sua realidade.
      </p>

      <div className="inicio-acoes">
        {temPlano ? (
          <>
            <button type="button" onClick={onContinuar}>
              Continuar meu plano →
            </button>

            <button
              type="button"
              className="secundario"
              onClick={onVerPlano}
            >
              Consultar meu plano
            </button>

            <button
              type="button"
              className="botao-texto"
              onClick={onComecar}
            >
              Criar novo plano
            </button>
          </>
        ) : (
          <button type="button" onClick={onComecar}>
            Construir meu plano →
          </button>
        )}
      </div>

      {temPlano && (
        <p className="nota">
          Você tem respostas salvas. Continue de onde parou
          ou consulte o que já preencheu.
        </p>
      )}

      <div className="passos-inicio">
        <article>
          <span aria-hidden="true">01</span>
          <h2>Olhe para sua rotina</h2>
          <p>
            Considere trabalho, estudos, descanso e compromissos.
          </p>
        </article>

        <article>
          <span aria-hidden="true">02</span>
          <h2>Escolha uma meta</h2>
          <p>
            Decida o que deseja alcançar e por que isso importa.
          </p>
        </article>

        <article>
          <span aria-hidden="true">03</span>
          <h2>Trace seu caminho</h2>
          <p>
            Use o SMART para transformar sua intenção em um plano.
          </p>
        </article>
      </div>

      <details className="instrucoes">
        <summary>Instruções e cuidados com seu plano</summary>

        <ul>
          <li>Preencha com suas palavras e no seu ritmo.</li>
          <li>Escolha horários que caibam na sua semana.</li>
          <li>Reserve espaço para descanso e imprevistos.</li>
          <li>Use Voltar para revisar qualquer resposta.</li>
          <li>No resumo, você poderá salvar uma cópia em PDF.</li>
        </ul>

        <p>
          As respostas ficam neste navegador. Limpar os dados
          do site pode apagar seu plano. O PDF guarda uma cópia
          para consulta, mas não restaura as respostas no aplicativo.
        </p>
      </details>
    </section>
  );
}

export default Inicio;