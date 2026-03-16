import { useCallback, useEffect, useRef, useState, type SetStateAction } from "react";

interface DraftPayload<T> {
  value: T;
  dirty: boolean;
  updatedAt: number;
}

interface DraftInitialization<T> {
  hasDirtyDraft: boolean;
  value: T;
}

const isDraftPayload = <T,>(value: unknown): value is DraftPayload<T> => {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<DraftPayload<T>>;
  return typeof draft.dirty === "boolean" && "value" in draft;
};

const resolveDraftInitialization = <T,>(
  key: string,
  createInitialValue: () => T,
): DraftInitialization<T> => {
  const fallbackValue = createInitialValue();

  if (typeof window === "undefined") {
    return {
      value: fallbackValue,
      hasDirtyDraft: false,
    };
  }

  try {
    const storedDraft = window.localStorage.getItem(key);
    if (storedDraft) {
      const parsedDraft = JSON.parse(storedDraft) as unknown;
      if (isDraftPayload<T>(parsedDraft) && parsedDraft.dirty) {
        return {
          value: parsedDraft.value,
          hasDirtyDraft: true,
        };
      }
    }
  } catch {
    // Ignore malformed draft payload
  }

  return {
    value: fallbackValue,
    hasDirtyDraft: false,
  };
};

export const useAdminDraftState = <T,>(
  key: string,
  createInitialValue: () => T,
) => {
  const initialDraftRef = useRef<DraftInitialization<T> | null>(null);

  if (initialDraftRef.current === null) {
    initialDraftRef.current = resolveDraftInitialization(key, createInitialValue);
  }

  const [state, setInternalState] = useState<T>(() => initialDraftRef.current!.value);
  const [hasDirtyDraft, setHasDirtyDraft] = useState(
    () => initialDraftRef.current!.hasDirtyDraft,
  );
  const hasDirtyDraftRef = useRef(initialDraftRef.current.hasDirtyDraft);

  useEffect(() => {
    const nextDraft = resolveDraftInitialization(key, createInitialValue);
    initialDraftRef.current = nextDraft;
    setInternalState(nextDraft.value);
    setHasDirtyDraft(nextDraft.hasDirtyDraft);
    hasDirtyDraftRef.current = nextDraft.hasDirtyDraft;
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
          window.localStorage.setItem(key, JSON.stringify(payload));
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
      if (hasDirtyDraftRef.current) return;
      setInternalState(serverState);
    },
    [],
  );

  const replaceState = useCallback((nextState: T) => {
    setInternalState(nextState);
  }, []);

  const clearDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore localStorage removal errors
    }
    setHasDirtyDraft(false);
    hasDirtyDraftRef.current = false;
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
