import { useState, useEffect } from 'react';

const moodIcons = {
  "Спокойно": "waves", "Нормально": "fiber_manual_record", "Устала": "nights_stay",
  "Тревожно": "cloud", "Грустно": "water_drop", "Воодушевлена": "sunny"
};

type MoodType = keyof typeof moodIcons;
type TabType = 'home' | 'bookmarks' | 'settings' | 'notifications';

// УБЕДИСЬ, ЧТО ЗДЕСЬ ТВОЙ IP (например 192.168.100.17)
const API_URL = "https://your-project.onrender.com/api";;

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentMood, setCurrentMood] = useState<MoodType>("Воодушевлена");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const [homeData, setHomeData] = useState<any>(null);
  const [bookmarksList, setBookmarksList] = useState<any[]>([]);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);

  // Состояния для фильтров закладок и тумблеров настроек
  const [bookmarkFilter, setBookmarkFilter] = useState<'all' | 'horoscope' | 'support'>('all');
  const [toggles, setToggles] = useState({ horoscope: true, holidays: false, support: true });

  const [isSupportSaved, setIsSupportSaved] = useState(false);
  const [isHoroscopeSaved, setIsHoroscopeSaved] = useState(false);

  // Динамическая дата клиента
  const todayFormatted = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  useEffect(() => {
    fetch(`${API_URL}/home`).then(res => res.json()).then(data => {
      setHomeData(data);
      setCurrentMood(data.user.currentMood as MoodType);
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (activeTab === 'bookmarks') fetch(`${API_URL}/bookmarks`).then(res => res.json()).then(data => setBookmarksList(data));
    if (activeTab === 'notifications') fetch(`${API_URL}/notifications`).then(res => res.json()).then(data => setNotificationsList(data));
  }, [activeTab]);

  useEffect(() => {
    document.body.style.overflow = isSheetOpen ? 'hidden' : 'unset';
  }, [isSheetOpen]);

  const handleMoodSelect = (mood: MoodType) => {
    setCurrentMood(mood);
    setTimeout(() => setIsSheetOpen(false), 150);
    fetch(`${API_URL}/mood`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mood: mood }) })
    .then(res => res.json()).then(updatedData => setHomeData(updatedData));
  };

  const handleNextPhrase = () => {
    fetch(`${API_URL}/phrase?mood=${currentMood}`).then(res => res.json())
      .then(data => setHomeData((prev: any) => ({ ...prev, support: { ...prev.support, phrase: data.phrase } })));
  };

  const handleSaveSupport = () => {
    fetch(`${API_URL}/bookmarks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'support', content: { text: homeData.support.phrase, date: todayFormatted } }) })
    .then(() => { setIsSupportSaved(true); setTimeout(() => setIsSupportSaved(false), 2000); });
  };

  const handleSaveHoroscope = () => {
    fetch(`${API_URL}/bookmarks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'horoscope', content: { main: homeData.horoscope.main, date: todayFormatted } }) })
    .then(() => { setIsHoroscopeSaved(true); setTimeout(() => setIsHoroscopeSaved(false), 2000); });
  };

  const handleDeleteBookmark = (id: number) => {
    fetch(`${API_URL}/bookmarks/${id}`, { method: 'DELETE' }).then(() => {
        setBookmarksList(prev => prev.filter(bm => bm.id !== id));
    });
  };

  if (!homeData) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#2fa7a0] border-t-transparent rounded-full animate-spin"></div>
        <p className="font-headline text-[#006a65] font-semibold animate-pulse">Связываемся с оракулом...</p>
      </div>
    );
  }

  const getHeaderTitle = () => {
    if (activeTab === 'home') return `Сегодня — ${todayFormatted}`;
    if (activeTab === 'bookmarks') return 'Закладки';
    if (activeTab === 'notifications') return 'Уведомления';
    return 'Настройки';
  };

  // Фильтруем закладки
  const filteredBookmarks = bookmarksList.filter(bm => bookmarkFilter === 'all' || bm.type === bookmarkFilter);

  return (
    <div className="bg-[#FAF7F2] text-[#1c1c19] antialiased min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#FAF7F2]/80 backdrop-blur-md border-b border-stone-200/50">
        <div className="flex justify-between items-center px-6 py-4 max-w-xl mx-auto">
          {activeTab !== 'home' ? (
             <button onClick={() => setActiveTab('home')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
               <span className="material-symbols-outlined text-[#3d4948]">arrow_back</span>
             </button>
          ) : (
             <button onClick={() => setActiveTab('settings')} className="w-10 h-10 rounded-full overflow-hidden bg-white border-2 border-white shadow-sm active:scale-95 transition-transform">
              <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" alt="Avatar" />
            </button>
          )}
          
          <span className="font-headline font-semibold text-[#3d4948] text-lg">{getHeaderTitle()}</span>
          
          <button onClick={() => setActiveTab('notifications')} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${activeTab === 'notifications' ? 'bg-[#2fa7a0]/10 text-[#006a65]' : 'hover:bg-black/5 text-[#3d4948]'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'notifications' ? "'FILL' 1" : "'FILL' 0" }}>notifications</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={`max-w-xl mx-auto px-6 space-y-8 mt-4 transition-all duration-400 ease-out ${isSheetOpen ? 'blur-[3px] scale-[0.98] opacity-80' : ''}`}>
        
        {/* ВКЛАДКА: ГЛАВНАЯ */}
        {activeTab === 'home' && (
          <>
            <section className="space-y-1">
              <h1 className="font-headline text-4xl font-extrabold tracking-tight">Доброе утро</h1>
              <div className="inline-flex items-center px-3 py-1 bg-[#f0ede9] rounded-full text-xs font-medium text-[#3d4948] gap-1.5">
                <span>Твой знак: {homeData.user.zodiac}</span>
              </div>
            </section>

            {homeData.holiday && (
              <section className="bg-white p-5 rounded-xl flex items-center gap-5 shadow-sm border border-stone-100/50">
                <div className="w-16 h-16 flex-shrink-0 bg-[#ffdad7]/30 rounded-full flex items-center justify-center overflow-hidden">
                  <span className="material-symbols-outlined text-3xl text-[#006a65]">{homeData.holiday.icon}</span>
                </div>
                <div className="space-y-1">
                  <h2 className="font-headline text-lg font-bold">Сегодня: {homeData.holiday.title}</h2>
                  <p className="text-sm text-[#3d4948] leading-tight">{homeData.holiday.description}</p>
                </div>
              </section>
            )}

            <section className="w-full h-[200px] rounded-2xl overflow-hidden relative group shadow-md">
              <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm text-[#006a65] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">{currentMood}</div>
              <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={homeData.support.bg} alt="Mood background" />
            </section>

            <section className="bg-white p-6 rounded-2xl space-y-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-stone-100/50">
              <div className="flex justify-between items-start">
                <h2 className="font-headline text-xl font-bold">Поддержка на сегодня</h2>
                <span className="bg-[#2fa7a0]/10 text-[#006a65] px-3 py-1 rounded-full text-xs font-semibold tracking-wide">{currentMood}</span>
              </div>
              <p className="font-body leading-relaxed italic text-[#3d4948] transition-all duration-300">«{homeData.support.phrase}»</p>
              <div className="flex gap-3 pt-2">
                <button onClick={handleNextPhrase} className="flex-1 h-12 bg-[#2FA7A0] text-white rounded-xl font-semibold text-sm active:scale-95 transition-transform shadow-sm">Другая фраза</button>
                <button onClick={handleSaveSupport} disabled={isSupportSaved} className={`flex-1 h-12 border rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${isSupportSaved ? 'bg-[#f0ede9] border-transparent text-[#006a65]' : 'border-[#bcc9c7] text-[#3d4948] hover:bg-[#f6f3ee] active:scale-95'}`}>
                  <span className="material-symbols-outlined text-lg">{isSupportSaved ? 'check' : 'bookmark'}</span>
                  {isSupportSaved ? 'Сохранено' : 'Сохранить'}
                </button>
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl space-y-6 shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-stone-100/50">
              <h2 className="font-headline text-xl font-bold">Гороскоп на сегодня</h2>
              <div className="space-y-4 text-[#3d4948]">
                <div className="flex gap-3"><span className="material-symbols-outlined text-[#2fa7a0]">stars</span><p className="text-sm"><span className="font-bold text-[#1c1c19]">Главное:</span> {homeData.horoscope.main}</p></div>
                <div className="flex gap-3"><span className="material-symbols-outlined text-[#2fa7a0]">lightbulb</span><p className="text-sm"><span className="font-bold text-[#1c1c19]">Совет:</span> {homeData.horoscope.advice}</p></div>
              </div>
              <div className="flex justify-center pt-2">
                <button onClick={handleSaveHoroscope} className={`font-semibold text-sm flex items-center gap-2 transition-all ${isHoroscopeSaved ? 'text-[#006a65]' : 'text-[#2fa7a0] hover:opacity-80'}`}>
                  <span className="material-symbols-outlined text-lg">{isHoroscopeSaved ? 'check_circle' : 'bookmark_add'}</span>
                  {isHoroscopeSaved ? 'В закладках' : 'Сохранить в закладки'}
                </button>
              </div>
            </section>

            <section className="pt-2 pb-6">
              <button onClick={() => setIsSheetOpen(true)} className="w-full bg-white border border-[#bcc9c7]/40 shadow-sm rounded-2xl px-5 py-4 flex items-center gap-3 active:scale-[0.98] transition-all duration-300">
                <span className="material-symbols-outlined text-[#006a65] text-xl">tune</span>
                <span className="text-sm font-semibold flex-grow text-left">Сменить настроение</span>
                <div className="px-3 py-1 bg-[#2fa7a0]/10 rounded-full text-[11px] font-bold text-[#006a65] uppercase tracking-tight">{currentMood}</div>
                <span className="material-symbols-outlined text-[#3d4948] text-xl">expand_more</span>
              </button>
            </section>
          </>
        )}

        {/* ВКЛАДКА: ЗАКЛАДКИ (ТВОЙ НОВЫЙ ДИЗАЙН HTML) */}
        {activeTab === 'bookmarks' && (
          <section className="flex flex-col gap-6">
            <p className="text-[#3d4948] font-body text-sm leading-relaxed">Ваши сохраненные моменты и предсказания в одном безопасном месте.</p>
            
            {/* Фильтры */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button onClick={() => setBookmarkFilter('all')} className={`flex-shrink-0 px-6 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${bookmarkFilter === 'all' ? 'bg-[#2fa7a0] text-white' : 'bg-white border border-[#bcc9c7] text-[#3d4948]'}`}>Все</button>
              <button onClick={() => setBookmarkFilter('horoscope')} className={`flex-shrink-0 px-6 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${bookmarkFilter === 'horoscope' ? 'bg-[#2fa7a0] text-white' : 'bg-white border border-[#bcc9c7] text-[#3d4948]'}`}>Гороскоп</button>
              <button onClick={() => setBookmarkFilter('support')} className={`flex-shrink-0 px-6 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${bookmarkFilter === 'support' ? 'bg-[#2fa7a0] text-white' : 'bg-white border border-[#bcc9c7] text-[#3d4948]'}`}>Поддержка</button>
            </div>

            {/* Карточки */}
            <div className="space-y-4">
              {filteredBookmarks.length === 0 ? (
                <div className="text-center pt-10 opacity-60">
                  <span className="material-symbols-outlined text-4xl mb-2">bookmark_border</span>
                  <p className="font-body text-[#3d4948]">Тут пока пусто.</p>
                </div>
              ) : (
                filteredBookmarks.map(bm => (
                  <div key={bm.id} className="bg-white rounded-[24px] p-5 flex flex-col gap-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] relative">
                    <button onClick={() => handleDeleteBookmark(bm.id)} className="absolute top-5 right-5 text-[#bcc9c7] hover:text-red-400 active:scale-90 transition-all z-10">
                      <span className="material-symbols-outlined text-[22px]">delete</span>
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f0f9f8] flex items-center justify-center text-[#2fa7a0]">
                        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {bm.type === 'support' ? 'favorite' : 'auto_awesome'}
                        </span>
                      </div>
                      <div>
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f0f9f8] text-[10px] font-bold text-[#2fa7a0] mb-0.5 uppercase tracking-wider">
                          {bm.type === 'support' ? 'Поддержка' : 'Гороскоп'}
                        </div>
                        <p className="text-[11px] text-[#3d4948]">{bm.content.date || todayFormatted}</p>
                      </div>
                    </div>
                    <p className="text-[#1C1C19] font-headline font-medium text-[15px] leading-relaxed pr-6">
                      {bm.type === 'support' ? `«${bm.content.text}»` : bm.content.main}
                    </p>
                    <button className="w-full py-2.5 rounded-full border border-[#2fa7a0] text-[#2fa7a0] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#2fa7a0]/5 active:scale-95 transition-all">
                      Открыть <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ВКЛАДКА: УВЕДОМЛЕНИЯ */}
        {activeTab === 'notifications' && (
          <section className="space-y-4">
            {notificationsList.map(n => (
                <div key={n.id} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex gap-4 items-start">
                  <div className="w-10 h-10 bg-[#2fa7a0]/10 text-[#006a65] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined">mark_email_unread</span>
                  </div>
                  <div>
                    <p className="text-[#1c1c19] font-semibold text-sm leading-tight">{n.text}</p>
                    <p className="text-[#bcc9c7] text-xs mt-1">{n.time}</p>
                  </div>
                </div>
            ))}
          </section>
        )}

        {/* ВКЛАДКА: НАСТРОЙКИ (ТВОЙ НОВЫЙ ДИЗАЙН HTML) */}
        {activeTab === 'settings' && (
          <section className="space-y-6">
            {/* Аватар профиля */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[#f6f3ee] flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                  <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" alt="Avatar" />
                </div>
                <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#2fa7a0] rounded-full flex items-center justify-center border-2 border-white shadow-sm cursor-pointer active:scale-90 transition-transform">
                  <span className="material-symbols-outlined text-white text-[14px]">photo_camera</span>
                </div>
              </div>
              <div>
                <h2 className="font-headline text-xl font-bold text-[#1c1c19]">Профиль</h2>
                <p className="text-[#2fa7a0] text-sm cursor-pointer font-medium hover:underline">Сменить фото</p>
              </div>
            </div>

            {/* Данные пользователя */}
            <div className="bg-white rounded-[24px] p-5 space-y-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
              <div>
                <label className="block text-[#1c1c19] text-[13px] font-bold font-headline mb-1.5 ml-1">Электронная почта</label>
                <input type="text" readOnly value={homeData.user.profile.email} className="w-full bg-[#f6f3ee] border-none rounded-xl py-3 px-4 text-sm text-[#3d4948] outline-none font-body cursor-default" />
              </div>
              <div>
                <label className="block text-[#1c1c19] text-[13px] font-bold font-headline mb-1.5 ml-1">Дата рождения</label>
                <input type="text" readOnly value={homeData.user.profile.birthDate} className="w-full bg-[#f6f3ee] border-none rounded-xl py-3 px-4 text-sm text-[#3d4948] outline-none font-body cursor-default" />
              </div>
              <div>
                <label className="block text-[#1c1c19] text-[13px] font-bold font-headline mb-1.5 ml-1">Время гороскопа</label>
                <input type="text" readOnly value={homeData.user.profile.horoscopeTime} className="w-full bg-[#f6f3ee] border-none rounded-xl py-3 px-4 text-sm text-[#3d4948] outline-none font-body cursor-pointer hover:bg-[#ebe8e3] transition-colors" />
              </div>
            </div>

            {/* Тумблеры Контента */}
            <div className="bg-white rounded-[24px] p-5 space-y-5 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
              <h3 className="font-headline text-[13px] font-bold text-[#1c1c19] mb-2 ml-1">Контент</h3>
              
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setToggles({...toggles, horoscope: !toggles.horoscope})}>
                <span className="font-headline font-semibold text-[#3d4948] text-[15px]">Гороскоп</span>
                <div className={`w-[46px] h-[26px] rounded-full relative transition-colors duration-300 ${toggles.horoscope ? 'bg-[#2fa7a0]' : 'bg-[#e5e2dd]'}`}>
                  <div className={`w-[22px] h-[22px] bg-white rounded-full absolute top-[2px] transition-transform duration-300 shadow-sm ${toggles.horoscope ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}></div>
                </div>
              </div>

              <div className="flex justify-between items-center cursor-pointer" onClick={() => setToggles({...toggles, holidays: !toggles.holidays})}>
                <span className="font-headline font-semibold text-[#3d4948] text-[15px]">Праздники</span>
                <div className={`w-[46px] h-[26px] rounded-full relative transition-colors duration-300 ${toggles.holidays ? 'bg-[#2fa7a0]' : 'bg-[#e5e2dd]'}`}>
                  <div className={`w-[22px] h-[22px] bg-white rounded-full absolute top-[2px] transition-transform duration-300 shadow-sm ${toggles.holidays ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}></div>
                </div>
              </div>

              <div className="flex justify-between items-center cursor-pointer" onClick={() => setToggles({...toggles, support: !toggles.support})}>
                <span className="font-headline font-semibold text-[#3d4948] text-[15px]">Поддержка на сегодня</span>
                <div className={`w-[46px] h-[26px] rounded-full relative transition-colors duration-300 ${toggles.support ? 'bg-[#2fa7a0]' : 'bg-[#e5e2dd]'}`}>
                  <div className={`w-[22px] h-[22px] bg-white rounded-full absolute top-[2px] transition-transform duration-300 shadow-sm ${toggles.support ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}></div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Шторка смены настроения */}
      <div className={`fixed inset-0 bg-black/30 z-40 backdrop-blur-sm transition-opacity duration-400 ${isSheetOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsSheetOpen(false)}></div>
      <div className={`fixed bottom-0 left-0 right-0 z-50 flex justify-center transition-transform duration-400 ease-out ${isSheetOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="w-full max-w-xl bg-white rounded-t-[28px] shadow-2xl p-6 flex flex-col max-h-[85vh]">
          <div className="w-12 h-1.5 bg-[#ebe8e3] rounded-full self-center mb-6"></div>
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <h2 className="font-headline text-2xl font-bold">Сменить настроение</h2>
              <p className="text-[#3d4948] text-sm font-medium">Сейчас: {currentMood}</p>
            </div>
            <button onClick={() => setIsSheetOpen(false)} className="text-[#006a65] font-semibold text-sm py-2 px-3 bg-[#2fa7a0]/10 rounded-full hover:bg-[#2fa7a0]/20 transition-colors">Готово</button>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto pr-1 pb-8">
            {(Object.keys(moodIcons) as MoodType[]).map((mood) => {
              const isSelected = currentMood === mood;
              return (
                <button key={mood} onClick={() => !isSelected && handleMoodSelect(mood)} className={`flex items-center justify-between p-4 rounded-2xl transition-all text-left ${isSelected ? 'bg-[#2FA7A0]/10 border border-[#2FA7A0]/30' : 'bg-transparent border border-transparent hover:bg-[#f6f3ee] active:scale-[0.98]'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center ${isSelected ? 'bg-[#2FA7A0]/20' : 'bg-[#f6f3ee]'}`}>
                      <span className={`material-symbols-outlined ${isSelected ? 'mood-icon-selected text-[#006a65]' : 'mood-icon text-[#3d4948]'}`}>{moodIcons[mood]}</span>
                    </div>
                    <span className={`font-headline ${isSelected ? 'font-bold text-[#006a65]' : 'font-semibold text-[#1c1c19]'}`}>{mood}</span>
                  </div>
                  {isSelected && <span className="material-symbols-outlined text-[#006a65] text-xl font-bold">check_circle</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Nav (Новый стиль) */}
      <nav className={`fixed bottom-0 left-0 w-full z-30 rounded-t-3xl bg-[#ffffff]/90 backdrop-blur-2xl shadow-[0_-4px_40px_rgba(0,0,0,0.06)] border-t border-stone-100 transition-all duration-300 ${isSheetOpen ? 'opacity-0 translate-y-full' : 'translate-y-0'}`}>
        <div className="flex justify-around items-center px-4 pb-6 pt-4 max-w-xl mx-auto">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center justify-center rounded-[1.5rem] px-5 py-2 transition-transform active:scale-90 duration-300 ${activeTab === 'home' ? 'bg-[#2fa7a0]/15 text-[#006a65]' : 'bg-transparent text-stone-400 hover:text-[#006a65]'}`}>
            <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: activeTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
            <span className="font-body font-medium text-[11px]">Домой</span>
          </button>
          
          <button onClick={() => setActiveTab('bookmarks')} className={`flex flex-col items-center justify-center rounded-[1.5rem] px-5 py-2 transition-transform active:scale-90 duration-300 ${activeTab === 'bookmarks' ? 'bg-[#2fa7a0]/15 text-[#006a65]' : 'bg-transparent text-stone-400 hover:text-[#006a65]'}`}>
            <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: activeTab === 'bookmarks' ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
            <span className="font-body font-medium text-[11px]">Закладки</span>
          </button>
          
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center justify-center rounded-[1.5rem] px-5 py-2 transition-transform active:scale-90 duration-300 ${activeTab === 'settings' ? 'bg-[#2fa7a0]/15 text-[#006a65]' : 'bg-transparent text-stone-400 hover:text-[#006a65]'}`}>
            <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: activeTab === 'settings' ? "'FILL' 1" : "'FILL' 0" }}>settings</span>
            <span className="font-label text-[11px] font-medium mt-1">Настройки</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;