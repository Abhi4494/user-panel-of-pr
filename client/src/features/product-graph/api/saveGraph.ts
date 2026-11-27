import { postApi } from '@/lib/apiData';
import type { ExtraSeriesEntry } from '@/features/product-graph/components/PriceChart';
import type { ProductGraph, ProductInfo } from '@/features/product-graph/types';

const toId = (value: string | number) =>
  typeof value === 'number' ? value : (value !== '' && Number.isFinite(Number(value)) ? Number(value) : value);

/**
 * Adds the graph being viewed (this product, place, currency and unit) to the user's dashboard under a title and summary.
 * `POST /api/v1/user-panel/save-graph`. Throws an `Error` whose message is safe to show.
 */
export const saveGraph = (
  title: string,
  description: string,
  graph: ProductGraph,
  info: ProductInfo,
  extraSeries: ExtraSeriesEntry[] = [],
) =>
  postApi(
    '/api/v1/user-panel/save-graph',
    {
      title,
      description,
      graphOptions: {
        UnitId: toId(graph.filters.unitId),
        Curriencies: graph.filters.currency, // (sic) the API's spelling
        GraphProductLocation: [
          { ProductId: toId(info.productId), LocationId: toId(info.locationId), IsDefault: true },
          ...extraSeries
            .filter((s) => s.productId != null && s.locationId != null)
            .map((s) => ({ ProductId: toId(s.productId!), LocationId: toId(s.locationId!), IsDefault: false })),
        ],
        YAxisAnnotation: { text: '' },
        GraphPointAnnotations: [],
      },
    },
    'We could not add this graph to your dashboard right now. Please try again.',
  );
