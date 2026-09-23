import { useState, useEffect, useMemo } from 'react';
import { YarnItem, Project } from './types';
import YarnCard from './components/YarnCard';
import YarnForm from './components/YarnForm';
import ProjectForm from './components/ProjectForm';
import ProjectCard from './components/ProjectCard';
import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

type SortOption = 'date' | 'name' | 'brand' | 'quantity';
type YarnFormData = Omit<YarnItem, 'id' | 'dateAdded'>;
type ProjectFormData = Omit<Project, 'id' | 'dateAdded'>;

function App() {
  const [items, setItems] = useState<YarnItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<YarnItem | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectYarnId, setProjectYarnId] = useState<string>('');
  const [viewingProjectsYarnId, setViewingProjectsYarnId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterBrand, setFilterBrand] = useState('all');
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

  useEffect(() => {
    setSyncStatus('syncing');
    const q = query(collection(db, 'yarn_items'), orderBy('dateAdded', 'desc'));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const yarnItems: YarnItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<YarnItem, 'id'>),
        }));
        setItems(yarnItems);
        setSyncStatus('synced');
        setLoading(false);
      },
      (error) => {
        console.error('Ошибка загрузки пряжи:', error);
        setSyncStatus('error');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('dateAdded', 'desc'));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const projectItems: Project[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Project, 'id'>),
        }));
        setProjects(projectItems);
      },
      (error) => {
        console.error('Ошибка загрузки проектов:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  const brands = useMemo(() => {
    const brandSet = new Set(items.map((item) => item.brand).filter(Boolean));
    return Array.from(brandSet).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.brand.toLowerCase().includes(query) ||
          item.article.toLowerCase().includes(query) ||
          item.composition.toLowerCase().includes(query) ||
          item.color.toLowerCase().includes(query) ||
          item.notes.toLowerCase().includes(query)
      );
    }
    if (filterBrand !== 'all') {
      result = result.filter((item) => item.brand === filterBrand);
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'brand': return a.brand.localeCompare(b.brand);
        case 'quantity': return b.quantity - a.quantity;
        case 'date': default:
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });
    return result;
  }, [items, searchQuery, sortBy, filterBrand]);

  const totalQuantity = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const totalWeight = useMemo(() => {
    let total = 0;
    items.forEach((item) => {
      const weightNum = parseFloat(item.totalWeight.replace(/[^\d.]/g, ''));
      if (!isNaN(weightNum)) {
        total += weightNum * item.quantity;
      }
    });
    return total;
  }, [items]);

  const handleAdd = async (newYarn: YarnFormData) => {
    try {
      setSyncStatus('syncing');
      const itemToAdd = { ...newYarn, dateAdded: new Date().toISOString() };
      await addDoc(collection(db, 'yarn_items'), itemToAdd);
      setShowForm(false);
    } catch (error) {
      console.error('Ошибка добавления:', error);
      setSyncStatus('error');
      alert('Не удалось добавить запись.');
    }
  };

  const handleEdit = async (updatedYarn: YarnFormData) => {
    if (!editingItem) return;
    try {
      setSyncStatus('syncing');
      const itemRef = doc(db, 'yarn_items', editingItem.id);
      await updateDoc(itemRef, updatedYarn);
      setEditingItem(null);
      setShowForm(false);
    } catch (error) {
      console.error('Ошибка редактирования:', error);
      setSyncStatus('error');
      alert('Не удалось сохранить.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setSyncStatus('syncing');
      const relatedProjects = projects.filter(p => p.yarnItemId === id);
      for (const project of relatedProjects) {
        await deleteDoc(doc(db, 'projects', project.id));
      }
      await deleteDoc(doc(db, 'yarn_items', id));
    } catch (error) {
      console.error('Ошибка удаления:', error);
      setSyncStatus('error');
      alert('Не удалось удалить.');
    }
  };

  const handleAddProject = async (newProject: ProjectFormData) => {
    try {
      setSyncStatus('syncing');
      const projectToAdd = { ...newProject, dateAdded: new Date().toISOString() };
      await addDoc(collection(db, 'projects'), projectToAdd);
      setShowProjectForm(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Ошибка добавления проекта:', error);
      setSyncStatus('error');
      alert('Не удалось добавить проект.');
    }
  };

  const handleEditProject = async (updatedProject: ProjectFormData) => {
    if (!editingProject) return;
    try {
      setSyncStatus('syncing');
      const projectRef = doc(db, 'projects', editingProject.id);
      await updateDoc(projectRef, updatedProject);
      setEditingProject(null);
      setShowProjectForm(false);
    } catch (error) {
      console.error('Ошибка редактирования проекта:', error);
      setSyncStatus('error');
      alert('Не удалось сохранить проект.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      setSyncStatus('syncing');
      await deleteDoc(doc(db, 'projects', id));
    } catch (error) {
      console.error('Ошибка удаления проекта:', error);
      setSyncStatus('error');
      alert('Не удалось удалить проект.');
    }
  };

  const startEdit = (item: YarnItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const startAddProject = (yarnItemId: string) => {
    setProjectYarnId(yarnItemId);
    setEditingProject(null);
    setShowProjectForm(true);
  };

  const startEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const viewProjects = (yarnItemId: string) => {
    setViewingProjectsYarnId(yarnItemId);
  };

  const viewingYarnItem = useMemo(() => {
    if (!viewingProjectsYarnId) return null;
    return items.find(item => item.id === viewingProjectsYarnId) || null;
  }, [viewingProjectsYarnId, items]);

  const viewingProjects = useMemo(() => {
    if (!viewingProjectsYarnId) return [];
    return projects.filter(p => p.yarnItemId === viewingProjectsYarnId);
  }, [viewingProjectsYarnId, projects]);

  const projectFormYarnName = useMemo(() => {
    if (editingProject) {
      const yarn = items.find(item => item.id === editingProject.yarnItemId);
      return yarn?.name || '';
    }
    const yarn = items.find(item => item.id === projectYarnId);
    return yarn?.name || '';
  }, [editingProject, projectYarnId, items]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">🧶</span>
          </div>
          <p className="text-gray-600">Загрузка каталога...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">🧶</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Каталог пряжи</h1>
                <p className="text-xs text-gray-500">
                  {items.length} наименований • {totalQuantity} бобин
                  {totalWeight > 0 && ` • ${totalWeight} г`}
                  {projects.length > 0 && ` • ${projects.length} проектов`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-green-500' : syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} title={syncStatus === 'synced' ? 'Синхронизировано' : syncStatus === 'syncing' ? 'Синхронизация...' : 'Ошибка'}></div>
              <button
                onClick={() => { setEditingItem(null); setShowForm(true); }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <i className="fas fa-plus"></i>
                <span className="hidden sm:inline">Добавить</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Поиск по названию, артикулу, составу..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-sm" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          {brands.length > 0 && (
            <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-sm text-gray-700">
              <option value="all">Все производители</option>
              {brands.map((brand) => (<option key={brand} value={brand}>{brand}</option>))}
            </select>
          )}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-sm text-gray-700">
            <option value="date">Сначала новые</option>
            <option value="name">По названию</option>
            <option value="brand">По производителю</option>
            <option value="quantity">По количеству</option>
          </select>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-8">
        {syncStatus === 'error' && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <i className="fas fa-exclamation-triangle text-red-500"></i>
            <p className="text-red-700 text-sm">Ошибка синхронизации.</p>
          </div>
        )}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map((item) => (
              <YarnCard 
                key={item.id} 
                item={item} 
                projects={projects}
                onEdit={startEdit} 
                onDelete={handleDelete}
                onAddProject={startAddProject}
                onViewProjects={viewProjects}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🧶</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Каталог пуст</h2>
            <p className="text-gray-600 mb-6">Добавьте свою первую пряжу</p>
            <button onClick={() => { setEditingItem(null); setShowForm(true); }} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg">
              <i className="fas fa-plus mr-2"></i>Добавить пряжу
            </button>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-search text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-600">Ничего не найдено</h3>
          </div>
        )}
      </main>

      {showForm && (
        <YarnForm
          onSubmit={editingItem ? handleEdit : handleAdd}
          onCancel={() => { setShowForm(false); setEditingItem(null); }}
          initialData={editingItem}
        />
      )}

      {showProjectForm && (
        <ProjectForm
          onSubmit={editingProject ? handleEditProject : handleAddProject}
          onCancel={() => { setShowProjectForm(false); setEditingProject(null); }}
          initialData={editingProject}
          yarnItemName={projectFormYarnName}
        />
      )}

      {viewingProjectsYarnId && viewingYarnItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Проекты из пряжи</h2>
                <p className="text-sm text-purple-600 mt-1">{viewingYarnItem.name}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startAddProject(viewingProjectsYarnId)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-plus"></i>
                  <span className="hidden sm:inline">Новый</span>
                </button>
                <button
                  onClick={() => setViewingProjectsYarnId(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl p-2"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div className="p-6">
              {viewingProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {viewingProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onEdit={startEditProject}
                      onDelete={handleDeleteProject}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-tshirt text-purple-400 text-2xl"></i>
                  </div>
                  <p className="text-gray-600 mb-4">Пока нет проектов</p>
                  <button
                    onClick={() => startAddProject(viewingProjectsYarnId)}
                    className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors"
                  >
                    <i className="fas fa-plus mr-2"></i>Создать проект
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
