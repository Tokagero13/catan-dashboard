import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { PlayerGroup } from '../types';

const RANDOM_NAMES = [
  'The Overdogs',
  'The Powerhouses',
  'The Jet Setters',
  'The High Notes',
  'The Big Splash',
  'The Steamrollers',
  'The Ultra-Rares'
];

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<PlayerGroup[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGroup, setEditingGroup] = useState<PlayerGroup | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [playersInput, setPlayersInput] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await db.getAllGroups();
      setGroups(data);
    } catch (e) {
      console.error("Failed to load groups", e);
    }
  };

  const handleCreateNew = () => {
    setEditingGroup(null);
    setName('');
    setPlayersInput('');
    setIsEditing(true);
  };

  const handleEdit = (group: PlayerGroup) => {
    setEditingGroup(group);
    setName(group.name);
    setPlayersInput(group.players.join(', '));
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Удалить эту группу?')) {
      await db.deleteGroup(id);
      loadGroups();
    }
  };

  const generateRandomName = () => {
    const random = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    setName(random);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const players = playersInput.split(',').map(p => p.trim()).filter(Boolean);
    
    if (players.length < 2) {
      alert('Нужно минимум 2 игрока');
      return;
    }

    try {
      const groupToSave: PlayerGroup = {
        id: editingGroup ? editingGroup.id : Date.now().toString(),
        name: name || 'Без названия',
        players: players,
        lastUpdated: new Date().toISOString()
      };

      await db.saveGroup(groupToSave);
      setIsEditing(false);
      loadGroups();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-catan-blue">Группы Игроков</h1>
        <button 
          onClick={handleCreateNew}
          className="bg-catan-orange text-white py-2 px-6 rounded-lg font-semibold shadow hover:bg-orange-600 transition-colors"
        >
          + Создать Группу
        </button>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">{editingGroup ? 'Редактировать группу' : 'Новая группа'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Название Группы</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md p-2"
                    placeholder="Введите название"
                  />
                  <button 
                    type="button" 
                    onClick={generateRandomName}
                    className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-200"
                  >
                    🎲 Случайное
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Игроки (через запятую)</label>
                <textarea 
                  required
                  value={playersInput}
                  onChange={(e) => setPlayersInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 h-24"
                  placeholder="Иван, Мария, Петр..."
                />
                <p className="text-xs text-gray-500 mt-1">Минимум 2 игрока.</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-catan-blue text-white rounded-md hover:bg-blue-800"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <div key={group.id} className="bg-white rounded-xl shadow-md p-6 border-t-4 border-catan-wood">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{group.name}</h3>
            <div className="text-gray-600 text-sm mb-4 h-16 overflow-hidden">
              <span className="font-semibold">Игроки:</span> {group.players.join(', ')}
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Обн: {new Date(group.lastUpdated).toLocaleDateString()}</span>
              <div className="space-x-2">
                <button 
                  onClick={() => handleEdit(group)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Изм.
                </button>
                <button 
                  onClick={() => handleDelete(group.id)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            Нет созданных групп. Создайте первую группу для начала игры!
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;