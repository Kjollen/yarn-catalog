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
  dateAdded: string;
}

export interface Project {
  id: string;
  yarnItemId: string; // ID пряжи, из которой вязали
  name: string; // название изделия (например, "Кардиган для мамы")
  photo: string; // фото готового изделия
  yarnUsedWeight: string; // сколько ушло пряжи (например, "450 г")
  needleSize: string; // какими спицами вязался
  pattern: string; // описание/ссылка на схему
  notes: string; // заметки
  startDate: string; // когда начали
  endDate: string; // когда закончили (если закончили)
  status: 'in-progress' | 'completed' | 'planned'; // статус
  dateAdded: string;
}
