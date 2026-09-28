import React, { useState, useRef } from 'react';
import { Sample, YarnItem, YarnUsage, SampleMeasurements } from '../types';
import { compressImage } from '../utils/imageCompression';

interface SampleFormProps {
  onSubmit: (sample: Omit<Sample, 'id' | 'dateAdded'>) => void;
  onCancel: () => void;
  initialData?: Sample | null;
  yarnItems: YarnItem[];
}

const emptyMeasurements: SampleMeasurements = {
  width: '',
  height: '',
  stitches: '',
  rows: '',
};

const SampleForm: React.FC<SampleFormProps> = ({ onSubmit, onCancel, initialData, yarnItems }) => {
  const [yarnUsage, setYarnUsage] = useState<YarnUsage[]>(
    initialData?.yarnUsage || [{ yarnItemId: '', weight: '' }]
  );
  const [needleSize, setNeedleSize] = useState(initialData?.needleSize || '');
  const [sampleWeight, setSampleWeight] = useState(initialData?.sampleWeight || '');
  const [beforePhoto, setBeforePhoto] = useState(initialData?.beforeWetBlocking?.photo || '');
  const [beforeMeasurements, setBeforeMeasurements] = useState<SampleMeasurements>(
    initialData?.beforeWetBlocking?.measurements || emptyMeasurements
  );
  const [afterPhoto, setAfterPhoto] = useState(initialData?.afterWetBlocking?.photo || '');
  const [afterMeasurements, setAfterMeasurements] = useState<SampleMeasurements>(
    initialData?.afterWetBlocking?.measurements || emptyMeasurements
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [pasteHint, setPasteHint] = useState('');
  const [activePhotoField, setActivePhotoField] = useState<'before' | 'after' | null>(null);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

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

  const handleBeforePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setBeforePhoto(base64);
    }
  };

  const handleAfterPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setAfterPhoto(base64);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (!activePhotoField) return;
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const base64 = await fileToBase64(blob);
          if (activePhotoField === 'before') {
            setBeforePhoto(base64);
          } else {
            setAfterPhoto(base64);
          }
          setPasteHint('Фото вставлено из буфера ✓');
          setTimeout(() => setPasteHint(''), 2000);
          e.preventDefault();
          return;
        }
      }
    }
  };

  const addYarnUsage = () => {
    if (yarnUsage.length < 6) {
      setYarnUsage([...yarnUsage, { yarnItemId: '', weight: '' }]);
    }
  };

  const removeYarnUsage = (index: number) => {
    setYarnUsage(yarnUsage.filter((_, i) => i !== index));
  };

  const updateYarnUsage = (index: number, field: keyof YarnUsage, value: string) => {
    const updated = [...yarnUsage];
    updated[index] = { ...updated[index], [field]: value };
    setYarnUsage(updated);
  };

  const updateBeforeMeasurements = (field: keyof SampleMeasurements, value: string) => {
    setBeforeMeasurements({ ...beforeMeasurements, [field]: value });
  };

  const updateAfterMeasurements = (field: keyof SampleMeasurements, value: string) => {
    setAfterMeasurements({ ...afterMeasurements, [field]: value });
  };

  // Калькулятор: метраж на 100г по площади образца
  const calculateMeteragePer100g = (measurements: SampleMeasurements): string | null => {
    const weight = parseFloat(sampleWeight.replace(/[^\d.]/g, ''));
    const width = parseFloat(measurements.width.replace(/[^\d.]/g, ''));
    const height = parseFloat(measurements.height.replace(/[^\d.]/g, ''));

    if (!isNaN(weight) && !isNaN(width) && !isNaN(height) && weight > 0 && width > 0 && height > 0) {
      // Площадь образца в см²
      const area = width * height;
      // Метраж на 100г = (100 / вес_образца) * (метраж_в_образце)
      // Но мы не знаем метраж в образце напрямую...
      // Можно рассчитать только если знаем метраж на 100г пряжи
      // Или показать площадь и плотность
      return null; // Пока не реализовано, нужна доп. информация
    }
    return null;
  };

  // Плотность вязания: петель на 10 см
  const calculateStitchesPer10cm = (measurements: SampleMeasurements): string | null => {
    const stitches = parseFloat(measurements.stitches);
    const width = parseFloat(measurements.width.replace(/[^\d.]/g, ''));

    if (!isNaN(stitches) && !isNaN(width) && width > 0) {
      const per10cm = (stitches / width) * 10;
      return per10cm.toFixed(1);
    }
    return null;
  };

  // Плотность вязания: рядов на 10 см
  const calculateRowsPer10cm = (measurements: SampleMeasurements): string | null => {
    const rows = parseFloat(measurements.rows);
    const height = parseFloat(measurements.height.replace(/[^\d.]/g, ''));

    if (!isNaN(rows) && !isNaN(height) && height > 0) {
      const per10cm = (rows / height) * 10;
      return per10cm.toFixed(1);
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      yarnUsage,
      needleSize,
      sampleWeight,
      beforeWetBlocking: {
        photo: beforePhoto,
        measurements: beforeMeasurements,
      },
      afterWetBlocking: {
        photo: afterPhoto,
        measurements: afterMeasurements,
      },
      notes,
    });
  };

  const stitchesPer10cmBefore = calculateStitchesPer10cm(beforeMeasurements);
  const rowsPer10cmBefore = calculateRowsPer10cm(beforeMeasurements);
  const stitchesPer10cmAfter = calculateStitchesPer10cm(afterMeasurements);
  const rowsPer10cmAfter = calculateRowsPer10cm(afterMeasurements);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? 'Редактировать образец' : 'Новый образец'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5" onPaste={handlePaste}>
          {/* Пряжа */}
          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">
                <i className="fas fa-yarn-ball mr-2 text-purple-500"></i>
                Пряжа (до 6 видов)
              </h3>
              {yarnUsage.length < 6 && (
                <button
                  type="button"
                  onClick={addYarnUsage}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  <i className="fas fa-plus"></i>
                  Добавить
                </button>
              )}
            </div>

            <div className="space-y-2">
              {yarnUsage.map((usage, index) => (
                <div key={index} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg">
                  <div className="flex-1">
                    <select
                      value={usage.yarnItemId}
                      onChange={(e) => updateYarnUsage(index, 'yarnItemId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                    >
                      <option value="">Выберите пряжу</option>
                      {yarnItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} {item.brand ? `(${item.brand})` : ''} {item.color ? `- ${item.color}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  {yarnUsage.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeYarnUsage(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Спицы и вес */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Размер спиц
              </label>
              <input
                type="text"
                value={needleSize}
                onChange={(e) => setNeedleSize(e.target.value)}
                placeholder="Например: 4 мм"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Вес образца
              </label>
              <input
                type="text"
                value={sampleWeight}
                onChange={(e) => setSampleWeight(e.target.value)}
                placeholder="Например: 15 г"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* До ВТО */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              <i className="fas fa-camera mr-2 text-blue-500"></i>
              До ВТО
            </h3>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Фото */}
              <div className="flex-shrink-0">
                <div
                  onClick={() => {
                    setActivePhotoField('before');
                    beforeInputRef.current?.click();
                  }}
                  className="w-48 h-48 border-2 border-dashed border-blue-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all overflow-hidden"
                >
                  {beforePhoto ? (
                    <img src={beforePhoto} alt="До ВТО" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-blue-400">
                      <i className="fas fa-camera text-3xl mb-2"></i>
                      <p className="text-xs">Фото до ВТО</p>
                    </div>
                  )}
                </div>
                <input
                  ref={beforeInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBeforePhotoChange}
                  className="hidden"
                />
                {beforePhoto && (
                  <button
                    type="button"
                    onClick={() => setBeforePhoto('')}
                    className="mt-2 text-xs text-red-500 hover:text-red-700"
                  >
                    Удалить фото
                  </button>
                )}
              </div>

              {/* Замеры */}
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Ширина (см)</label>
                    <input
                      type="text"
                      value={beforeMeasurements.width}
                      onChange={(e) => updateBeforeMeasurements('width', e.target.value)}
                      placeholder="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Высота (см)</label>
                    <input
                      type="text"
                      value={beforeMeasurements.height}
                      onChange={(e) => updateBeforeMeasurements('height', e.target.value)}
                      placeholder="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Петель по ширине</label>
                    <input
                      type="text"
                      value={beforeMeasurements.stitches}
                      onChange={(e) => updateBeforeMeasurements('stitches', e.target.value)}
                      placeholder="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Рядов по высоте</label>
                    <input
                      type="text"
                      value={beforeMeasurements.rows}
                      onChange={(e) => updateBeforeMeasurements('rows', e.target.value)}
                      placeholder="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Калькулятор */}
                {(stitchesPer10cmBefore || rowsPer10cmBefore) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Плотность вязания:</p>
                    {stitchesPer10cmBefore && (
                      <p className="text-sm text-blue-900">
                        <i className="fas fa-arrows-alt-h mr-1"></i>
                        {stitchesPer10cmBefore} петель на 10 см
                      </p>
                    )}
                    {rowsPer10cmBefore && (
                      <p className="text-sm text-blue-900">
                        <i className="fas fa-arrows-alt-v mr-1"></i>
                        {rowsPer10cmBefore} рядов на 10 см
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* После ВТО */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              <i className="fas fa-camera mr-2 text-green-500"></i>
              После ВТО
            </h3>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Фото */}
              <div className="flex-shrink-0">
                <div
                  onClick={() => {
                    setActivePhotoField('after');
                    afterInputRef.current?.click();
                  }}
                  className="w-48 h-48 border-2 border-dashed border-green-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all overflow-hidden"
                >
                  {afterPhoto ? (
                    <img src={afterPhoto} alt="После ВТО" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-green-400">
                      <i className="fas fa-camera text-3xl mb-2"></i>
                      <p className="text-xs">Фото после ВТО</p>
                    </div>
                  )}
                </div>
                <input
                  ref={afterInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAfterPhotoChange}
                  className="hidden"
                />
                {afterPhoto && (
                  <button
                    type="button"
                    onClick={() => setAfterPhoto('')}
                    className="mt-2 text-xs text-red-500 hover:text-red-700"
                  >
                    Удалить фото
                  </button>
                )}
              </div>

              {/* Замеры */}
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Ширина (см)</label>
                    <input
                      type="text"
                      value={afterMeasurements.width}
                      onChange={(e) => updateAfterMeasurements('width', e.target.value)}
                      placeholder="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Высота (см)</label>
                    <input
                      type="text"
                      value={afterMeasurements.height}
                      onChange={(e) => updateAfterMeasurements('height', e.target.value)}
                      placeholder="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Петель по ширине</label>
                    <input
                      type="text"
                      value={afterMeasurements.stitches}
                      onChange={(e) => updateAfterMeasurements('stitches', e.target.value)}
                      placeholder="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Рядов по высоте</label>
                    <input
                      type="text"
                      value={afterMeasurements.rows}
                      onChange={(e) => updateAfterMeasurements('rows', e.target.value)}
                      placeholder="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Калькулятор */}
                {(stitchesPer10cmAfter || rowsPer10cmAfter) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                    <p className="text-xs font-semibold text-green-700 mb-1">Плотность вязания:</p>
                    {stitchesPer10cmAfter && (
                      <p className="text-sm text-green-900">
                        <i className="fas fa-arrows-alt-h mr-1"></i>
                        {stitchesPer10cmAfter} петель на 10 см
                      </p>
                    )}
                    {rowsPer10cmAfter && (
                      <p className="text-sm text-green-900">
                        <i className="fas fa-arrows-alt-v mr-1"></i>
                        {rowsPer10cmAfter} рядов на 10 см
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Заметки */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Заметки
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Особенности образца, поведение пряжи..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {pasteHint && (
            <p className="text-sm text-green-600 text-center">{pasteHint}</p>
          )}

          {/* Кнопки */}
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

export default SampleForm;
