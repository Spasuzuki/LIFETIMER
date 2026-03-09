import { LocalNotifications } from '@capacitor/local-notifications';
import { UserData, NotificationSettings } from '../types';
import { translations } from '../translations';
import { LIFE_EXPECTANCY } from '../constants';
import { differenceInYears, addYears, startOfMonth, addMonths, isSameDay, parseISO, differenceInMonths, differenceInWeeks } from 'date-fns';

export class NotificationService {
  static async requestPermissions() {
    try {
      // First check native browser permission if available
      if ('Notification' in window) {
        console.log('Native browser Notification.permission:', Notification.permission);
        if (Notification.permission === 'granted') return true;
        if (Notification.permission === 'denied') {
          console.warn('Native browser notification permission is denied');
          // We still try Capacitor just in case, but usually this is final
        }
      }

      const check = await LocalNotifications.checkPermissions();
      if (check.display === 'granted') return true;
      
      const status = await LocalNotifications.requestPermissions();
      if (status.display === 'granted') return true;

      // Final fallback: try native request if Capacitor failed or returned non-granted
      if ('Notification' in window && Notification.permission !== 'denied') {
        const nativeStatus = await Notification.requestPermission();
        return nativeStatus === 'granted';
      }

      return false;
    } catch (e) {
      console.error('Failed to request notification permissions:', e);
      
      // Last ditch effort for web
      if ('Notification' in window) {
        return Notification.permission === 'granted';
      }
      return false;
    }
  }

  static async scheduleNotifications(userData: UserData) {
    if (!userData.notifications?.enabled) {
      await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }, { id: 3 }] });
      return;
    }

    const granted = await this.requestPermissions();
    if (!granted) return;

    const settings = userData.notifications;
    const t = translations[userData.language || 'ja'];

    // Cancel existing notifications to reschedule
    await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }, { id: 3 }] });

    const notifications = [];

    // 1. Daily Quote Notification
    const [hours, minutes] = settings.dailyTime.split(':').map(Number);
    
    let dailyBody = 'Open the app to see today\'s quote.';
    if (settings.includeLifeRemaining) {
      const birthDate = parseISO(userData.birthDate);
      const expectancyYears = userData.lifeExpectancyOverride || 
        (LIFE_EXPECTANCY[userData.country] ? 
          (userData.gender === 'male' ? LIFE_EXPECTANCY[userData.country].male : LIFE_EXPECTANCY[userData.country].female) : 
          80);
      const deathDate = addYears(birthDate, expectancyYears);
      const now = new Date();
      
      const years = differenceInYears(deathDate, now);
      const months = differenceInMonths(deathDate, now) % 12;
      const weeks = differenceInWeeks(deathDate, now) % 4;
      
      dailyBody = `${t.remainingTime}: ${years}${t.yearLabel} ${months}${t.monthLabel} ${weeks}${t.weekLabel}`;
    }

    notifications.push({
      id: 1,
      title: t.quote,
      body: dailyBody,
      schedule: {
        allowWhileIdle: true,
        on: {
          hour: hours,
          minute: minutes
        }
      }
    });

    // 2. Monthly Update Notification
    if (settings.monthlyUpdate) {
      const annualGoals = userData.bucketList?.filter(i => i.category === 'annual') || [];
      const completedCount = annualGoals.filter(i => i.completed).length;
      const progress = annualGoals.length > 0 ? Math.round((completedCount / annualGoals.length) * 100) : 0;

      const monthStartedMsg = t.monthStartedMsg || '{month} has started.';
      const goalProgressMsg = t.goalProgressMsg || 'Your goal progress is {progress}%.';
      const keepItUp = t.keepItUp || "Let's do our best!";

      let body = monthStartedMsg.replace('{month}', (new Date().getMonth() + 1).toString()) + ' ';
      if (progress === 100) {
        body += t.goal100Msg || 'You achieved all goals!';
      } else {
        body += goalProgressMsg.replace('{progress}', progress.toString()) + ' ' + keepItUp;
      }

      notifications.push({
        id: 2,
        title: t.notifications,
        body: body,
        schedule: {
          allowWhileIdle: true,
          on: {
            day: 1,
            hour: 9,
            minute: 0
          }
        }
      });
    }

    // 3. Birthday Notification
    if (settings.birthdayMessage) {
      const birthDate = parseISO(userData.birthDate);
      notifications.push({
        id: 3,
        title: t.birthdayTitle,
        body: t.happyBirthdayMsg,
        schedule: {
          allowWhileIdle: true,
          on: {
            month: birthDate.getMonth() + 1,
            day: birthDate.getDate(),
            hour: 0,
            minute: 0
          }
        }
      });
    }

    await LocalNotifications.schedule({ notifications });
  }

  static async sendTestNotification(t: any) {
    console.log('Attempting to send test notification...');
    
    // Log native status for debugging
    if ('Notification' in window) {
      console.log('Current native Notification.permission:', Notification.permission);
    }

    const granted = await this.requestPermissions();
    console.log('Permission status after request:', granted);
    
    if (!granted) {
      console.warn('Notification permission not granted');
      return 'denied';
    }

    // On web, native Notification API is often the most reliable for immediate feedback
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const n = new Notification('LIFE TIMER', {
          body: t.testNotificationMsg || 'This is a test notification! It works! ✨',
          tag: 'life-timer-test'
        });
        
        n.onclick = () => {
          window.focus();
          n.close();
        };
        
        console.log('Native test notification sent successfully');
        // We still try Capacitor as well to ensure it's also working
      } catch (e) {
        console.error('Native Notification API failed', e);
      }
    }

    try {
      // Try scheduling 1 second in the future, which is sometimes more reliable than immediate
      const result = await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 10000),
            title: 'LIFE TIMER',
            body: t.testNotificationMsg || 'This is a test notification! It works! ✨',
            schedule: { at: new Date(Date.now() + 1000) } 
          }
        ]
      });
      console.log('Capacitor notification scheduled successfully:', result);
      return 'success';
    } catch (e) {
      console.error('Failed to schedule Capacitor notification:', e);
      
      // If we already sent a native one, we can still return success
      if ('Notification' in window && Notification.permission === 'granted') {
        return 'success';
      }
      return 'error';
    }
  }
}
