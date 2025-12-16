import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? 'text-white font-bold border-b-2 border-orange-400' : 'text-blue-100 hover:text-white';

  const NavItems = [
    { name: 'Главная', path: '/' },
    { name: 'Генератор', path: '/generator' },
    { name: 'Лидерборд', path: '/leaderboard' },
    { name: 'Группы', path: '/groups' },
    { name: 'Достижения', path: '/achievements' },
    { name: 'Правила', path: '/rules' },
    { name: 'Стратегии', path: '/strategies' },
  ];

  return (
    <nav className="bg-catan-blue shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
               <span className="text-white text-xl font-bold tracking-wider">CATAN<span className="text-catan-orange">MANAGER</span></span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {NavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.path)}`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-blue-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-blue-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-blue-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             {NavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(item.path)}`}
                >
                  {item.name}
                </Link>
              ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;