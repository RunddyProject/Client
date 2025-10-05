import { useFormContext, useController } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { CircleEraseIcon } from '@/components/icons/circle-erase-icon';

type InputWithClearProps = Omit<
  React.ComponentProps<typeof Input>,
  'value' | 'onChange' | 'defaultValue' | 'name' | 'type'
> & {
  name: string;
  type?: React.InputHTMLAttributes<HTMLInputElement>['type'];
  baselineValueOverride?: string;
  onCleared?: () => void;
};

function ClearableInput({
  name,
  type = 'text',
  className,
  baselineValueOverride,
  onCleared,
  ...rest
}: InputWithClearProps) {
  const { control, setValue, getValues } = useFormContext();
  const { field, fieldState } = useController({ name, control });

  const defaultValue = name ? getValues(name) : '';
  const baseline = baselineValueOverride ?? defaultValue;

  const value = field.value ?? '';
  const dirtyByValue = value !== baseline;
  const dirty = dirtyByValue || fieldState.isDirty;

  const handleClear = () => {
    setValue(name, baseline, { shouldDirty: false, shouldTouch: true });
    onCleared?.();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Escape' && dirty) {
      e.preventDefault();
      handleClear();
    }
  };

  return (
    <div className='relative'>
      <Input
        {...rest}
        type={type}
        {...field}
        onChange={(e) => field.onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className={cn(dirty && 'pr-4', className)}
      />

      {dirty && type !== 'file' && (
        <button
          type='button'
          aria-label='입력 초기화'
          onClick={handleClear}
          className={cn('absolute inset-y-0 right-2 my-auto h-6 w-6', 'flex items-center justify-center rounded')}
        >
          <CircleEraseIcon size={24} />
        </button>
      )}
    </div>
  );
}

export { ClearableInput };
