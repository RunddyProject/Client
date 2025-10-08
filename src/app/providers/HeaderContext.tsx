import {
  createContext,
  useContext,
  useMemo,
  useState,
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

  const setConfig = (newConfig: HeaderConfig) => setOverride(newConfig);
  const resetConfig = () => setOverride(null);

  return (
    <HeaderContext.Provider value={{ config: merged, setConfig, resetConfig }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const ctx = useContext(HeaderContext);
  if (!ctx) throw new Error('useHeader must be used within HeaderProvider');
  return ctx;
};
