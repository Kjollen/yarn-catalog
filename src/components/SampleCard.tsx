import React, { useState } from 'react';
import { Sample, YarnItem } from '../types';

interface SampleCardProps {
  sample: Sample;
  yarnItems: YarnItem[];
  onEdit: (sample: Sample) => void;
  onDelete: (id: string) => void;
}

const SampleCard: React.FC<SampleCardProps> = ({ sample, yarnItems, onEdit, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getYarnName = (yarnItemId: string) => {
    const yarn = yarnItems.find(y => y.id === yarnItemId);
    return yarn ? `${yarn.name}${yarn.brand ? ` (${yarn.brand})` : ''}` : 'Неизвестная пряжа';
  };

  // Калькулятор плотности
  const calculateDensity = (stitches: string, rows: string, width: string, height: string) => {
    const stitchesNum = parseFloat(stitches);
    const rowsNum = parseFloat(rows);
    const widthNum = parseFloat(width.replace(/[^\d.]/g, ''));
    const heightNum = parseFloat(height.replace(/[^\d.]/g, ''));

    const result = {
      stitchesPer10cm: '',
      rowsPer10cm: '',
    };

    if (!isNaN(stitchesNum) && !isNaN(widthNum) && widthNum > 0) {
      result.stitchesPer10cm = ((stitchesNum / widthNum) * 10).toFixed(1);
    }

    if (!isNaN(rowsNum) && !isNaN(heightNum) && heightNum > 0) {
      result.rowsPer10cm = ((rowsNum / heightNum) * 10).toFixed(1);
    }

    return result;
  };

  const beforeDensity = calculateDensity(
    sample.beforeWetBlocking?.measurements?.stitches || '',
    sample.beforeWetBlocking?.measurements?.rows || '',
    sample.beforeWetBlocking?.measurements?.width || '',
    sample.beforeWetBlocking?.measurements?.height || ''
  );

  const afterDensity = calculateDensity(
    sample.afterWetBlocking?.measurements?.stitches || '',
    sample.afterWetBlocking?.measurements?.rows || '',
    sample.afterWetBlocking?.measurements?.width || '',
    sample.afterWetBlocking?.measurements?.height || ''
  );

  // Главная фотография (после ВТО приоритетнее)
  const mainPhoto = sample.afterWetBlocking?.photo || sample.beforeWetBlocking?.photo;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group">
        {mainPhoto && (
          <div
            className="h-40 bg-gray-100 overflow-hidden cursor-pointer relative"
            onClick={() => setShowDetails(true)}
          >
            <img
              src={mainPhoto}
              alt="Образец"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {sample.beforeWetBlocking?.photo && sample.afterWetBlocking?.photo && (
              <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-purple-700 shadow">
                До / После ВТО
              </div>
            )}
          </div>
        )}
        <div className="p-4">
          <div className="space-y-1 text-sm text-gray-600">
            {/* Пряжа */}
            {sample.yarnUsage && sample.yarnUsage.length > 0 && (
              <div className="space-y-0.5">
                {sample.yarnUsage.map((usage, index) => (
                  <p key={index} className="flex items-center gap-2">
                    <i className="fas fa-yarn-ball text-xs text-purple-400 w-4"></i>
                    <span className="truncate">{getYarnName(usage.yarnItemId)}</span>
                  </p>
                ))}
              </div>
            )}

            {/* Спицы */}
            {sample.needleSize && (
              <p className="flex items-center gap-2">
                <i className="fas fa-ruler text-xs text-purple-400 w-4"></i>
                Спицы: {sample.needleSize}
              </p>
            )}

            {/* Вес */}
            {sample.sampleWeight && (
              <p className="flex items-center gap-2">
                <i className="fas fa-weight-hanging text-xs text-purple-400 w-4"></i>
                Вес: {sample.sampleWeight}
              </p>
            )}

            {/* Плотность после ВТО */}
            {(afterDensity.stitchesPer10cm || afterDensity.rowsPer10cm) && (
              <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
                <p className="text-xs font-semibold text-green-700 mb-1">Плотность (после ВТО):</p>
                {afterDensity.stitchesPer10cm && (
                  <p className="text-xs text-green-900">
                    {afterDensity.stitchesPer10cm} п. × {afterDensity.rowsPer10cm || '?'} р. на 10 см
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowDetails(true)}
              className="flex-1 text-xs py-1.5 px-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              Подробнее
            </button>
            <button
              onClick={() => onEdit(sample)}
              className="text-xs py-1.5 px-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <i className="fas fa-pen text-xs"></i>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs py-1.5 px-2 bg-gray-50 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              <i className="fas fa-trash text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Модальное окно с деталями */}
      {showDetails && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Образец</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Пряжа */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-yarn-ball mr-2 text-purple-500"></i>
                  Пряжа
                </h3>
                <div className="space-y-1">
                  {sample.yarnUsage && sample.yarnUsage.length > 0 ? (
                    sample.yarnUsage.map((usage, index) => (
                      <p key={index} className="text-sm text-gray-800 flex items-center gap-2">
                        <i className="fas fa-circle text-xs text-purple-400"></i>
                        {getYarnName(usage.yarnItemId)}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">Пряжа не указана</p>
                  )}
                </div>
              </div>

              {/* Спицы и вес */}
              <div className="grid grid-cols-2 gap-3">
                {sample.needleSize && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Спицы</p>
                    <p className="font-medium text-gray-800">{sample.needleSize}</p>
                  </div>
                )}
                {sample.sampleWeight && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Вес образца</p>
                    <p className="font-medium text-gray-800">{sample.sampleWeight}</p>
                  </div>
                )}
              </div>

              {/* До ВТО */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  <i className="fas fa-camera mr-2 text-blue-500"></i>
                  До ВТО
                </h3>
                <div className="flex flex-col md:flex-row gap-4">
                  {sample.beforeWetBlocking?.photo && (
                    <div className="flex-shrink-0">
                      <img
                        src={sample.beforeWetBlocking.photo}
                        alt="До ВТО"
                        className="w-48 h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {sample.beforeWetBlocking?.measurements?.width && (
                        <div>
                          <p className="text-xs text-gray-500">Ширина</p>
                          <p className="text-gray-800">{sample.beforeWetBlocking.measurements.width} см</p>
                        </div>
                      )}
                      {sample.beforeWetBlocking?.measurements?.height && (
                        <div>
                          <p className="text-xs text-gray-500">Высота</p>
                          <p className="text-gray-800">{sample.beforeWetBlocking.measurements.height} см</p>
                        </div>
                      )}
                      {sample.beforeWetBlocking?.measurements?.stitches && (
                        <div>
                          <p className="text-xs text-gray-500">Петель</p>
                          <p className="text-gray-800">{sample.beforeWetBlocking.measurements.stitches}</p>
                        </div>
                      )}
                      {sample.beforeWetBlocking?.measurements?.rows && (
                        <div>
                          <p className="text-xs text-gray-500">Рядов</p>
                          <p className="text-gray-800">{sample.beforeWetBlocking.measurements.rows}</p>
                        </div>
                      )}
                    </div>

                    {(beforeDensity.stitchesPer10cm || beforeDensity.rowsPer10cm) && (
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-700 mb-1">Плотность вязания:</p>
                        {beforeDensity.stitchesPer10cm && (
                          <p className="text-sm text-blue-900">
                            <i className="fas fa-arrows-alt-h mr-1"></i>
                            {beforeDensity.stitchesPer10cm} петель на 10 см
                          </p>
                        )}
                        {beforeDensity.rowsPer10cm && (
                          <p className="text-sm text-blue-900">
                            <i className="fas fa-arrows-alt-v mr-1"></i>
                            {beforeDensity.rowsPer10cm} рядов на 10 см
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
                  {sample.afterWetBlocking?.photo && (
                    <div className="flex-shrink-0">
                      <img
                        src={sample.afterWetBlocking.photo}
                        alt="После ВТО"
                        className="w-48 h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {sample.afterWetBlocking?.measurements?.width && (
                        <div>
                          <p className="text-xs text-gray-500">Ширина</p>
                          <p className="text-gray-800">{sample.afterWetBlocking.measurements.width} см</p>
                        </div>
                      )}
                      {sample.afterWetBlocking?.measurements?.height && (
                        <div>
                          <p className="text-xs text-gray-500">Высота</p>
                          <p className="text-gray-800">{sample.afterWetBlocking.measurements.height} см</p>
                        </div>
                      )}
                      {sample.afterWetBlocking?.measurements?.stitches && (
                        <div>
                          <p className="text-xs text-gray-500">Петель</p>
                          <p className="text-gray-800">{sample.afterWetBlocking.measurements.stitches}</p>
                        </div>
                      )}
                      {sample.afterWetBlocking?.measurements?.rows && (
                        <div>
                          <p className="text-xs text-gray-500">Рядов</p>
                          <p className="text-gray-800">{sample.afterWetBlocking.measurements.rows}</p>
                        </div>
                      )}
                    </div>

                    {(afterDensity.stitchesPer10cm || afterDensity.rowsPer10cm) && (
                      <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-green-700 mb-1">Плотность вязания:</p>
                        {afterDensity.stitchesPer10cm && (
                          <p className="text-sm text-green-900">
                            <i className="fas fa-arrows-alt-h mr-1"></i>
                            {afterDensity.stitchesPer10cm} петель на 10 см
                          </p>
                        )}
                        {afterDensity.rowsPer10cm && (
                          <p className="text-sm text-green-900">
                            <i className="fas fa-arrows-alt-v mr-1"></i>
                            {afterDensity.rowsPer10cm} рядов на 10 см
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Заметки */}
              {sample.notes && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-sticky-note mr-2 text-purple-500"></i>
                    Заметки
                  </h3>
                  <p className="text-sm text-gray-800">{sample.notes}</p>
                </div>
              )}

              {/* Кнопки */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowDetails(false);
                    onEdit(sample);
                  }}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Подтверждение удаления */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-trash text-red-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Удалить образец?</h3>
              <p className="text-gray-600 mt-2">Образец будет удалён</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  onDelete(sample.id);
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Удалить
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SampleCard;
