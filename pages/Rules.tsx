import React, { useState } from 'react';

const RuleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button 
        className="w-full py-4 px-6 text-left flex justify-between items-center focus:outline-none hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-semibold text-catan-blue">{title}</span>
        <span className="text-catan-orange font-bold text-xl">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-gray-700 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

const Rules: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-catan-blue mb-2">Правила Игры</h1>
      <p className="text-gray-600 mb-8">Краткий справочник для начинающих колонизаторов.</p>

      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
        
        <RuleSection title="1. Что такое Catan?">
          <p className="mb-2">
            В игре Catan игроки пытаются стать доминирующей силой на острове Катан, строя поселения, города и дороги. 
            Каждый ход бросаются кубики, чтобы определить, какие ресурсы производит остров. Игроки собирают эти ресурсы 
            (дерево, зерно, кирпич, овцы или камень), чтобы строить свои цивилизации.
          </p>
        </RuleSection>

        <RuleSection title="2. Цель игры">
          <p>
            Побеждает игрок, первым набравший <strong className="text-catan-orange">10 победных очков</strong> в свой ход.
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>1 поселение = 1 очко</li>
            <li>1 город = 2 очка</li>
            <li>Самая длинная дорога = 2 очка</li>
            <li>Самая большая армия = 2 очка</li>
            <li>Карты развития (победные очки) = 1 очко</li>
          </ul>
        </RuleSection>

        <RuleSection title="3. Таблица Строительства">
           <div className="overflow-x-auto">
             <table className="min-w-full text-sm text-left">
               <thead className="bg-gray-100 text-gray-600 font-bold">
                 <tr>
                   <th className="px-4 py-2">Постройка</th>
                   <th className="px-4 py-2">Стоимость</th>
                   <th className="px-4 py-2">Эффект</th>
                 </tr>
               </thead>
               <tbody className="divide-y">
                 <tr>
                   <td className="px-4 py-2 font-semibold">Дорога</td>
                   <td className="px-4 py-2">🌲 + 🧱</td>
                   <td className="px-4 py-2">Соединяет поселения</td>
                 </tr>
                 <tr>
                   <td className="px-4 py-2 font-semibold">Поселение</td>
                   <td className="px-4 py-2">🌲 + 🧱 + 🌾 + 🐑</td>
                   <td className="px-4 py-2">1 ПО, сбор ресурсов</td>
                 </tr>
                 <tr>
                   <td className="px-4 py-2 font-semibold">Город</td>
                   <td className="px-4 py-2">🌾🌾 + 🏔️🏔️🏔️</td>
                   <td className="px-4 py-2">2 ПО, двойной сбор</td>
                 </tr>
                 <tr>
                   <td className="px-4 py-2 font-semibold">Карта развития</td>
                   <td className="px-4 py-2">🌾 + 🐑 + 🏔️</td>
                   <td className="px-4 py-2">Бонус (Рыцарь, Очко и др.)</td>
                 </tr>
               </tbody>
             </table>
           </div>
        </RuleSection>

        <RuleSection title="4. Ход игры">
          <ol className="list-decimal list-inside space-y-2">
            <li><strong className="text-gray-900">Бросок кубиков:</strong> Результат определяет, какие гексы приносят доход.</li>
            <li><strong className="text-gray-900">Торговля:</strong> Активный игрок может меняться ресурсами с другими игроками или с банком (4:1).</li>
            <li><strong className="text-gray-900">Строительство:</strong> Игрок может тратить карты ресурсов на постройки.</li>
          </ol>
          <p className="mt-2 text-sm text-gray-500 italic">Примечание: Карты развития можно играть в любой момент своего хода (1 за ход).</p>
        </RuleSection>

        <RuleSection title="5. Разбойник (7)">
          <p>
            Если выпадает <strong>7</strong>:
          </p>
          <ul className="list-disc list-inside mt-1 ml-4 text-sm text-gray-700">
            <li>Никто не получает ресурсы.</li>
            <li>Игроки, у которых больше 7 карт, сбрасывают половину.</li>
            <li>Активный игрок переставляет Разбойника на другой гекс (блокируя его) и крадет карту у игрока, имеющего поселение на этом гексе.</li>
          </ul>
        </RuleSection>

        <RuleSection title="6. Карты Развития">
           <ul className="space-y-2">
             <li>🛡️ <strong>Рыцарь:</strong> Переместите разбойника. Сыграв 3 рыцаря, вы получаете карту "Самая большая армия" (2 ПО).</li>
             <li>🏛️ <strong>Победное очко:</strong> Дает +1 очко немедленно (скрыто до конца игры).</li>
             <li>🛣️ <strong>Строительство дорог:</strong> Постройте 2 дороги бесплатно.</li>
             <li>🌾 <strong>Год изобилия:</strong> Возьмите любые 2 ресурса из банка.</li>
             <li>👑 <strong>Монополия:</strong> Назовите ресурс. Все игроки отдают вам все карты этого типа.</li>
           </ul>
        </RuleSection>

      </div>
    </div>
  );
};

export default Rules;