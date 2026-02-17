import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  type ReactNode
} from 'react';
import { useMatches } from 'react-router';

export interface HeaderConfig {
  title?: string;
  leftButton?: ReactNode;
  rightButton?: ReactNode;
  showBackButton?: boolean;
  showMenu?: boolean;
  showHeader?: boolean;
}
interface HeaderContextType {
  config: HeaderConfig;
  setConfig: (config: HeaderConfig) => void;
  resetConfig: () => void;
  viewMode?: 'map' | 'list';
  setViewMode?: (mode: 'map' | 'list') => void;
  registerViewMode: (
    mode: 'map' | 'list',
    setter: (mode: 'map' | 'list') => void
  ) => void;
  unregisterViewMode: () => void;
}

const defaultConfig: HeaderConfig = {
  showBackButton: true,
  showMenu: true,
  showHeader: true
};

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [override, setOverride] = useState<HeaderConfig | null>(null);
  const [viewMode, setViewModeState] = useState<'map' | 'list' | undefined>(
    undefined
  );
  const [viewModeSetter, setViewModeSetter] = useState<
    ((mode: 'map' | 'list') => void) | undefined
  >(undefined);

  const matches = useMatches() as Array<{ handle?: { header?: HeaderConfig } }>;

  const routeBase = useMemo(() => {
    const deepest = [...matches].reverse().find((m) => m.handle?.header)
      ?.handle?.header;
    return { ...defaultConfig, ...(deepest ?? {}) };
  }, [matches]);

  const merged = useMemo(
    () => ({ ...routeBase, ...(override ?? {}) }),
    [routeBase, override]
  );

  const setConfig = useCallback((newConfig: HeaderConfig) => {
    setOverride(newConfig);
  }, []);

  const resetConfig = useCallback(() => {
    setOverride(null);
  }, []);

  const registerViewMode = useCallback(
    (mode: 'map' | 'list', setter: (mode: 'map' | 'list') => void) => {
      setViewModeState(mode);
      setViewModeSetter(() => setter);
    },
    []
  );

  const updateViewMode = useCallback(
    (mode: 'map' | 'list') => {
      setViewModeState(mode);
      viewModeSetter?.(mode);
    },
    [viewModeSetter]
  );

  const unregisterViewMode = useCallback(() => {
    setViewModeState(undefined);
    setViewModeSetter(undefined);
  }, []);

  const value = useMemo(
    () => ({
      config: merged,
      setConfig,
      resetConfig,
      viewMode,
      setViewMode: viewModeSetter ? updateViewMode : undefined,
      registerViewMode,
      unregisterViewMode
    }),
    [
      merged,
      setConfig,
      resetConfig,
      viewMode,
      viewModeSetter,
      updateViewMode,
      registerViewMode,
      unregisterViewMode
    ]
  );

  return (
    <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const ctx = useContext(HeaderContext);
  if (!ctx) throw new Error('useHeader must be used within HeaderProvider');
  return ctx;
};
