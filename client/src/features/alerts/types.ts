/** One price alert of the user: notify when `productName` reaches `price` in `locationName`. */
export interface PriceAlert {
  id: string;
  productName: string;
  /** The product's graph page for that location ('' when the API gave no product url). */
  href: string;
  categoryName: string;
  locationName: string;
  price: number;
}
