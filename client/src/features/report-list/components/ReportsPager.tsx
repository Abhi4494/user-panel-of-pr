import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toolbarActive, toolbarButton, toolbarIdle } from '@/components/ui/controlButtonStyles';
import { pageWindow } from '@/features/report-list/lib/pageWindow';

interface ReportsPagerProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

const number = new Intl.NumberFormat('en-US');

/** "Showing 1 to 10 of 1,880 entries" and Previous / page numbers / Next (the usual list footer; the reference's was not visible). */
export function ReportsPager({ page, pageSize, total, onPageChange }: ReportsPagerProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const arrow = `${toolbarButton} ${toolbarIdle} disabled:opacity-40 disabled:hover:bg-dash-surface`;

  return (
    <nav aria-label="Pagination" className="mt-6 flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-dash-subtle" aria-live="polite">
        Showing {number.format(from)} to {number.format(to)} of {number.format(total)} entries
      </p>
      <div className="flex items-center gap-0.75">
        <button type="button" className={arrow} disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronLeft size={16} aria-hidden />
        </button>
        {pageWindow(page, pages).map((item, index) =>
          item === '…' ? (
            <span key={`gap-${index}`} aria-hidden className="px-1.5 text-sm text-dash-subtle">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-label={`Page ${item}`}
              aria-current={item === page ? 'page' : undefined}
              className={`${toolbarButton} ${item === page ? toolbarActive : toolbarIdle}`}
            >
              {item}
            </button>
          ),
        )}
        <button type="button" className={arrow} disabled={page >= pages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>
    </nav>
  );
}
