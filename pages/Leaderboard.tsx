import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ACHIEVEMENTS_LIST, getPlayerAchievements } from '../services/achievements';
import { db } from '../services/db';
import { GameSession, PlayerGroup, PlayerStats, ScoreBreakdown } from '../types';

const MAX_SCORE = 12;

const Leaderboard: React.FC = () => {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [groups, setGroups] = useState<PlayerGroup[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // View States
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);
  const [photoToZoom, setPhotoToZoom] = useState<string | null>(null);

  // Form State
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [winner, setWinner] = useState('');
  const [notes, setNotes] = useState('');
  const [winnerPhoto, setWinnerPhoto] = useState<string>('');
  const [diceStats, setDiceStats] = useState<number[]>([]);

  // Score Calculator State
  const [score, setScore] = useState<ScoreBreakdown>({
    settlements: 0,
    cities: 0,
    victoryCards: 0,
    longestRoad: false,
    largestArmy: false,
    total: 0
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, st, g] = await Promise.all([
        db.getAllSessions(),
        db.getLeaderboard(),
        db.getAllGroups()
      ]);
      setSessions(s);
      setStats(st);
      setGroups(g);
    } catch (e) {
      console.error("DB Load Error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Recalculate score total whenever components change
  useEffect(() => {
    let total = 0;
    total += score.settlements * 1;
    total += score.cities * 2;
    total += score.victoryCards * 1;
    if (score.longestRoad) total += 2;
    if (score.largestArmy) total += 2;
    
    setScore(prev => ({ ...prev, total }));
  }, [score.settlements, score.cities, score.victoryCards, score.longestRoad, score.largestArmy]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Вы уверены, что хотите удалить эту игру?')) {
      await db.deleteSession(id);
      loadData();
      if (selectedSession?.id === id) setSelectedSession(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("Файл слишком большой! Пожалуйста, выберите фото меньше 2Мб.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setWinnerPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleDiceStat = (num: number) => {
    if (diceStats.includes(num)) {
      setDiceStats(diceStats.filter(n => n !== num));
    } else {
      setDiceStats([...diceStats, num]);
    }
  };

  const updateScore = (field: keyof ScoreBreakdown, value: any) => {
    if (typeof value === 'number' && value > (score[field] as number) && score.total >= MAX_SCORE) return;
    if (typeof value === 'boolean' && value === true && !(score[field] as boolean) && score.total >= MAX_SCORE) return;
    setScore(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) {
      alert('Выберите группу!');
      return;
    }
    const group = groups.find(g => g.id === selectedGroupId);
    if (!group) return;

    if (!winner) {
      alert('Выберите победителя!');
      return;
    }

    const newSession: GameSession = {
      id: Date.now().toString(),
      session_name: group.name,
      created_date: new Date().toLocaleString(),
      num_players: group.players.length,
      players_list: group.players,
      winner: winner,
      notes: notes,
      groupId: group.id,
      scoreBreakdown: score,
      diceStats: diceStats,
      winnerPhoto: winnerPhoto
    };

    try {
      await db.addSession(newSession);
      // Reset Form
      setShowForm(false);
      setWinner('');
      setNotes('');
      setWinnerPhoto('');
      setDiceStats([]);
      setScore({ settlements: 0, cities: 0, victoryCards: 0, longestRoad: false, largestArmy: false, total: 0 });
      loadData();
    } catch (err) {
      console.error(err);
      alert('Ошибка при сохранении в SQLite.');
    }
  };

  // Helper to get players of selected group
  const getSelectedGroupPlayers = () => {
     const g = groups.find(x => x.id === selectedGroupId);
     return g ? g.players : [];
  };

  const renderPlayerProfile = () => {
    if (!selectedPlayer) return null;
    const playerStat = stats.find(s => s.name === selectedPlayer);
    const earnedIds = getPlayerAchievements(selectedPlayer, sessions);
    const recentGames = sessions.filter(s => s.players_list.includes(selectedPlayer)).slice(0, 5);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative animate-fade-in">
          <button onClick={() => setSelectedPlayer(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          
          <div className="mb-6">
              <h2 className="text-3xl font-bold text-catan-blue">{selectedPlayer}</h2>
              <div className="text-sm text-gray-500">Профиль игрока</div>
          </div>

          <div className="grid grid-cols-4 gap-2 md:gap-4 mb-8">
            <div className="bg-blue-50 p-2 md:p-4 rounded-xl text-center">
              <div className="text-xl md:text-2xl font-bold text-catan-blue">{playerStat?.wins || 0}</div>
              <div className="text-[10px] md:text-xs text-gray-600 uppercase font-semibold">Побед</div>
            </div>
            <div className="bg-orange-50 p-2 md:p-4 rounded-xl text-center">
              <div className="text-xl md:text-2xl font-bold text-catan-orange">{playerStat?.totalGames || 0}</div>
              <div className="text-[10px] md:text-xs text-gray-600 uppercase font-semibold">Игр</div>
            </div>
            <div className="bg-green-50 p-2 md:p-4 rounded-xl text-center">
              <div className="text-xl md:text-2xl font-bold text-green-600">{playerStat?.winRate || 0}%</div>
              <div className="text-[10px] md:text-xs text-gray-600 uppercase font-semibold">Винрейт</div>
            </div>
            <div className="bg-red-50 p-2 md:p-4 rounded-xl text-center border border-red-100">
              <div className="text-xl md:text-2xl font-bold text-red-600">🔥 {playerStat?.maxStreak || 0}</div>
              <div className="text-[10px] md:text-xs text-gray-600 uppercase font-semibold">Стрик</div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center border-b pb-2">
            Достижения <span className="ml-2 text-sm font-normal text-gray-500">({earnedIds.length}/{ACHIEVEMENTS_LIST.length})</span>
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-8">
            {ACHIEVEMENTS_LIST.map(ach => {
              const isEarned = earnedIds.includes(ach.id);
              return (
                <div key={ach.id} className={`p-2 rounded-lg border text-center transition-all ${isEarned ? 'bg-yellow-50 border-yellow-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-40 grayscale'}`} title={ach.description}>
                  <div className="text-2xl mb-1">{ach.icon}</div>
                  <div className="text-[10px] font-semibold leading-tight">{ach.title}</div>
                </div>
              );
            })}
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Последние игры</h3>
          <div className="space-y-2">
            {recentGames.length > 0 ? recentGames.map(game => (
              <div key={game.id} className="text-sm flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100">
                <div>
                    <div className="font-semibold text-gray-700">{game.session_name}</div>
                    <div className="text-xs text-gray-500">{game.created_date}</div>
                </div>
                <span className={game.winner === selectedPlayer ? "font-bold text-green-600" : "text-gray-800"}>
                  {game.winner === selectedPlayer ? 'Победа 🏆' : 'Поражение'}
                </span>
              </div>
            )) : <p className="text-gray-400 text-sm">Игр не найдено</p>}
          </div>
        </div>
      </div>
    );
  };

  const renderSessionDetails = () => {
    if (!selectedSession) return null;
    const s = selectedSession;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-0 relative animate-fade-in overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="bg-catan-blue text-white p-6 relative">
            <button onClick={() => setSelectedSession(null)} className="absolute top-4 right-4 text-white hover:text-gray-200 text-3xl">&times;</button>
            <h2 className="text-2xl font-bold">{s.session_name}</h2>
            <p className="text-blue-200 text-sm">{s.created_date}</p>
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Column: Photo & Winner */}
              <div className="md:w-1/3 flex flex-col items-center">
                 <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-inner border border-gray-200 mb-4 flex items-center justify-center">
                    {s.winnerPhoto ? (
                      <img src={s.winnerPhoto} alt="Winner" className="w-full h-full object-cover cursor-zoom-in" onClick={() => setPhotoToZoom(s.winnerPhoto!)} />
                    ) : (
                      <div className="text-gray-300 text-6xl">📷</div>
                    )}
                 </div>
                 <div className="text-center">
                    <div className="text-sm text-gray-500 uppercase font-bold tracking-widest mb-1">Победитель</div>
                    <div className="text-2xl font-bold text-catan-orange">{s.winner} 🏆</div>
                 </div>
              </div>

              {/* Right Column: Stats */}
              <div className="md:w-2/3 space-y-6">
                
                {/* Score Breakdown */}
                {s.scoreBreakdown && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-3 border-b pb-1">Как победил: <span className="float-right text-catan-blue font-mono text-lg">{s.scoreBreakdown.total} очков</span></h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                       <div className="flex justify-between"><span>Поселения:</span> <span className="font-bold">{s.scoreBreakdown.settlements}</span></div>
                       <div className="flex justify-between"><span>Города:</span> <span className="font-bold">{s.scoreBreakdown.cities}</span></div>
                       <div className="flex justify-between"><span>Карты победы:</span> <span className="font-bold">{s.scoreBreakdown.victoryCards}</span></div>
                       {s.scoreBreakdown.longestRoad && <div className="col-span-2 text-green-600 font-semibold">🛣️ Самый длинный тракт (+2)</div>}
                       {s.scoreBreakdown.largestArmy && <div className="col-span-2 text-red-600 font-semibold">⚔️ Самая большая армия (+2)</div>}
                    </div>
                  </div>
                )}

                {/* Dice Stats */}
                {s.diceStats && s.diceStats.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">Частые числа на кубиках:</h3>
                    <div className="flex gap-2 flex-wrap">
                      {s.diceStats.map(n => (
                        <span key={n} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full font-bold shadow-sm">{n}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Players */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Участники ({s.num_players}):</h3>
                  <div className="flex flex-wrap gap-2">
                    {s.players_list.map(p => (
                      <span key={p} className={`px-3 py-1 rounded-full text-sm ${p === s.winner ? 'bg-orange-100 text-orange-800 font-bold border border-orange-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {s.notes && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-gray-700 italic">
                    "{s.notes}"
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPhotoZoomModal = () => {
    if (!photoToZoom) return null;
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-4"
        onClick={() => setPhotoToZoom(null)}
      >
        <img
          src={photoToZoom}
          alt="Zoomed"
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onClick={e => e.stopPropagation()} // Prevent closing when clicking on image
        />
      </div>
    );
  };

  if (loading) {
      return <div className="p-8 text-center text-gray-500">Загрузка базы данных...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {renderPlayerProfile()}
      {renderSessionDetails()}
      {renderPhotoZoomModal()}

      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-catan-blue">Лидерборд и Статистика</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-semibold shadow-md transition-colors"
        >
          {showForm ? 'Закрыть форму' : '+ Новая Игра'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200 animate-fade-in">
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Новая игровая сессия</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Group Selection */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <label className="block text-sm font-bold text-gray-700 mb-2">1. Выберите Группу</label>
              {groups.length === 0 ? (
                <div className="text-red-500 text-sm">
                  Нет доступных групп. <Link to="/groups" className="underline font-bold">Создайте группу</Link> сначала.
                </div>
              ) : (
                <>
                  <select 
                    required 
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 mb-2"
                    value={selectedGroupId} 
                    onChange={e => {
                      setSelectedGroupId(e.target.value);
                      setWinner('');
                    }}
                  >
                    <option value="">-- Список Групп --</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  {selectedGroupId && (
                    <div className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                      <span className="font-semibold">Игроки в сессии:</span> {getSelectedGroupPlayers().join(', ')}
                    </div>
                  )}
                </>
              )}
            </div>

            {selectedGroupId && (
              <>
                {/* Winner Selection & Photo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">2. Победитель</label>
                    <select 
                      required 
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={winner} 
                      onChange={e => setWinner(e.target.value)}
                    >
                      <option value="">Кто победил?</option>
                      {getSelectedGroupPlayers().map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">Фото победителя</label>
                     <div className="flex items-center space-x-4">
                       <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded shadow-sm">
                          <span>Загрузить фото</span>
                          <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageUpload}
                              className="hidden"
                          />
                       </label>
                       {winnerPhoto && (
                          <div className="h-12 w-12 rounded-full overflow-hidden border border-green-500">
                            <img src={winnerPhoto} alt="Preview" className="h-full w-full object-cover" />
                          </div>
                       )}
                       {winnerPhoto && <span className="text-xs text-green-600 font-bold">Загружено!</span>}
                     </div>
                     <p className="text-xs text-gray-400 mt-1">Фото сохраняется локально в базе данных.</p>
                  </div>
                </div>

                {/* Score Calculator */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-gray-700">3. Подсчет очков (Детализация)</h3>
                     <div className={`text-xl font-bold px-3 py-1 rounded ${score.total > MAX_SCORE ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-800'}`}>
                        Итого: {score.total} / {MAX_SCORE}
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Settlements */}
                    <div className="flex items-center justify-between bg-white p-2 rounded shadow-sm border border-gray-100">
                      <span className="text-sm font-medium flex items-center">🛖 Поселения (1)</span>
                      <div className="flex items-center space-x-2">
                        <button type="button" onClick={() => updateScore('settlements', Math.max(0, score.settlements - 1))} className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 font-bold">-</button>
                        <span className="w-6 text-center font-mono">{score.settlements}</span>
                        <button type="button" onClick={() => updateScore('settlements', Math.min(5, score.settlements + 1))} className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 font-bold" disabled={score.total >= MAX_SCORE}>+</button>
                      </div>
                    </div>

                    {/* Cities */}
                    <div className="flex items-center justify-between bg-white p-2 rounded shadow-sm border border-gray-100">
                      <span className="text-sm font-medium flex items-center">🏙️ Города (2)</span>
                      <div className="flex items-center space-x-2">
                        <button type="button" onClick={() => updateScore('cities', Math.max(0, score.cities - 1))} className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 font-bold">-</button>
                        <span className="w-6 text-center font-mono">{score.cities}</span>
                        <button type="button" onClick={() => updateScore('cities', Math.min(4, score.cities + 1))} className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 font-bold" disabled={score.total >= MAX_SCORE}>+</button>
                      </div>
                    </div>

                    {/* VP Cards */}
                    <div className="flex items-center justify-between bg-white p-2 rounded shadow-sm border border-gray-100">
                      <span className="text-sm font-medium flex items-center">🃏 Карты ПО (1)</span>
                      <div className="flex items-center space-x-2">
                        <button type="button" onClick={() => updateScore('victoryCards', Math.max(0, score.victoryCards - 1))} className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 font-bold">-</button>
                        <span className="w-6 text-center font-mono">{score.victoryCards}</span>
                        <button type="button" onClick={() => updateScore('victoryCards', Math.min(5, score.victoryCards + 1))} className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 font-bold" disabled={score.total >= MAX_SCORE}>+</button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4">
                    <label className={`flex items-center space-x-2 cursor-pointer p-3 rounded border transition-colors select-none ${score.longestRoad ? 'bg-green-100 border-green-400' : 'bg-white border-gray-200'}`}>
                      <input 
                        type="checkbox" 
                        checked={score.longestRoad}
                        onChange={(e) => updateScore('longestRoad', e.target.checked)}
                        disabled={!score.longestRoad && score.total >= MAX_SCORE}
                        className="rounded text-green-600 focus:ring-green-500 h-5 w-5"
                      />
                      <span className="text-sm font-semibold">🛣️ Longest Road (2)</span>
                    </label>

                    <label className={`flex items-center space-x-2 cursor-pointer p-3 rounded border transition-colors select-none ${score.largestArmy ? 'bg-red-100 border-red-400' : 'bg-white border-gray-200'}`}>
                      <input 
                        type="checkbox" 
                        checked={score.largestArmy}
                        onChange={(e) => updateScore('largestArmy', e.target.checked)}
                        disabled={!score.largestArmy && score.total >= MAX_SCORE}
                        className="rounded text-red-600 focus:ring-red-500 h-5 w-5"
                      />
                      <span className="text-sm font-semibold">⚔️ Largest Army (2)</span>
                    </label>
                  </div>
                </div>

                {/* Dice Stats */}
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">4. Горячие числа кубиков</label>
                   <div className="flex flex-wrap gap-2">
                      {[2,3,4,5,6,8,9,10,11,12].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => toggleDiceStat(num)}
                          className={`w-10 h-10 rounded-full font-bold text-sm border transition-all transform hover:scale-105 ${
                            diceStats.includes(num) 
                              ? 'bg-catan-blue text-white border-blue-900 shadow-md scale-110' 
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                   </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700">5. Заметки</label>
                  <textarea 
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    rows={2} 
                    placeholder="Эпичные моменты игры..."
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-catan-orange text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-lg text-lg"
                  disabled={score.total === 0}
                >
                  💾 Сохранить Игру
                </button>
              </>
            )}
          </form>
        </div>
      )}

      {/* Leaderboard Tables */}
      <div className="bg-white rounded-xl shadow overflow-hidden mb-8">
        <div className="bg-catan-orange px-6 py-4 flex justify-between items-center">
          <h2 className="text-white text-lg font-bold uppercase tracking-wider">Рейтинг Игроков</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Место</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Игрок</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Побед</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Игр</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Винрейт</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase text-red-500">Стрик (30д)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.map((player, index) => (
                <tr 
                  key={player.name} 
                  onClick={() => setSelectedPlayer(player.name)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : index + 1}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 underline decoration-dotted decoration-gray-400">{player.name}</td>
                  <td className="px-6 py-4 text-green-600 font-semibold">{player.wins}</td>
                  <td className="px-6 py-4 text-gray-500">{player.totalGames}</td>
                  <td className="px-6 py-4 text-gray-500">{player.winRate}%</td>
                  <td className="px-6 py-4 font-bold text-red-600">{player.maxStreak > 1 ? `🔥 ${player.maxStreak}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">История Игр</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Группа</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Победитель</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Очки</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session) => (
                <tr 
                  key={session.id} 
                  onClick={() => setSelectedSession(session)}
                  className="hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm text-gray-500">{session.created_date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{session.session_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        {session.winnerPhoto && <img src={session.winnerPhoto} className="w-8 h-8 rounded-full mr-2 object-cover border border-gray-300 cursor-pointer" alt="" onClick={(e) => { e.stopPropagation(); setPhotoToZoom(session.winnerPhoto!); }} />}
                        <span className="text-sm font-bold text-catan-orange">{session.winner} 🏆</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                    {session.scoreBreakdown ? session.scoreBreakdown.total : '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button 
                      onClick={(e) => handleDelete(session.id, e)} 
                      className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;