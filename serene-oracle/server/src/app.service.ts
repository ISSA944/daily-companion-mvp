import { Injectable } from '@nestjs/common';

const moodData = {
  "Спокойно": { phrases: ["Гармония внутри вас создает порядок вокруг.", "Дышите ровно, этот день принадлежит вам.", "Ваше спокойствие — ваш главный ресурс сегодня.", "Всё идет своим чередом, никуда не спешите."], icon: "waves", bg: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80" },
  "Нормально": { phrases: ["Обычный день — это фундамент для необычных свершений.", "Двигайтесь в своем темпе, всё идет по плану.", "Сегодня хороший день, чтобы просто быть собой.", "Продолжайте в том же духе, вы молодец."], icon: "fiber_manual_record", bg: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=400&q=80" },
  "Устала": { phrases: ["Позвольте себе отдых. Вы не обязаны быть продуктивной 24/7.", "Сделайте паузу. Мир подождет, пока вы восстановите силы.", "Будьте бережны к себе, ваш комфорт сегодня в приоритете.", "Не вините себя за усталость. Ваш организм просит заботы."], icon: "nights_stay", bg: "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?auto=format&fit=crop&w=400&q=80" },
  "Тревожно": { phrases: ["Тревога — это просто облако на вашем небе. Оно пройдет.", "Сосредоточьтесь на том, что можете контролировать здесь и сейчас.", "Сделайте глубокий вдох. Вы в безопасности.", "Позвольте себе отпустить напряжение, шаг за шагом."], icon: "cloud", bg: "https://images.unsplash.com/photo-1499988921418-b7df40ff03f9?auto=format&fit=crop&w=400&q=80" },
  "Грустно": { phrases: ["Грусть — естественная эмоция. Дайте себе время.", "Даже после самого сильного дождя всегда выходит солнце.", "Не прячьте свои чувства, позвольте им просто быть.", "Обнимите себя сегодня чуть крепче."], icon: "water_drop", bg: "https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&w=400&q=80" },
  "Воодушевлена": { phrases: ["Твоя внутренняя сила подобна тихому океану — в ней скрыта энергия, способная менять миры.", "Используйте эту энергию, чтобы сделать шаг к своей мечте!", "Сегодня ваш день! Заряжайте окружающих своим светом.", "Не бойтесь сиять ярко и пробовать новое!"], icon: "sunny", bg: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=400&q=80" }
};

@Injectable()
export class AppService {
  // Добавили данные для профиля (Настройки)
  private userState = { 
    zodiac: 'Лев ♌︎', 
    currentMood: 'Воодушевлена',
    profile: {
      email: 'example@mail.com',
      birthDate: '12.03.1994',
      horoscopeTime: '09:00'
    }
  };
  private phraseIndices = { "Спокойно": 0, "Нормально": 0, "Устала": 0, "Тревожно": 0, "Грустно": 0, "Воодушевлена": 0 };
  private bookmarks: any[] = [];
  private notifications = [
    { id: 1, text: "Луна перешла в знак Тельца. Время для уюта.", time: "10:00" },
    { id: 2, text: "Не забудьте сохранить поддержку на сегодня!", time: "09:15" }
  ];

  getHolidayForToday() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;

    // Автоматическая проверка даты (будет меняться каждый день!)
    if (day === 7 && month === 4) return { title: "Благовещение и День Здоровья", description: "А еще сегодня день рождения Рунета! Сияй в этот день.", icon: "local_florist" };
    if (day === 8 && month === 4) return { title: "День российской анимации", description: "Отличный повод пересмотреть любимый мультфильм из детства.", icon: "animation" };
    if (day === 9 && month === 4) return { title: "День чистоты", description: "Идеальное время навести порядок в мыслях и вокруг себя.", icon: "eco" };
    
    return null; 
  }

  getHomePack() {
    const mood = this.userState.currentMood;
    const currentIndex = this.phraseIndices[mood];
    return {
      user: this.userState,
      holiday: this.getHolidayForToday(),
      support: { mood: mood, phrase: moodData[mood].phrases[currentIndex], icon: moodData[mood].icon, bg: moodData[mood].bg },
      horoscope: { date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }), main: "День принесет неожиданные озарения в творчестве.", advice: "Не бойтесь проявлять инициативу в личных делах." }
    };
  }

  updateUserMood(newMood: string) {
    if (moodData[newMood]) this.userState.currentMood = newMood;
    return this.getHomePack();
  }

  getNextPhrase(mood: string) {
    if (moodData[mood]) {
      this.phraseIndices[mood] = (this.phraseIndices[mood] + 1) % moodData[mood].phrases.length;
      return { phrase: moodData[mood].phrases[this.phraseIndices[mood]] };
    }
    return { phrase: "" };
  }

  saveBookmark(type: string, content: any) {
    const newBookmark = { id: Date.now(), type, content, created_at: new Date() };
    this.bookmarks.push(newBookmark);
    return { success: true, count: this.bookmarks.length };
  }

  getBookmarks() {
    return [...this.bookmarks].sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  deleteBookmark(id: number) {
    this.bookmarks = this.bookmarks.filter(bm => bm.id !== id);
    return { success: true };
  }
  
  getNotifications() {
    return this.notifications;
  }
}