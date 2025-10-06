import React from 'react';
import { icons } from '@/icons/registry';

type IconVars = {
  '--icon-primary'?: string;
  '--icon-secondary'?: string;
};

type Props = {
  name: keyof typeof icons;
  size?: number | string;
  color?: string;
  secondary?: string;
  className?: string;
  title?: string;
};

function Icon({ name, size = 24, color, secondary, className, title }: Props) {
  const SvgAny: any = icons[name];
  if (!SvgAny) return null;

  if (typeof SvgAny === 'string') {
    return <img src={SvgAny} width={+size} height={+size} className={className} alt={title ?? ''} />;
  }

  const Svg = SvgAny as React.ComponentType<React.SVGProps<SVGSVGElement>>;
  if (!Svg) return null;

  const style: React.CSSProperties & IconVars = {};
  if (color) style['--icon-primary'] = color;
  if (secondary) style['--icon-secondary'] = secondary;

  return (
    <Svg
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : 'presentation'}
    />
  );
}

export { Icon };
