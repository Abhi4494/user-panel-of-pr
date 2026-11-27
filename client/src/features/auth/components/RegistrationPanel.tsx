import { Mail, Phone } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { PanelContact } from './PanelContact';

const CONTACT_PHONE = '+1 307 363 1045';
const CONTACT_EMAIL = 'sales@procurementresource.com';

const STATS = [
  { value: '12k+', label: 'Products tracked' },
  { value: '95+', label: 'Countries covered' },
  { value: '24/7', label: 'Data updates' },
] as const;

const monoLabel = 'font-mono text-eyebrow tracking-[0.2em] uppercase';

/** Gradient marketing panel for the registration card. */
export function RegistrationPanel() {
  return (
    <>
      {/* Decorative circles (registration background) */}
      <span aria-hidden className="absolute -top-40 -right-40 -z-10 size-108 rounded-full bg-white/5" />
      <span aria-hidden className="absolute -bottom-28 -left-24 -z-10 size-64 rounded-full bg-accent/40" />
      <span aria-hidden className="absolute -right-0 -bottom-8 -z-10 size-36 rounded-full bg-white/10" />

      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-caption font-medium">
        <span aria-hidden className="size-1.5 rounded-full bg-accent-soft" />
        Trusted since 2015
      </span>

      <div className="my-auto space-y-4">
        <p className={`${monoLabel} text-white/60`}>Welcome to</p>
        <Heading level={1} size="display" className="text-white">
          Procurement Resource
        </Heading>
        <p className="max-w-md text-sm leading-relaxed text-white/80">
          Comprehensive market intelligence and research to sharpen sourcing decisions, track price movements, and stay
          ahead of shifting demand.
        </p>

        <dl className="grid grid-cols-3 gap-4 border-y border-white/15 py-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dd className="text-lg font-semibold">{stat.value}</dd>
              <dt className="text-caption text-white/70">{stat.label}</dt>
            </div>
          ))}
        </dl>

        <ul className="space-y-3">
          <PanelContact icon={<Phone size={18} aria-hidden />} label="Call us">
            <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`}>{CONTACT_PHONE}</a>
          </PanelContact>
          <PanelContact icon={<Mail size={18} aria-hidden />} label="Mail us">
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </PanelContact>
        </ul>
      </div>
    </>
  );
}
