export interface YarnItem {
  id: string;
  name: string;
  brand: string;
  article: string;
  composition: string;
  color: string;
  colorHex: string;
  weight: string; // вес мотка, например "100 г"
  length: string; // длина, например "200 м"
  needleSize: string; // рекомендуемый размер спиц
  notes: string;
  photo: string; // base64
  quantity: number; // количество мотков
  dateAdded: string;
}


+++ src/types.ts (修改后)
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
