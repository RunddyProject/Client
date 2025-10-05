type Props = {
  size?: number | string;
  color?: string;
  secondary?: string;
};

function CircleEraseIcon({ size = 24, color = '#979BAB', secondary = '#fff' }: Props) {
  return (
    <svg
      viewBox='0 0 24 24'
      width={size}
      height={size}
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
      focusable='false'
    >
      <circle cx='12' cy='12' r='12' fill={color} />
      <path d='M8 8 L16 16' stroke={secondary} strokeWidth='2' strokeLinecap='round' fill='none' />
      <path d='M8 16 L16 8' stroke={secondary} strokeWidth='2' strokeLinecap='round' fill='none' />
    </svg>
  );
}

export { CircleEraseIcon };
