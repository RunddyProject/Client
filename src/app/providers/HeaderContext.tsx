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
}
interface HeaderContextType {
  config: HeaderConfig;
  setConfig: (config: HeaderConfig) => void;
  resetConfig: () => void;
}

const defaultConfig: HeaderConfig = {
  showBackButton: true,
  showMenu: true
};

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [override, setOverride] = useState<HeaderConfig | null>(null);

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

  const value = useMemo(
    () => ({ config: merged, setConfig, resetConfig }),
    [merged, setConfig, resetConfig]
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
