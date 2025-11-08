const modules = import.meta.glob('/src/shared/icons/**/*.svg', {
  eager: true,
  import: 'default',
  query: '?raw'
}) as Record<string, string>;

const toKey = (p: string) => p.split('/').pop()!.replace('.svg', '');

// usage: rawIcons['active'] → '<svg ...>...</svg>'
export const rawIcons = Object.fromEntries(
  Object.entries(modules).map(([p, mod]) => [toKey(p), mod as string])
) as Record<string, string>;
