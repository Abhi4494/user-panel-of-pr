import { RefreshCw } from 'lucide-react';
import { useId, type InputHTMLAttributes } from 'react';
import { FieldError, softInputClass } from '@/components/ui/TextField';
import { CAPTCHA_VIEW, type CaptchaChallenge } from '@/features/auth/captcha';

interface CaptchaFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'name'> {
  id: string;
  name: string;
  challenge: CaptchaChallenge;
  onRefresh: () => void;
  error?: string;
  wrapperClassName?: string;
}

const controlHeight = 'h-(--density-control-h)';

/** Captcha: three separate controls — digit image, refresh button, answer input. */
export function CaptchaField({
  id,
  name,
  challenge,
  onRefresh,
  error,
  wrapperClassName,
  ...inputProps
}: CaptchaFieldProps) {
  const errorId = `${id}-error`;
  const patternId = useId();
  const { width, height } = CAPTCHA_VIEW;

  return (
    <div className={`group relative ${wrapperClassName ?? ''}`}>
      <div className="flex items-stretch gap-2">
        <svg
          role="img"
          aria-label={`Captcha code ${challenge.code.split('').join(' ')}`}
          viewBox={`0 0 ${width} ${height}`}
          className={`${controlHeight} w-28 shrink-0 rounded-lg border border-soft-border bg-soft-field select-none`}
        >
          <defs>
            <pattern id={patternId} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" strokeWidth="1" className="stroke-soft-border" />
            </pattern>
          </defs>
          <rect width={width} height={height} fill={`url(#${patternId})`} />
          {challenge.glyphs.map((glyph, i) => (
            <text
              key={i}
              x={glyph.x}
              y={glyph.y}
              transform={`rotate(${glyph.rotate.toFixed(1)} ${glyph.x.toFixed(1)} ${glyph.y.toFixed(1)})`}
              className={`font-heading text-2xl font-bold ${glyph.colorClass} ${glyph.italic ? 'italic' : ''}`}
            >
              {glyph.char}
            </text>
          ))}
        </svg>

        <button
          type="button"
          onClick={onRefresh}
          aria-label="Refresh captcha"
          className={`${controlHeight} flex w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-soft-border bg-soft-field text-accent transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
        >
          <RefreshCw size={16} aria-hidden />
        </button>

        <input
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          maxLength={4}
          autoComplete="off"
          placeholder="Enter captcha"
          aria-label="Enter captcha"
          className={`${softInputClass} ${controlHeight} min-w-0 flex-1 border ${error ? 'border-invalid-border bg-invalid-bg' : 'border-soft-border bg-soft-field'}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
        />
      </div>
      <FieldError id={errorId} placement="above">
        {error}
      </FieldError>
    </div>
  );
}
