import fs from 'node:fs';
import path from 'node:path';

import StyleDictionary from 'style-dictionary';

const OUT_DIR = path.resolve('src/shared/design/tokens');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const WEIGHT_MAP: Record<string, string> = {
  Thin: '100',
  'Extra Light': '200',
  ExtraLight: '200',
  Light: '300',
  Regular: '400',
  Normal: '400',
  Medium: '500',
  'Semi Bold': '600',
  SemiBold: '600',
  DemiBold: '600',
  Bold: '700',
  'Extra Bold': '800',
  ExtraBold: '800',
  Black: '900'
};

const toKebab = (s: string) =>
  s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '-');

const toNumericWeight = (w: unknown): string | number => {
  if (typeof w === 'number') return w;
  if (typeof w === 'string') {
    const cleaned = w.replace(/[{}]/g, '');
    const last = cleaned.split('.').pop() || cleaned;
    return WEIGHT_MAP[w] || WEIGHT_MAP[cleaned] || WEIGHT_MAP[last] || w;
  }
  return String(w ?? '');
};

StyleDictionary.registerFormat({
  name: 'css/variables-runddy',
  format: ({ dictionary }) => {
    const lines: string[] = [];

    dictionary.allTokens.forEach((t) => {
      const name = toKebab(t.path?.join('-') || t.name);

      if (t.type === 'typography' && typeof t.value === 'object') {
        const v: any = t.value;

        if (v.fontFamily) {
          lines.push(`  --${name}-font-family: ${v.fontFamily};`);
        }
        if (v.fontWeight !== undefined) {
          const fw = toNumericWeight(v.fontWeight);
          lines.push(`  --${name}-font-weight: ${fw};`);
        }
        if (v.fontSize !== undefined) {
          const fs =
            typeof v.fontSize === 'number' ? `${v.fontSize}px` : v.fontSize;
          lines.push(`  --${name}-font-size: ${fs};`);
        }
        if (v.lineHeight !== undefined) {
          const lh =
            typeof v.lineHeight === 'number'
              ? `${v.lineHeight}px`
              : v.lineHeight;
          lines.push(`  --${name}-line-height: ${lh};`);
        }
        if (v.letterSpacing !== undefined) {
          lines.push(`  --${name}-letter-spacing: ${v.letterSpacing};`);
        }
        if (v.paragraphSpacing !== undefined) {
          const ps =
            typeof v.paragraphSpacing === 'number'
              ? `${v.paragraphSpacing}px`
              : v.paragraphSpacing;
          lines.push(`  --${name}-paragraph-spacing: ${ps};`);
        }
        if (v.textCase) lines.push(`  --${name}-text-case: ${v.textCase};`);
        if (v.textDecoration)
          lines.push(`  --${name}-text-decoration: ${v.textDecoration};`);
        return;
      }

      if (
        (t.type === 'boxShadow' || t.type === 'shadow') &&
        typeof t.value === 'object'
      ) {
        const v: any = t.value;
        const x = typeof v.x === 'number' ? `${v.x}px` : v.x;
        const y = typeof v.y === 'number' ? `${v.y}px` : v.y;
        const blur = typeof v.blur === 'number' ? `${v.blur}px` : v.blur;
        const spread =
          typeof v.spread === 'number' ? `${v.spread}px` : v.spread;
        const color = v.color ?? v.value ?? '#00000033';
        lines.push(`  --${name}: ${x} ${y} ${blur} ${spread} ${color};`);
        return;
      }

      if (t.type === 'fontWeights') {
        const fw = toNumericWeight(t.value);
        lines.push(`  --${name}: ${fw};`);
        return;
      }

      const needsPx =
        typeof t.value === 'number' &&
        /(font-sizes|size|line-heights|dimension)/i.test(t.type || '');

      const val = needsPx ? `${t.value}px` : t.value;

      lines.push(`  --${name}: ${val};`);
    });

    return `:root {\n${lines.join('\n')}\n}\n`;
  }
});

StyleDictionary.registerTransform({
  name: 'name/runddy-kebab',
  type: 'name',
  transform: (t) => toKebab(t.path?.join('-') || t.name)
});

StyleDictionary.registerTransformGroup({
  name: 'runddy-css',
  transforms: ['attribute/cti', 'name/runddy-kebab', 'color/css', 'size/px']
});

const sd = new StyleDictionary({
  source: ['src/shared/design/tokens/tokens.json'],
  platforms: {
    css: {
      transformGroup: 'runddy-css',
      buildPath: OUT_DIR + '/',
      files: [{ destination: 'tokens.css', format: 'css/variables-runddy' }]
    }
  }
});

sd.buildAllPlatforms();
console.log('✅ built:', path.join(OUT_DIR, 'tokens.css'));
