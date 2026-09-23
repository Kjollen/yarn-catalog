import { compressImage } from '../utils/imageCompression';
import React, { useState, useRef } from 'react';
import { Project } from '../types';

interface ProjectFormProps {
  onSubmit: (project: Omit<Project, 'id' | 'dateAdded'>) => void;
  onCancel: () => void;
  initialData?: Project | null;
  yarnItemName: string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, onCancel, initialData, yarnItemName }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [photo, setPhoto] = useState(initialData?.photo || '');
  const [yarnUsedWeight, setYarnUsedWeight] = useState(initialData?.yarnUsedWeight || '');
  const [needleSize, setNeedleSize] = useState(initialData?.needleSize || '');
  const [pattern, setPattern] = useState(initialData?.pattern || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [status, setStatus] = useState<'in-progress' | 'completed' | 'planned'>(initialData?.status || 'in-progress');
  const [pasteHint, setPasteHint] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const compressed = await compressImage(base64, 1200, 1200, 0.8);
      resolve(compressed);
    };
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
      yarnItemId: initialData?.yarnItemId || '',
      name,
      photo,
      yarnUsedWeight,
      needleSize,
      pattern,
      notes,
      startDate,
      endDate,
      status,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? 'Редактировать проект' : 'Новый проект'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Пряжа: {yarnItemName}</p>
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
                <img src={photo} alt="Проект" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-purple-400 group-hover:text-purple-600">
                  <i className="fas fa-camera text-4xl mb-2"></i>
                  <p className="text-sm">Фото изделия</p>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название изделия *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Например: Кардиган для мамы"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Статус
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'in-progress' | 'completed' | 'planned')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="planned">Запланировано</option>
              <option value="in-progress">В процессе</option>
              <option value="completed">Завершено</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Расход пряжи
              </label>
              <input
                type="text"
                value={yarnUsedWeight}
                onChange={(e) => setYarnUsedWeight(e.target.value)}
                placeholder="450 г"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Спицы
              </label>
              <input
                type="text"
                value={needleSize}
                onChange={(e) => setNeedleSize(e.target.value)}
                placeholder="4 мм"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Схема / описание
            </label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Ссылка или название схемы"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата начала
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата завершения
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Заметки
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Особенности вязания, размеры, впечатления..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              {initialData ? 'Сохранить' : 'Создать'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
