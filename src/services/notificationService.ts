import { LocalNotifications } from '@capacitor/local-notifications';
import { UserData, NotificationSettings } from '../types';
import { translations } from '../translations';
import { LIFE_EXPECTANCY } from '../constants';
import { QUOTES } from '../constants/quotes';
import { 
  differenceInYears, 
  addYears, 
  startOfMonth, 
  addMonths, 
  isSameDay, 
  parseISO, 
  differenceInMonths, 
  differenceInWeeks, 
  differenceInDays,
  startOfYear,
  addDays
} from 'date-fns';

export class NotificationService {
  static async getPermissionStatus(): Promise<'default' | 'granted' | 'denied' | 'unsupported'> {
    try {
      const check = await LocalNotifications.checkPermissions();
      if (check.display === 'granted') return 'granted';
      if (check.display === 'denied') return 'denied';
      return 'default';
    } catch (e) {
      console.error('Failed to check notification permissions:', e);
      return 'unsupported';
    }
  }

  static async requestPermissions() {
    try {
      const check = await LocalNotifications.checkPermissions();
      if (check.display === 'granted') return true;
      
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } catch (e) {
      console.error('Failed to request notification permissions:', e);
      return false;
    }
  }

  static async scheduleNotifications(userData: UserData) {
    // IDs to cancel: 1-10 (daily quotes), 2 (monthly), 3 (birthday), 40-50 (weekly life)
    const idsToCancel = [1, 2, 3, 4, 10, 11, 12, 13, 14, 15, 16, 40, 41, 42, 43];
    const now = new Date();
    
    if (!userData.notifications?.enabled) {
      await LocalNotifications.cancel({ notifications: idsToCancel.map(id => ({ id })) });
      return;
    }

    const granted = await this.requestPermissions();
    if (!granted) return;

    const settings = userData.notifications;
    const t = translations[userData.language || 'ja'];

    // Cancel existing notifications to reschedule
    await LocalNotifications.cancel({ notifications: idsToCancel.map(id => ({ id })) });

    const notifications = [];
    const [hours, minutes] = settings.dailyTime.split(':').map(Number);

    const getScheduledTime = (extraMinutes: number) => {
      let h = hours;
      let m = minutes + extraMinutes;
      if (m >= 60) {
        h = (h + Math.floor(m / 60)) % 24;
        m = m % 60;
      }
      return { hour: h, minute: m };
    };

    // 1. Birthday Notification (ID: 3)
    if (settings.birthdayMessage) {
      const birthDate = parseISO(userData.birthDate);
      const time = getScheduledTime(0);
      notifications.push({
        id: 3,
        title: t.birthdayTitle,
        body: t.happyBirthdayMsg,
        schedule: {
          allowWhileIdle: true,
          on: {
            month: birthDate.getMonth() + 1,
            day: birthDate.getDate(),
            hour: time.hour,
            minute: time.minute
          }
        }
      });
    }

    // 2. Daily Quote Notification (IDs: 10-16 for next 7 days)
    if (settings.dailyQuote) {
      const lang = userData.language || 'ja';
      const category = settings.quoteCategory || 'mementoMori';
      const quotes = QUOTES[lang][category];
      const time = getScheduledTime(1);
      
      for (let i = 0; i < 7; i++) {
        const targetDate = addDays(now, i);
        const dayOfYear = Math.floor((targetDate.getTime() - startOfYear(targetDate).getTime()) / (1000 * 60 * 60 * 24));
        const index = (targetDate.getFullYear() + dayOfYear) % quotes.length;
        const quote = quotes[index];

        const scheduledDate = new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          targetDate.getDate(),
          time.hour,
          time.minute
        );

        // If the scheduled time for today has already passed, skip today
        if (scheduledDate <= now) {
          continue; 
        }

        notifications.push({
          id: 10 + i,
          title: t.quote,
          body: quote,
          schedule: {
            allowWhileIdle: true,
            at: scheduledDate
          }
        });
      }
    }

    // 3. Weekly Remaining Life Notification (IDs: 40-43 for next 4 weeks)
    if (settings.weeklyLife) {
      const birthDate = parseISO(userData.birthDate);
      const expectancyYears = userData.lifeExpectancyOverride || 
        (LIFE_EXPECTANCY[userData.country] ? 
          (userData.gender === 'male' ? LIFE_EXPECTANCY[userData.country].male : LIFE_EXPECTANCY[userData.country].female) : 
          80);
      const deathDate = addYears(birthDate, expectancyYears);
      const time = getScheduledTime(2);

      // Find next Monday (or beginning of week)
      let nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + ((7 - now.getDay() + 1) % 7 || 7));
      
      for (let i = 0; i < 4; i++) {
        const targetDate = addDays(nextMonday, i * 7);
        const years = differenceInYears(deathDate, targetDate);
        const dateAfterYears = addYears(targetDate, years);
        const months = differenceInMonths(deathDate, dateAfterYears);
        const dateAfterMonths = addMonths(dateAfterYears, months);
        const days = differenceInDays(deathDate, dateAfterMonths);
        
        const body = `${years}${t.yearLabel} ${months}${t.monthLabel} ${days}${t.weekLabel}`;

        const scheduledDate = new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          targetDate.getDate(),
          time.hour,
          time.minute
        );

        if (scheduledDate <= now) continue;

        notifications.push({
          id: 40 + i,
          title: t.remainingLife,
          body: body,
          schedule: {
            allowWhileIdle: true,
            at: scheduledDate
          }
        });
      }
    }

    // 4. Monthly Update Notification (ID: 2)
    if (settings.monthlyUpdate) {
      const annualGoals = userData.bucketList?.filter(i => i.category === 'annual') || [];
      const completedCount = annualGoals.filter(i => i.completed).length;
      const progress = annualGoals.length > 0 ? Math.round((completedCount / annualGoals.length) * 100) : 0;

      const monthStartedMsg = t.monthStartedMsg || '{month}が始まりました。';
      const goalProgressMsg = t.goalProgressMsg || '今年の目標の進捗は{progress}%です。';
      const keepItUp = t.keepItUp || "この調子で頑張りましょう！";

      const monthName = new Date().toLocaleString(userData.language || 'ja', { month: 'long' });
      let body = monthStartedMsg.replace('{month}', monthName) + ' ';
      if (progress === 100) {
        body += t.goal100Msg || 'すべての目標を達成しました！';
      } else {
        body += goalProgressMsg.replace('{progress}', progress.toString()) + ' ' + keepItUp;
      }

      const time = getScheduledTime(3);

      notifications.push({
        id: 2,
        title: t.notifications,
        body: body,
        schedule: {
          allowWhileIdle: true,
          on: {
            day: 1,
            hour: time.hour,
            minute: time.minute
          }
        }
      });
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  }

  static async sendTestNotification(t: any) {
    console.log('Attempting to send test notification...');
    
    const granted = await this.requestPermissions();
    console.log('Permission status after request:', granted);
    
    if (!granted) {
      console.warn('Notification permission not granted');
      return 'denied';
    }

    try {
      // Try scheduling 1 second in the future, which is sometimes more reliable than immediate
      const result = await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 10000),
            title: 'Bucket List',
            body: t.testNotificationMsg || 'This is a test notification! It works! ✨',
            schedule: { at: new Date(Date.now() + 1000) } 
          }
        ]
      });
      console.log('Capacitor notification scheduled successfully:', result);
      return 'success';
    } catch (e) {
      console.error('Failed to schedule Capacitor notification:', e);
      return 'error';
    }
  }
}
