import { useState, useEffect, useMemo } from 'react';
import { YarnItem } from './types';
import YarnCard from './components/YarnCard';
import YarnForm from './components/YarnForm';

const STORAGE_KEY = 'yarn-catalog';

function loadYarnData(): YarnItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveYarnData(items: YarnItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

type SortOption = 'date' | 'name' | 'brand' | 'quantity';

function App() {
  const [items, setItems] = useState<YarnItem[]>(loadYarnData);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<YarnItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterBrand, setFilterBrand] = useState('all');

  useEffect(() => {
    saveYarnData(items);
  }, [items]);

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
        case 'name':
          return a.name.localeCompare(b.name);
        case 'brand':
          return a.brand.localeCompare(b.brand);
        case 'quantity':
          return b.quantity - a.quantity;
        case 'date':
        default:
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

  const handleAdd = (data: Omit<YarnItem, 'id' | 'dateAdded'>) => {
    const newItem: YarnItem = {
      ...data,
      id: crypto.randomUUID(),
      dateAdded: new Date().toISOString(),
    };
    setItems((prev) => [newItem, ...prev]);
    setShowForm(false);
  };

  const handleEdit = (data: Omit<YarnItem, 'id' | 'dateAdded'>) => {
    if (!editingItem) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === editingItem.id ? { ...item, ...data } : item
      )
    );
    setEditingItem(null);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const startEdit = (item: YarnItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

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
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              <span className="hidden sm:inline">Добавить</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, артикулу, составу..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          {brands.length > 0 && (
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-sm text-gray-700"
            >
              <option value="all">Все производители</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-sm text-gray-700"
          >
            <option value="date">Сначала новые</option>
            <option value="name">По названию</option>
            <option value="brand">По производителю</option>
            <option value="quantity">По количеству</option>
          </select>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-8">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map((item) => (
              <YarnCard
                key={item.id}
                item={item}
                onEdit={startEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🧶</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Каталог пуст</h2>
            <p className="text-gray-600 mb-6">
              Добавьте свою первую пряжу в коллекцию
            </p>
            <button
              onClick={() => {
                setEditingItem(null);
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              <i className="fas fa-plus mr-2"></i>
              Добавить пряжу
            </button>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-search text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-600">Ничего не найдено</h3>
            <p className="text-gray-500 mt-1">
              Попробуйте изменить параметры поиска
            </p>
          </div>
        )}
      </main>

      {showForm && (
        <YarnForm
          onSubmit={editingItem ? handleEdit : handleAdd}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          initialData={editingItem}
        />
      )}
    </div>
  );
}

export default App;
