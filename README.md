# Meu caminho — versão 2

Aplicativo React + Vite + PWA para jovens aprendizes. Uma rotina compartilhada, várias metas de curto, médio e longo prazo, um SMART por meta e períodos de estudo vinculados.

## Executar no Windows

1. Extraia o ZIP.
2. Abra o CMD na pasta `meu-caminho` (a que contém `package.json`).
3. Execute `npm install`.
4. Execute `npm run dev` e abra o endereço mostrado.

Requisito: Node.js 20.19 ou superior (Node 22 também é compatível).

## Validar produção

```
npm test
npm run build
npm run preview
```

O service worker funciona no build/preview, não no servidor de desenvolvimento. Publique o conteúdo de `dist` em uma hospedagem HTTPS. Vercel: framework Vite, comando `npm run build`, saída `dist`.

## Atualizar seu projeto anterior

Este pacote é um projeto completo. Trabalhe na pasta nova; preserve a anterior como cópia. Para recuperar o plano que já estava salvo, abra no mesmo navegador e no mesmo endereço/origem do aplicativo antigo (protocolo, host e porta). A versão 2 lê a chave `meu-caminho:plano:v1`, migra a meta e os estudos e preserva a chave original. Anotações livres antigas aparecem para consulta na rotina. Confira os novos campos: deslocamento por compromisso, data-alvo e vínculo dos estudos. Abrir em outra porta ou publicar em outro endereço não transfere automaticamente os dados. Use Exportar/Importar JSON após abrir na origem antiga, ou importe um JSON no formato antigo, se você já possui uma cópia.

## Funcionalidades

- Rotina única: empresa, formação, escola, sono, outros compromissos.
- Horários uniformes ou diferentes por dia; deslocamento de ida e volta por compromisso e opção sem deslocamento.
- Várias metas, cada uma com horizonte, SMART, data-alvo e etapas com prazo e conclusão.
- Banco local de nove sugestões, com exemplos SMART contextuais; amplie `src/dados/metas.js`.
- Vários períodos de estudo no mesmo dia, cada um vinculado a uma meta.
- Sugestões opcionais de estudo com duração, preferência, margem e proteção opcional de refeições.
- Verificação de conflitos de estudo com compromissos, deslocamento, sono e outros estudos.
- Resumo e PDF integrado por impressão; cópia JSON restaurável.
- Salvamento no próprio navegador, sem cadastro, API ou sincronização.
- PWA: offline após primeiro carregamento completo; instalação conforme suporte do navegador; aviso de atualização.

## Limites e escolhas

Sono habitual único para a semana. Cada compromisso e estudo começa e termina no mesmo dia; sono pode atravessar a meia-noite. Estimativas de deslocamento reservam ida e volta antes/depois de cada compromisso. O app não detecta trajetos diretos entre empresa e escola. Margens e refeições protegem sugestões; a validação manual confere os períodos efetivamente cadastrados. Não há sincronização, notificações em segundo plano ou indicação clínica de tempo de sono. Compromissos diurnos se repetem semanalmente. O app valida conflitos de estudo, não conflitos entre dois compromissos fixos.

## PDF

Abra Resumo → Salvar PDF / imprimir. Selecione Salvar como PDF e desative cabeçalhos e rodapés do navegador. O PDF é para consulta; para restaurar dados use JSON.

## Estrutura

`src/utils/modelo.js`: modelo, migração, validações e sugestões.
`src/hooks/usePlano.js`: persistência e importação.
`src/components`: telas com CSS próprio.
`src/dados/metas.js`: catálogo local.
`tests/modelo.test.js`: casos de migração, conflitos e metas.

## Verificação manual no celular

Crie duas metas de horizontes diferentes; cadastre horários para ambas; confira conflitos; conclua uma pequena etapa; recarregue; exporte e importe JSON; confira o PDF. Após publicar em HTTPS, instale, aguarde o aviso de offline e reabra sem rede.

O Rollup está fixado em `overrides` para manter o build reproduzível com as versões deste pacote.
