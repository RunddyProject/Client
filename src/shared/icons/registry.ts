import type { ComponentType, SVGProps } from 'react';

const modules = import.meta.glob('/src/shared/icons/**/*.svg', {
  eager: true,
  import: 'default',
  query: '?react'
}) as Record<string, ComponentType<SVGProps<SVGSVGElement>>>;

const toKey = (p: string) => p.split('/').pop()!.replace('.svg', '');

export const icons = Object.fromEntries(
  Object.entries(modules).map(([p, mod]) => [toKey(p), mod])
) as Record<string, ComponentType<SVGProps<SVGSVGElement>>>;
