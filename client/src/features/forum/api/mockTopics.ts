import type { ForumTopic } from '@/features/forum/types';

const topic = (id: string, tag: string, title: string, question: string, publishedAt: string, categoryName: string, author?: string): ForumTopic => ({
  id,
  tag,
  title,
  question,
  publishedAt,
  categoryName,
  author,
  href: `/dashboard/discussionforum/${id}`,
});

const OPERATING = 'Operating Costs, Logistics and Utilities';
const AGRI = 'Agriculture, Farming and Commodity';

/** The cards visible in the reference screenshots, in order (real copy). */
export const MOCK_FORUM_TOPICS: ForumTopic[] = [
  topic('coal-injection', 'Coal', 'Coal Injection', 'How will the sanctions on Russia impact the Pulverized Coal Injection (PCI) market?', '2022-06-30', OPERATING),
  topic('needle-coke', 'Coal', 'Needle Coke', 'What are the current production and price trend scenario for Petroleum based Needle Coke in China?', '2022-06-30', OPERATING),
  topic('coal', 'Coal', 'Coal', 'Are there going to be any capacity additions in the coal industry?', '2022-06-30', OPERATING),
  topic('injection-carbon', 'Coal', 'Injection Carbon', 'What is Injection Carbon?', '2022-06-30', OPERATING),
  topic('soybean-price-trends', 'Soybean', 'Soybean Price Trends', 'What is the price scenario in China for Soy protein isolates?', '2022-06-30', AGRI),
  topic('soybean-protein-isolate', 'Soybean', 'Soybean Protein Isolate', 'How is the demand for soy protein Isolates growing in the food industry?', '2022-06-30', AGRI),
  topic('citral-price-trends', 'Methyl Dihydrojasmonate', 'Citral Price Trends', 'On what factors do the prices depend?', '2025-04-04', 'Flavours and Fragrances', 'Veronica Khanna'),
  topic('tin-price-trends', 'Tin', 'Tin Price Trends', 'What is the current scenario of Tin prices in China?', '2022-06-30', 'Energy, Metals and Minerals'),
];
