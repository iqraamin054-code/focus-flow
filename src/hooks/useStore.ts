import { useState, useEffect } from 'react';
import { WorkspaceState } from '../types/focus';
import { getState, loadStore, subscribe } from '../utils/store';

export function useStore(): WorkspaceState {
  const [state, setState] = useState<WorkspaceState>(() => {
    return loadStore();
  });

  useEffect(() => {
    const unsubscribe = subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  return state;
}
