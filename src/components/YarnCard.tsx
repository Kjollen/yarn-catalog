import React, { useState } from 'react';
import { YarnItem } from '../types';

interface YarnCardProps {
  item: YarnItem;
  onEdit: (item: YarnItem) => void;
  onDelete: (id: string) => void;
}

const YarnCard: React.FC<YarnCardProps> = ({ item, onEdit, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
          <div className="flex items-center gap-2 flex-wrap">
            {item.brand && (
              <p className="text-sm text-purple-600 font-medium">{item.brand}</p>
            )}
            {item.article && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                арт. {item.article}
              </span>
            )}
          </div>

          <div className="mt-3 space-y-1">
            {item.composition && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <i className="fas fa-flask text-xs text-purple-400 w-4"></i>
                {item.composition}
              </p>
            )}
            {item.weight && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <i className="fas fa-weight-hanging text-xs text-purple-400 w-4"></i>
                {item.weight}
              </p>
            )}
            {item.length && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <i className="fas fa-ruler text-xs text-purple-400 w-4"></i>
                {item.length}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
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

              <div className="mt-5 space-y-3">
                {item.article && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-barcode text-purple-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Артикул</p>
                      <p className="text-gray-800 font-medium">{item.article}</p>
                    </div>
                  </div>
                )}
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
                <div className="grid grid-cols-3 gap-3">
                  {item.weight && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Вес</p>
                      <p className="font-medium text-gray-800">{item.weight}</p>
                    </div>
                  )}
                  {item.length && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Длина</p>
                      <p className="font-medium text-gray-800">{item.length}</p>
                    </div>
                  )}
                  {item.needleSize && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Спицы</p>
                      <p className="font-medium text-gray-800">{item.needleSize}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-boxes text-purple-600 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Количество</p>
                    <p className="text-gray-800">{item.quantity} мотк.{item.quantity > 4 ? '' : 'а'}</p>
                  </div>
                </div>
                {item.notes && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mt-0.5">
                      <i className="fas fa-sticky-note text-purple-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Заметки</p>
                      <p className="text-gray-800">{item.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowDetails(false);
                    onEdit(item);
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

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-trash text-red-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Удалить пряжу?</h3>
              <p className="text-gray-600 mt-2">
                "{item.name}" будет удалена из каталога
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  onDelete(item.id);
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

export default YarnCard;
