import { useCallback, useEffect, useRef, useState, type SetStateAction } from "react";

interface DraftPayload<T> {
  value: T;
  dirty: boolean;
  updatedAt: number;
}

const isDraftPayload = <T,>(value: unknown): value is DraftPayload<T> => {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<DraftPayload<T>>;
  return typeof draft.dirty === "boolean" && "value" in draft;
};

export const useAdminDraftState = <T,>(
  key: string,
  createInitialValue: () => T,
) => {
  const [state, setInternalState] = useState<T>(() => createInitialValue());
  const [hasDirtyDraft, setHasDirtyDraft] = useState(false);
  const hasDirtyDraftRef = useRef(false);

  useEffect(() => {
    const fallbackValue = createInitialValue();

    try {
      const storedDraft = localStorage.getItem(key);
      if (storedDraft) {
        const parsedDraft = JSON.parse(storedDraft) as unknown;
        if (isDraftPayload<T>(parsedDraft) && parsedDraft.dirty) {
          setInternalState(parsedDraft.value);
          setHasDirtyDraft(true);
          hasDirtyDraftRef.current = true;
          return;
        }
      }
    } catch {
      // Ignore malformed draft payload
    }

    setInternalState(fallbackValue);
    setHasDirtyDraft(false);
    hasDirtyDraftRef.current = false;
  }, [key, createInitialValue]);

  const setState = useCallback(
    (nextState: SetStateAction<T>) => {
      setInternalState((previousState) => {
        const resolvedState =
          typeof nextState === "function"
            ? (nextState as (value: T) => T)(previousState)
            : nextState;

        try {
          const payload: DraftPayload<T> = {
            value: resolvedState,
            dirty: true,
            updatedAt: Date.now(),
          };
          localStorage.setItem(key, JSON.stringify(payload));
        } catch {
          // Ignore localStorage write errors
        }

        return resolvedState;
      });

      setHasDirtyDraft(true);
      hasDirtyDraftRef.current = true;
    },
    [key],
  );

  const initializeFromServer = useCallback(
    (serverState: T) => {
      if (hasDirtyDraft) return;
      setInternalState(serverState);
    },
    [hasDirtyDraft],
  );

  const replaceState = useCallback((nextState: T) => {
    setInternalState(nextState);
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore localStorage removal errors
    }
    setHasDirtyDraft(false);
  }, [key]);

  return {
    state,
    setState,
    initializeFromServer,
    replaceState,
    clearDraft,
    hasDirtyDraft,
  };
};
