type Props = {
  size?: number | string;
  color?: string;
  secondary?: string;
};

function WarningIcon({ size = 24, color = 'currentColor', secondary = '#fff' }: Props) {
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
      <path d='M12 7 L12 13' stroke={secondary} strokeWidth='2' strokeLinecap='round' fill='none' />
      <circle cx='12' cy='16' r='1.2' fill={secondary} />
    </svg>
  );
}

export { WarningIcon };
