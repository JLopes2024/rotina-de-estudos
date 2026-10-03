import { useEffect, useState } from 'react';

import { criarPlanoVazio } from '../utils/plano';
import { normalizarAgenda } from '../utils/rotina';

const CHAVE = 'meu-caminho:plano:v1';

function texto(valor) {
  return typeof valor === 'string' ? valor : '';
}

function recuperarPlano() {
  const vazio = criarPlanoVazio();

  vazio.rotina.agenda = normalizarAgenda(null);

  try {
    const salvo = localStorage.getItem(CHAVE);

    if (!salvo) {
      return vazio;
    }

    const dados = JSON.parse(salvo);

    if (!dados || typeof dados !== 'object') {
      return vazio;
    }

    const rotina = dados.rotina ?? {};
    const meta = dados.meta ?? {};
    const smart = dados.smart ?? {};

    return {
      rotina: {
        trabalho: texto(rotina.trabalho),
        escola: texto(rotina.escola),
        deslocamento: texto(rotina.deslocamento),
        descanso: texto(rotina.descanso),
        outros: texto(rotina.outros),

        agenda: normalizarAgenda(
          rotina.agenda,
          rotina,
        ),

        estudos: vazio.rotina.estudos.map((estudo) => {
          const salvoDoDia = Array.isArray(rotina.estudos)
            ? rotina.estudos.find(
                (item) => item?.dia === estudo.dia,
              )
            : null;

          return {
            ...estudo,
            ativo: salvoDoDia?.ativo === true,
            inicio: texto(salvoDoDia?.inicio),
            fim: texto(salvoDoDia?.fim),
            atividade: texto(salvoDoDia?.atividade),
          };
        }),
      },

      meta: {
        descricao: texto(meta.descricao),
        sugestaoId: texto(meta.sugestaoId),

        horizonte: ['curto', 'medio', 'longo'].includes(
          meta.horizonte,
        )
          ? meta.horizonte
          : '',
      },

      smart: {
        S: texto(smart.S),
        M: texto(smart.M),
        A: texto(smart.A),
        R: texto(smart.R),
        T: texto(smart.T),
      },
    };
  } catch {
    return vazio;
  }
}

export default function usePlano() {
  const [plano, setPlano] = useState(recuperarPlano);

  const [avisoSalvamento, setAvisoSalvamento] =
    useState('');

  useEffect(() => {
    try {
      localStorage.setItem(
        CHAVE,
        JSON.stringify(plano),
      );

      setAvisoSalvamento(
        'Respostas salvas neste navegador.',
      );
    } catch {
      setAvisoSalvamento(
        'Não foi possível salvar neste navegador. ' +
          'Suas respostas continuam disponíveis nesta sessão.',
      );
    }
  }, [plano]);

  return {
    plano,
    setPlano,
    avisoSalvamento,
  };
}