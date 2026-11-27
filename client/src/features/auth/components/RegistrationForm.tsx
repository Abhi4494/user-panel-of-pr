import { ArrowRight } from 'lucide-react';
import { useRef, useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react';
import { Checkbox } from '@/components/ui/Checkbox';
import { Link } from '@/components/ui/Link';
import { PhoneField } from '@/components/ui/PhoneField';
import { SoftButton } from '@/components/ui/SoftButton';
import { TextField } from '@/components/ui/TextField';
import { showToast } from '@/components/ui/Toaster';
import { register } from '@/features/auth/api/register';
import { useCaptcha } from '@/features/auth/captcha';
import { DEFAULT_DIAL_COUNTRY, DIAL_CODES } from '@/features/auth/dialCodes';
import {
  validateRegistrationField,
  validateRegistrationForm,
  type RegistrationErrors,
  type RegistrationField,
  type RegistrationValues,
} from '@/features/auth/registrationValidation';
import { validationMessages } from '@/features/auth/validation';
import { navigate } from '@/router';
import { CaptchaField } from './CaptchaField';
import { ProductSelect } from './ProductSelect';

const initialValues: RegistrationValues = {
  fullName: '',
  phone: '',
  product: [],
  company: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false,
  captcha: '',
};

const linkClass = 'font-semibold text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent';

export function RegistrationForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [dialCountry, setDialCountry] = useState(DEFAULT_DIAL_COUNTRY);
  const { challenge, refresh } = useCaptcha();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Latest values for the product blur, which fires in the same tick as a selection.
  const valuesRef = useRef(values);
  valuesRef.current = values;

  function refreshCaptcha() {
    refresh();
    setValues((prev) => ({ ...prev, captcha: '' }));
    setErrors((prev) => ({ ...prev, captcha: undefined }));
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const field = event.target.name as RegistrationField;
    const next = {
      ...values,
      [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    };
    setValues(next);
    // Once a field has failed, re-validate as the user edits (matches the login form).
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validateRegistrationField(field, next, challenge) ?? undefined,
      }));
    }
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    const field = event.target.name as RegistrationField;
    setErrors((prev) => ({ ...prev, [field]: validateRegistrationField(field, values, challenge) ?? undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const nextErrors = validateRegistrationForm(values, challenge);
    setErrors(nextErrors);

    const firstInvalid = (Object.keys(values) as RegistrationField[]).find((field) => nextErrors[field]);
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const { terms: _terms, captcha: _captcha, product, ...payload } = values;
      const { message, redirect } = await register({ ...payload, productIds: product.map(Number) });
      // The toaster lives in App, so the message stays visible after moving to the login screen.
      showToast('success', message);
      navigate(redirect);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Unable to register.');
      // The captcha was already used; the user needs a fresh one to retry.
      refreshCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  }

  // The submit button stays disabled until every field is filled and the terms are accepted; the captcha is checked on submit.
  const isComplete = (Object.keys(values) as RegistrationField[]).every((name) => {
    const value = values[name];
    return typeof value === 'boolean' ? value : value.length > 0 && (typeof value !== 'string' || value.trim() !== '');
  });

  const field = (name: RegistrationField) => ({
    id: name,
    name,
    value: values[name] as string,
    onChange: handleChange,
    onBlur: handleBlur,
    error: errors[name],
  });

  return (
    <form noValidate onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-4 gap-y-(--density-gap) sm:grid-cols-2">
      <TextField
        {...field('fullName')}
        label="Full Name"
        placeholder="John Doe"
        autoComplete="name"
        required
      />
      <PhoneField
        {...field('phone')}
        label="Contact Number"
        placeholder="000-1234"
        autoComplete="tel-national"
        required
        dialCodes={DIAL_CODES}
        dialCountry={dialCountry}
        onDialCountryChange={setDialCountry}
      />
      <ProductSelect
        id="product"
        label="Select Product"
        onChange={(productIds) => {
          setValues((prev) => ({ ...prev, product: productIds }));
          setErrors((prev) => ({ ...prev, product: undefined }));
        }}
        onBlur={() =>
          setErrors((prev) => ({ ...prev, product: valuesRef.current.product.length > 0 ? undefined : validationMessages.required }))
        }
        error={errors.product}
        wrapperClassName="sm:col-span-2"
      />
      <TextField
        {...field('company')}
        label="Company Name"
        placeholder="Acme Corp."
        autoComplete="organization"
        required
      />
      <TextField
        {...field('email')}
        type="email"
        label="Business Email"
        placeholder="you@company.com"
        autoComplete="email"
        required
      />
      <TextField
        {...field('password')}
        type="password"
        label="Password"
        placeholder="••••••••"
        autoComplete="new-password"
        required
      />
      <TextField
        {...field('confirmPassword')}
        type="password"
        label="Confirm Password"
        placeholder="••••••••"
        autoComplete="new-password"
        required
      />

      <Checkbox
        id="terms"
        name="terms"
        checked={values.terms}
        onChange={handleChange}
        error={errors.terms}
        className="sm:col-span-2"
      >
        I agree to the{' '}
        <a href="/terms-and-conditions" className={linkClass}>
          Terms &amp; Conditions
        </a>{' '}
        and{' '}
        <a href="/privacy-policy" className={linkClass}>
          Privacy Policy
        </a>
      </Checkbox>

      {/* Captcha + button share a row when there is room (sm, and xl+); in the narrow lg card they stack so neither is squeezed. */}
      <div className="grid items-start gap-x-3 gap-y-(--density-gap) sm:col-span-2 sm:grid-cols-5 lg:grid-cols-1 xl:grid-cols-5">
        <CaptchaField
          {...field('captcha')}
          challenge={challenge}
          onRefresh={refreshCaptcha}
          wrapperClassName="sm:col-span-3 lg:col-span-1 xl:col-span-3"
        />
        <SoftButton type="submit" disabled={!isComplete || isSubmitting} aria-busy={isSubmitting} className="whitespace-nowrap sm:col-span-2 lg:col-span-1 xl:col-span-2">
          Create account
          <ArrowRight size={18} aria-hidden />
        </SoftButton>
      </div>

      <p className="text-sm text-muted sm:col-span-2">
        Already have an account?{' '}
        <Link href="/account/login" className={linkClass}>
          Sign in
        </Link>
      </p>
    </form>
  );
}
