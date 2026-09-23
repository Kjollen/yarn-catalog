import React, { useState, useRef } from 'react';
import { YarnItem } from '../types';

interface YarnFormProps {
  onSubmit: (item: Omit<YarnItem, 'id' | 'dateAdded'>) => void;
  onCancel: () => void;
  initialData?: YarnItem | null;
}

const YarnForm: React.FC<YarnFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [article, setArticle] = useState(initialData?.article || '');
  const [composition, setComposition] = useState(initialData?.composition || '');
  const [color, setColor] = useState(initialData?.color || '');
  const [colorHex, setColorHex] = useState(initialData?.colorHex || '#e8d5b7');
  const [totalWeight, setTotalWeight] = useState(initialData?.totalWeight || '');
  const [meteragePer100g, setMeteragePer100g] = useState(initialData?.meteragePer100g || '');
  const [needleSize, setNeedleSize] = useState(initialData?.needleSize || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [photo, setPhoto] = useState(initialData?.photo || '');
  const [quantity, setQuantity] = useState(initialData?.quantity || 1);
  const [shop, setShop] = useState(initialData?.shop || '');
  const [orderNumber, setOrderNumber] = useState(initialData?.orderNumber || '');
  const [pricePerGram, setPricePerGram] = useState(initialData?.pricePerGram || '');
  const [totalPrice, setTotalPrice] = useState(initialData?.totalPrice || '');
  const [pasteHint, setPasteHint] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setPhoto(base64);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const base64 = await fileToBase64(blob);
          setPhoto(base64);
          setPasteHint('Фото вставлено из буфера ✓');
          setTimeout(() => setPasteHint(''), 2000);
          e.preventDefault();
          return;
        }
      }
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        setPasteHint('Используйте долгое нажатие → Вставить в области фото, или Ctrl+V.');
        setTimeout(() => setPasteHint(''), 3000);
        return;
      }
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const base64 = await fileToBase64(new File([blob], 'paste.png', { type: imageType }));
          setPhoto(base64);
          setPasteHint('Фото вставлено из буфера ✓');
          setTimeout(() => setPasteHint(''), 2000);
          return;
        }
      }
      setPasteHint('В буфере нет изображения');
      setTimeout(() => setPasteHint(''), 2000);
    } catch (err) {
      setPasteHint('Нет доступа к буферу. Разрешите доступ или используйте долгое нажатие → Вставить.');
      setTimeout(() => setPasteHint(''), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      brand,
      article,
      composition,
      color,
      colorHex,
      totalWeight,
      meteragePer100g,
      needleSize,
      notes,
      photo,
      quantity,
      shop,
      orderNumber,
      pricePerGram,
      totalPrice,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? 'Редактировать пряжу' : 'Добавить пряжу'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5" onPaste={handlePaste}>
          <div className="flex flex-col items-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              onPaste={handlePaste}
              tabIndex={0}
              className="w-48 h-48 border-2 border-dashed border-purple-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all overflow-hidden group outline-none focus:border-purple-500"
            >
              {photo ? (
                <img src={photo} alt="Пряжа" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-purple-400 group-hover:text-purple-600">
                  <i className="fas fa-camera text-4xl mb-2"></i>
                  <p className="text-sm">Добавить фото</p>
                  <p className="text-xs mt-1 text-gray-400">или Ctrl+V / Cmd+V</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <div className="flex gap-2 mt-2 flex-wrap justify-center">
              {photo ? (
                <button
                  type="button"
                  onClick={() => setPhoto('')}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  <i className="fas fa-trash mr-1"></i>Удалить
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <i className="fas fa-paste"></i>
                  Вставить из буфера
                </button>
              )}
            </div>
            {pasteHint && (
              <p className={`mt-2 text-xs ${pasteHint.includes('✓') ? 'text-green-600' : 'text-orange-600'}`}>
                {pasteHint}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Например: Alize Lana Gold" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Производитель</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Например: Alize" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Артикул</label>
              <input type="text" value={article} onChange={(e) => setArticle(e.target.value)} placeholder="Например: 104" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Состав</label>
            <input type="text" value={composition} onChange={(e) => setComposition(e.target.value)} placeholder="Например: 49% шерсть, 51% акрил" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Цвет / оттенок</label>
              <input type="text" value={color} onChange={(e) => setColor(e.target.value)} placeholder="Например: бежевый меланж" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Цвет (выбрать)</label>
              <div className="flex items-center gap-3">
                <input type="color" value={colorHex} onChange={(e) => setColorHex(e.target.value)} className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer" />
                <span className="text-sm text-gray-500">{colorHex}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Общий вес бобины</label>
              <input type="text" value={totalWeight} onChange={(e) => setTotalWeight(e.target.value)} placeholder="850 г" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Метраж на 100 г</label>
              <input type="text" value={meteragePer100g} onChange={(e) => setMeteragePer100g(e.target.value)} placeholder="350 м" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Спицы</label>
              <input type="text" value={needleSize} onChange={(e) => setNeedleSize(e.target.value)} placeholder="4-5 мм" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Количество бобин</label>
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              <i className="fas fa-shopping-bag mr-2 text-purple-500"></i>
              Информация о покупке
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Где куплена</label>
                <input type="text" value={shop} onChange={(e) => setShop(e.target.value)} placeholder="Например: Wildberries, Алиэкспресс" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Номер заказа</label>
                <input type="text" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="Например: 12345678" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Цена за грамм</label>
                <input type="text" value={pricePerGram} onChange={(e) => setPricePerGram(e.target.value)} placeholder="Например: 2.5 руб/г" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Общая сумма</label>
                <input type="text" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} placeholder="Например: 2125 руб" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Заметки</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Для чего подходит, особенности вязания..." rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none" />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="submit" className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
              {initialData ? 'Сохранить' : 'Добавить'}
            </button>
            <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default YarnForm;
