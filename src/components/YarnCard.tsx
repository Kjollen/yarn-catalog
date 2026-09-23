import React, { useState, useMemo } from 'react';
import { YarnItem, Project } from '../types';

interface YarnCardProps {
  item: YarnItem;
  projects: Project[];
  onEdit: (item: YarnItem) => void;
  onDelete: (id: string) => void;
  onAddProject: (yarnItemId: string) => void;
  onViewProjects: (yarnItemId: string) => void;
}

// Вычисляет общий метраж на основе веса и метража на 100г
function calculateTotalMeterage(totalWeight: string, meteragePer100g: string): string | null {
  const weightNum = parseFloat(totalWeight.replace(/[^\d.]/g, ''));
  const meterageNum = parseFloat(meteragePer100g.replace(/[^\d.]/g, ''));
  if (!isNaN(weightNum) && !isNaN(meterageNum) && weightNum > 0) {
    const total = Math.round((weightNum / 100) * meterageNum);
    return `${total} м`;
  }
  return null;
}

// Вычисляет остаток пряжи (общий вес минус использованный в проектах)
function calculateRemainingWeight(item: YarnItem, projects: Project[]): number | null {
  const totalWeightNum = parseFloat(item.totalWeight.replace(/[^\d.]/g, ''));
  if (isNaN(totalWeightNum) || totalWeightNum <= 0) return null;

  const itemProjects = projects.filter(p => p.yarnItemId === item.id);
  let usedWeight = 0;

  itemProjects.forEach(project => {
    const weightNum = parseFloat(project.yarnUsedWeight.replace(/[^\d.]/g, ''));
    if (!isNaN(weightNum)) {
      usedWeight += weightNum;
    }
  });

  return totalWeightNum * item.quantity - usedWeight;
}

