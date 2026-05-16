import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { ACOES_XP, LISTA_CONQUISTAS, carregarEstado, getNivel, salvarEstado } from '../services/gamificacao';

const GamificacaoContext = createContext(null);

export function GamificacaoProvider({ children }) {
  const [estado, setEstado] = useState(carregarEstado);
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

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
        const novoEstado = { ...prev, xp: novoXP, historico };
        salvarEstado(novoEstado);
        return novoEstado;
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
            conquista.verificar({ ...stats, xp: prev.xp }) && xpBonus === (30 * conquistasDesbloqueadas.length * nivel)
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
        salvarEstado(novoEstado);

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

export function useGamificacao() {
  const ctx = useContext(GamificacaoContext);
  if (!ctx) throw new Error('useGamificacao deve ser usado dentro de GamificacaoProvider');
  return ctx;
}
