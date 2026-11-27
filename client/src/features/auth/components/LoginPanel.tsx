import { Mail, Phone } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { PanelBackdrop } from './PanelBackdrop';
import { PanelContact } from './PanelContact';

const CONTACT_PHONE = '+1 307 363 1045';
const CONTACT_EMAIL = 'sales@procurementresource.com';

/** Gradient panel for the login card (legacy login copy, unchanged). */
export function LoginPanel() {
  return (
    <>
      <PanelBackdrop glow="left" />

      <div className="my-auto space-y-4">
        <Heading level={1} size="display" className="text-white">
          <span className="block text-title font-normal">Welcome to</span>
          Procurement Resource
        </Heading>
        <p className="border-y border-white/15 py-4 text-sm leading-relaxed text-white/85">
          In this era of globalisation and continuous economic changes, comprehensive market intelligence and research
          have become an important aspect of doing a business. Intense competition in all the industries has made the
          sourcing of various goods and services an important aspect of maintaining profitability and staying at the
          forefront of one’s industry.
        </p>

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