const YarnCard: React.FC<YarnCardProps> = ({ item, projects, onEdit, onDelete, onAddProject, onViewProjects }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const totalMeterage = useMemo(
    () => calculateTotalMeterage(item.totalWeight, item.meteragePer100g),
    [item.totalWeight, item.meteragePer100g]
  );

  const remainingWeight = useMemo(
    () => calculateRemainingWeight(item, projects),
    [item, projects]
  );

  const itemProjects = useMemo(
    () => projects.filter(p => p.yarnItemId === item.id),
    [projects, item.id]
  );

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
        {/* Photo */}
        <div
          className="relative h-56 bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden cursor-pointer"
          onClick={() => setShowDetails(true)}
        >
          {item.photo ? (
            <img
              src={item.photo}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div
                className="w-24 h-24 rounded-full shadow-inner"
                style={{ backgroundColor: item.colorHex }}
              ></div>
            </div>
          )}
          {/* Quantity badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-purple-700 shadow">
            {item.quantity} шт.
          </div>
          {/* Color indicator */}
          <div
            className="absolute bottom-3 left-3 w-6 h-6 rounded-full border-2 border-white shadow"
            style={{ backgroundColor: item.colorHex }}
          ></div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-bold text-gray-800 text-lg truncate">{item.name}</h3>
          {item.brand && (
            <p className="text-sm text-purple-600 font-medium">{item.brand}</p>
          )}

          {/* Article - prominent */}
          {item.article && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-sm font-medium">
              <i className="fas fa-barcode text-xs text-gray-500"></i>
              арт. {item.article}
            </div>
          )}

          <div className="mt-3 space-y-1">
            {item.composition && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <i className="fas fa-flask text-xs text-purple-400 w-4"></i>
                {item.composition}
              </p>
            )}
            {item.totalWeight && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <i className="fas fa-weight-hanging text-xs text-purple-400 w-4"></i>
                {item.totalWeight}
                {remainingWeight !== null && (
                  <span className={`ml-auto text-xs font-medium ${remainingWeight <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                    остаток: {Math.round(remainingWeight)} г
                  </span>
                )}
              </p>
            )}
            {item.meteragePer100g && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <i className="fas fa-ruler-horizontal text-xs text-purple-400 w-4"></i>
                {item.meteragePer100g} / 100 г
              </p>
            )}
          </div>

          {/* Projects section */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-medium">
                <i className="fas fa-tshirt mr-1"></i>
                Проекты: {itemProjects.length}
              </span>
              <button
                onClick={() => onAddProject(item.id)}
                className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                <i className="fas fa-plus"></i>
                Добавить
              </button>
            </div>
            {itemProjects.length > 0 && (
              <button
                onClick={() => onViewProjects(item.id)}
                className="w-full text-xs py-1.5 px-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-left"
              >
                <i className="fas fa-eye mr-1"></i>
                Посмотреть проекты
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowDetails(true)}
              className="flex-1 text-sm py-2 px-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium"
            >
              Подробнее
            </button>
            <button
              onClick={() => onEdit(item)}
              className="text-sm py-2 px-3 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <i className="fas fa-pen text-xs"></i>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-sm py-2 px-3 bg-gray-50 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              <i className="fas fa-trash text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {item.photo && (
              <div className="h-64 overflow-hidden rounded-t-2xl">
                <img
                  src={item.photo}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{item.name}</h2>
                  {item.brand && (
                    <p className="text-purple-600 font-medium mt-1">{item.brand}</p>
                  )}
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* Article badge */}
              {item.article && (
                <div className="mt-3 inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
                  <i className="fas fa-barcode text-gray-500"></i>
                  Артикул: {item.article}
                </div>
              )}

              <div className="mt-5 space-y-3">
                {item.composition && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-flask text-purple-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Состав</p>
                      <p className="text-gray-800">{item.composition}</p>
                    </div>
                  </div>
                )}
                {item.color && (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg border border-gray-200"
                      style={{ backgroundColor: item.colorHex }}
                    ></div>
                    <div>
                      <p className="text-xs text-gray-500">Цвет</p>
                      <p className="text-gray-800">{item.color}</p>
                    </div>
                  </div>
                )}

                {/* Weight and meterage block */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {item.totalWeight && (
                    <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                      <p className="text-xs text-purple-500 mb-1">Вес бобины</p>
                      <p className="text-xl font-bold text-purple-800">{item.totalWeight}</p>
                    </div>
                  )}
                  {item.meteragePer100g && (
                    <div className="bg-pink-50 rounded-xl p-4 text-center border border-pink-100">
                      <p className="text-xs text-pink-500 mb-1">Метраж на 100 г</p>
                      <p className="text-xl font-bold text-pink-800">{item.meteragePer100g}</p>
                    </div>
                  )}
                </div>

                {totalMeterage && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-center border border-purple-100">
                    <p className="text-xs text-gray-500 mb-1">Общий метраж бобины</p>
                    <p className="text-2xl font-bold text-gray-800">{totalMeterage}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {item.needleSize && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Спицы</p>
                      <p className="font-medium text-gray-800">{item.needleSize}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Количество</p>
                    <p className="font-medium text-gray-800">{item.quantity} боб.</p>
                  </div>
                </div>

                {/* Remaining weight */}
                {remainingWeight !== null && (
                  <div className={`rounded-xl p-4 text-center border ${remainingWeight <= 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                    <p className="text-xs text-gray-500 mb-1">Остаток пряжи</p>
                    <p className={`text-2xl font-bold ${remainingWeight <= 0 ? 'text-red-800' : 'text-green-800'}`}>
                      {Math.round(remainingWeight)} г
                    </p>
                    {remainingWeight <= 0 && (
                      <p className="text-xs text-red-600 mt-1">Пряжа закончилась</p>
                    )}
                  </div>
                )}

                {/* Purchase info */}
                {(item.shop || item.orderNumber || item.pricePerGram || item.totalPrice) && (
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-shopping-bag text-purple-500"></i>
                      <p className="text-sm font-semibold text-gray-700">Информация о покупке</p>
                    </div>
                    <div className="space-y-2">
                      {item.shop && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <i className="fas fa-store text-purple-600 text-sm"></i>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Магазин</p>
                            <p className="text-gray-800">{item.shop}</p>
                          </div>
                        </div>
                      )}
                      {item.orderNumber && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <i className="fas fa-receipt text-purple-600 text-sm"></i>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Номер заказа</p>
                            <p className="text-gray-800">{item.orderNumber}</p>
                          </div>
                        </div>
                      )}
                      {item.pricePerGram && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <i className="fas fa-coins text-purple-600 text-sm"></i>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Цена за грамм</p>
                            <p className="text-gray-800">{item.pricePerGram}</p>
                          </div>
                        </div>
                      )}
                      {item.totalPrice && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <i className="fas fa-ruble-sign text-purple-600 text-sm"></i>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Общая сумма</p>
                            <p className="text-gray-800">{item.totalPrice}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {item.notes && (
                  <div className="flex items-start gap-3">
