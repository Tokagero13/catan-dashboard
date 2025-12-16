import React from 'react';
import { ACHIEVEMENTS_LIST } from '../services/achievements';

const Achievements: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-catan-blue mb-4">🏆 Зал Славы и Достижения</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Список наград, которые могут получить игроки в ходе своих приключений на острове Катан. 
          Эти значки отображаются в профиле игрока при выполнении условий.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {ACHIEVEMENTS_LIST.map((ach) => (
          <div 
            key={ach.id} 
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-shadow flex flex-col items-center text-center transform hover:-translate-y-1 transition-transform"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-orange-50 rounded-full flex items-center justify-center text-5xl mb-4 shadow-inner">
              {ach.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{ach.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              {ach.description}
            </p>
            <div className="mt-4 pt-4 border-t w-full border-gray-100">
              <span className="text-xs font-semibold text-catan-orange uppercase tracking-wider">Награда</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;