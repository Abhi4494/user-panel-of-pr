import { postApi } from '@/lib/apiData';

export const deleteSavedGraph = (graphDashboardId: number) =>
  postApi(
    '/api/v1/user-panel/delete-graph',
    { graphDashboardId },
    'We could not delete this graph right now. Please try again.',
  );
