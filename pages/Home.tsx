import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <div className="bg-catan-blue text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Добро пожаловать в Catan Manager</h1>
        <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
          Ваш универсальный помощник для игры в Колонизаторы. Создавайте карты, ведите счет и изучайте стратегии.
        </p>
        <Link to="/generator" className="bg-catan-orange hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105">
          Начать Игру
        </Link>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <Link to="/generator" className="group">
            <div className="bg-white rounded-xl shadow-md p-6 h-full border-t-4 border-catan-wood hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🎲</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-catan-wood transition-colors">Генератор Карт</h3>
              <p className="text-gray-600">Создавайте сбалансированные игровые поля разных размеров. Скачивайте схемы.</p>
            </div>
          </Link>

          <Link to="/leaderboard" className="group">
            <div className="bg-white rounded-xl shadow-md p-6 h-full border-t-4 border-catan-brick hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-catan-brick transition-colors">Лидерборд</h3>
              <p className="text-gray-600">Записывайте результаты игр, отслеживайте статистику и определите лучшего колонизатора.</p>
            </div>
          </Link>

          <Link to="/rules" className="group">
            <div className="bg-white rounded-xl shadow-md p-6 h-full border-t-4 border-catan-wheat hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📜</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-catan-wheat transition-colors">Правила</h3>
              <p className="text-gray-600">Забыли стоимость города? Быстрый доступ к правилам и таблицам строительства.</p>
            </div>
          </Link>

          <Link to="/strategies" className="group">
            <div className="bg-white rounded-xl shadow-md p-6 h-full border-t-4 border-catan-ore hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-catan-ore transition-colors">Стратегии</h3>
              <p className="text-gray-600">Советы для новичков и продвинутые тактики для победы в любой партии.</p>
            </div>
          </Link>

        </div>
      </div>

      <footer className="bg-slate-900 text-gray-400 py-8 mt-auto text-center">
        <p>&copy; {new Date().getFullYear()} Catan Manager. Создано с помощью AI.</p>
      </footer>
    </div>
  );
};

export default Home;