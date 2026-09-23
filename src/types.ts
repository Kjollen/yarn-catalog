export interface YarnItem {
  id: string;
  name: string;
  brand: string;
  article: string;
  composition: string;
  color: string;
  colorHex: string;
  totalWeight: string;
  meteragePer100g: string;
  needleSize: string;
  notes: string;
  photo: string;
  quantity: number;
  shop: string;
  orderNumber: string;
  pricePerGram: string;
  totalPrice: string;
  dateAdded: string;
}

export interface Project {
  id: string;
  yarnItemId: string;
  name: string;
  photo: string;
  yarnUsedWeight: string;
  needleSize: string;
  pattern: string;
  notes: string;
  startDate: string;
  endDate: string;
  status: 'in-progress' | 'completed' | 'planned';
  dateAdded: string;
}
