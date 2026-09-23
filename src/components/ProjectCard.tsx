import React, { useState } from 'react';
import { Project, YarnItem } from '../types';

interface ProjectCardProps {
  project: Project;
  yarnItems: YarnItem[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, yarnItems, onEdit, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getStatusBadge = () => {
    switch (project.status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">✓ Завершено</span>;
      case 'in-progress':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">⟳ В процессе</span>;
      case 'planned':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">◷ Запланировано</span>;
    }
  };

  const getYarnName = (yarnItemId: string) => {
    const yarn = yarnItems.find(y => y.id === yarnItemId);
    return yarn ? `${yarn.name}${yarn.brand ? ` (${yarn.brand})` : ''}` : 'Неизвестная пряжа';
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group">
        {project.photo && (
          <div
            className="h-40 bg-gray-100 overflow-hidden cursor-pointer"
            onClick={() => setShowDetails(true)}
          >
            <img
              src={project.photo}
              alt={project.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-800 flex-1">{project.name}</h4>
            {getStatusBadge()}
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            {project.yarnUsage && project.yarnUsage.length > 0 ? (
              project.yarnUsage.map((usage, index) => (
                <p key={index} className="flex items-center gap-2">
                  <i className="fas fa-yarn-ball text-xs text-purple-400 w-4"></i>
                  <span className="truncate">{getYarnName(usage.yarnItemId)}</span>
                  {usage.weight && <span className="ml-auto text-xs text-gray-500">{usage.weight}</span>}
                </p>
              ))
            ) : (
              <p className="text-gray-400 italic">Пряжа не указана</p>
            )}
            {project.needleSize && (
              <p className="flex items-center gap-2">
                <i className="fas fa-ruler text-xs text-purple-400 w-4"></i>
                Спицы: {project.needleSize}
              </p>
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
              onClick={() => onEdit(project)}
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

      {showDetails && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {project.photo && (
              <div className="h-64 overflow-hidden rounded-t-2xl">
                <img
                  src={project.photo}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{project.name}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="mb-4">{getStatusBadge()}</div>

              <div className="space-y-3">
                {/* Пряжа и расход */}
                {project.yarnUsage && project.yarnUsage.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-yarn-ball text-purple-500"></i>
                      <p className="text-sm font-semibold text-gray-700">Пряжа</p>
                    </div>
                    <div className="space-y-2 pl-2">
                      {project.yarnUsage.map((usage, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <i className="fas fa-yarn-ball text-purple-600 text-sm"></i>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800">{getYarnName(usage.yarnItemId)}</p>
                            {usage.weight && (
                              <p className="text-xs text-gray-500">Расход: {usage.weight}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {project.needleSize && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-ruler text-purple-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Спицы</p>
                      <p className="text-gray-800">{project.needleSize}</p>
                    </div>
                  </div>
                )}
                {project.pattern && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-book text-purple-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Схема</p>
                      <p className="text-gray-800">{project.pattern}</p>
                    </div>
                  </div>
                )}
                {(project.startDate || project.endDate) && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-calendar text-purple-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Даты</p>
                      <p className="text-gray-800">
                        {project.startDate && new Date(project.startDate).toLocaleDateString('ru-RU')}
                        {project.startDate && project.endDate && ' — '}
                        {project.endDate && new Date(project.endDate).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                )}
                {project.notes && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mt-0.5">
                      <i className="fas fa-sticky-note text-purple-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Заметки</p>
                      <p className="text-gray-800">{project.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowDetails(false);
                    onEdit(project);
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

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-trash text-red-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Удалить проект?</h3>
              <p className="text-gray-600 mt-2">"{project.name}" будет удалён</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  onDelete(project.id);
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

export default ProjectCard;
