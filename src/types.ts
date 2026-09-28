export interface YarnItem {
  id: string;
  name: string;
  brand: string;
  article: string;
  composition: string;
  color: string;
  colorHex: string;
  totalWeight: string; // общий вес бобины, например "850 г"
  meteragePer100g: string; // метраж на 100 г, например "350 м"
  needleSize: string; // рекомендуемый размер спиц
  notes: string;
  photo: string; // base64
  quantity: number; // количество бобин
  shop: string; // где куплена
  orderNumber: string; // номер заказа
  pricePerGram: string; // цена за грамм
  totalPrice: string; // общая сумма покупки
  dateAdded: string;
}

export interface YarnUsage {
  yarnItemId: string;
  weight: string; // расход этой пряжи, например "350 г"
}

export interface Project {
  id: string;
  yarnUsage: YarnUsage[]; // массив: несколько видов пряжи с各自的 расходом
  name: string; // название изделия (например, "Кардиган для мамы")
  photo: string; // фото готового изделия
  needleSize: string; // какими спицами вязался
  pattern: string; // описание/ссылка на схему
  notes: string; // заметки
  startDate: string; // когда начали
  endDate: string; // когда закончили (если закончили)
  status: 'in-progress' | 'completed' | 'planned'; // статус
  dateAdded: string;
}
