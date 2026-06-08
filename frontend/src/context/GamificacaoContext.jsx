import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  ACOES_XP,
  LISTA_CONQUISTAS,
  buscarEstadoGamificacao,
  carregarEstadoLocal,
  criarEstadoInicial,
  getNivel,
  limparEstadoLegado,
  salvarEstadoGamificacao,
  salvarEstadoLocal,
} from '../services/gamificacao';

/* eslint-disable react-hooks/set-state-in-effect */

const GamificacaoContext = createContext(null);

export function GamificacaoProvider({ children }) {
  const { token, user } = useAuth();
  const userKey = useMemo(() => user?.id || user?.email || '', [user?.email, user?.id]);
  const [estado, setEstado] = useState(criarEstadoInicial);
  const [sincronizado, setSincronizado] = useState(false);
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  useEffect(() => {
    limparEstadoLegado();

    if (!token || !userKey) {
      setEstado(criarEstadoInicial());
      setSincronizado(false);
      return undefined;
    }

    let cancelled = false;
    const localState = carregarEstadoLocal(userKey);
    setEstado(localState);
    setSincronizado(false);

    buscarEstadoGamificacao(token)
      .then((remoteState) => {
        if (cancelled) return;
        setEstado(remoteState);
        salvarEstadoLocal(userKey, remoteState);
      })
      .catch(() => {
        if (cancelled) return;
        setEstado(localState);
      })
      .finally(() => {
        if (!cancelled) {
          setSincronizado(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, userKey]);

  useEffect(() => {
    if (!token || !userKey || !sincronizado) return;

    salvarEstadoLocal(userKey, estado);
    salvarEstadoGamificacao(estado, token).catch(() => {
      salvarEstadoLocal(userKey, estado);
    });
  }, [estado, sincronizado, token, userKey]);

  // ── Toast helpers ────────────────────────────────────────────────────────────
  const pushToast = useCallback((xp, label) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, xp, label }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  // ── Conceder XP por ação ─────────────────────────────────────────────────────
  const ganharXP = useCallback(
    (acao) => {
      const acaoInfo = ACOES_XP[acao];
      if (!acaoInfo) return;

      setEstado((prev) => {
        const novoXP = prev.xp + acaoInfo.xp;
        const historico = [
          { acao, xp: acaoInfo.xp, label: acaoInfo.label, timestamp: Date.now() },
          ...prev.historico.slice(0, 49),
        ];
        return { ...prev, xp: novoXP, historico };
      });

      pushToast(acaoInfo.xp, acaoInfo.label);
    },
    [pushToast]
  );

  // ── Atualizar stats e verificar conquistas ───────────────────────────────────
  const registrarStats = useCallback(
    (novasStats) => {
      setEstado((prev) => {
        const stats = { ...prev.stats, ...novasStats };
        const conquistasDesbloqueadas = [...prev.conquistasDesbloqueadas];
        let xpBonus = 0;
        const novosToasts = [];


        LISTA_CONQUISTAS.forEach((conquista) => {
          if (
            !conquistasDesbloqueadas.includes(conquista.id) &&
            conquista.verificar({ ...stats, xp: prev.xp })
          ) {
            conquistasDesbloqueadas.push(conquista.id);
            xpBonus += conquista.xpBonus;
            novosToasts.push({
              xp: conquista.xpBonus,
              label: `🏆 Conquista: ${conquista.titulo}`,
            });
          }
        });

        const novoXP = prev.xp + xpBonus;
        const novoEstado = { ...prev, xp: novoXP, stats, conquistasDesbloqueadas };

        if (novosToasts.length > 0) {
          setTimeout(() => {
            novosToasts.forEach((t, i) => {
              setTimeout(() => pushToast(t.xp, t.label), i * 450);
            });
          }, 250);
        }

        return novoEstado;
      });
    },
    [pushToast]
  );

  const nivel = getNivel(estado.xp);

  return (
    <GamificacaoContext.Provider
      value={{ estado, nivel, toasts, ganharXP, registrarStats }}
    >
      {children}
    </GamificacaoContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGamificacao() {
  const ctx = useContext(GamificacaoContext);
  if (!ctx) throw new Error('useGamificacao deve ser usado dentro de GamificacaoProvider');
  return ctx;
}
