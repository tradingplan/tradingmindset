import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { TradingAlarm, NotificationActionTarget } from '../types';

export const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  (Constants as any).appOwnership === 'expo';

/**
 * Lazy import de expo-notifications para não disparar o erro de módulo no Expo Go SDK 53+
 */
export const getNotificationsModule = (): any => {
  if (Platform.OS === 'web' || isExpoGo) {
    return null;
  }
  try {
    return require('expo-notifications');
  } catch (err) {
    console.warn('[Notifications] Could not load expo-notifications:', err);
    return null;
  }
};

// Configura o comportamento das notificações apenas fora do Expo Go
const Notifications = getNotificationsModule();
if (Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority?.MAX ?? 2,
      }),
    });
  } catch (err) {
    console.warn('[Notifications] setNotificationHandler skipped:', err);
  }
}

export const ANDROID_CHANNELS = {
  ALARMS: 'trading-alarms-high',
  NEWS: 'trading-news-urgent',
  TIMERS: 'trading-timers-live',
};

/**
 * Inicializa permissões e canais de notificação no Android
 */
export const initNotifications = async (): Promise<boolean> => {
  const notif = getNotificationsModule();
  if (!notif) {
    return false;
  }

  try {
    // 1. Configurar Canais no Android
    if (Platform.OS === 'android') {
      await notif.setNotificationChannelAsync(ANDROID_CHANNELS.ALARMS, {
        name: 'Alarmes de Rotina e Checklists',
        importance: notif.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250, 250, 500],
        lightColor: '#06B6D4',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });

      await notif.setNotificationChannelAsync(ANDROID_CHANNELS.NEWS, {
        name: 'Alertas de Notícias e Volatilidade',
        importance: notif.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#EF4444',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });

      await notif.setNotificationChannelAsync(ANDROID_CHANNELS.TIMERS, {
        name: 'Timers de Pregão e Cool-Down',
        importance: notif.AndroidImportance.HIGH,
        vibrationPattern: [0, 200, 200, 200],
        lightColor: '#10B981',
        sound: 'default',
        enableVibrate: true,
      });
    }

    // 2. Verificar/Solicitar Permissões
    const { status: existingStatus } = await notif.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await notif.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (err) {
    console.warn('Não foi possível inicializar notificações:', err);
    return false;
  }
};

/**
 * Cancela os agendamentos anteriores de um alarme
 */
export const cancelAlarmNotifications = async (alarm: TradingAlarm): Promise<void> => {
  const notif = getNotificationsModule();
  if (!notif) return;

  if (alarm.scheduledNotificationIds && alarm.scheduledNotificationIds.length > 0) {
    for (const notifId of alarm.scheduledNotificationIds) {
      try {
        await notif.cancelScheduledNotificationAsync(notifId);
      } catch (err) {
        // Ignora caso já tenha sido disparado/removido
      }
    }
  }
};

/**
 * Agenda as notificações nativas para um alarme de trading
 */
export const scheduleTradingAlarm = async (alarm: TradingAlarm): Promise<string[]> => {
  const notif = getNotificationsModule();
  if (!notif || !alarm.enabled) {
    return [];
  }

  // Cancela notificações anteriores desse alarme antes de reagendar
  await cancelAlarmNotifications(alarm);

  const scheduledIds: string[] = [];
  const [hourStr, minStr] = alarm.time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);

  if (isNaN(hour) || isNaN(minute)) {
    return [];
  }

  const channelId = alarm.category === 'news_macro' 
    ? ANDROID_CHANNELS.NEWS 
    : ANDROID_CHANNELS.ALARMS;

  try {
    // Caso 1: Alarme pontual de notícia com data específica ou hoje
    if (alarm.isNewsAlarm) {
      const now = new Date();
      const targetDate = new Date();
      targetDate.setHours(hour, minute, 0, 0);

      if (targetDate.getTime() <= now.getTime() && !alarm.newsDate) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      // Alerta Prévio (ex: 15 ou 10 min antes da notícia)
      const leadTime = alarm.leadTimeMinutes || 15;
      const leadDate = new Date(targetDate.getTime() - leadTime * 60 * 1000);

      if (leadDate.getTime() > now.getTime()) {
        const leadId = await notif.scheduleNotificationAsync({
          content: {
            title: `⚠️ ${alarm.title} em ${leadTime} min`,
            body: `Atenção: notícia com alta volatilidade às ${alarm.time}. Ajuste stops ou reduza contratos.`,
            data: { actionTarget: alarm.actionTarget, alarmId: alarm.id, type: 'news_lead' },
            sound: true,
          },
          trigger: {
            type: notif.SchedulableTriggerInputTypes.DATE,
            date: leadDate,
            channelId,
          },
        });
        scheduledIds.push(leadId);
      }

      // Alerta Imediato na Hora Exata da Notícia
      if (targetDate.getTime() > now.getTime()) {
        const exactId = await notif.scheduleNotificationAsync({
          content: {
            title: `🚨 NOTÍCIA AGORA: ${alarm.title}`,
            body: alarm.subtitle || 'Volatilidade máxima. Evite ordens impulsivas a mercado!',
            data: { actionTarget: alarm.actionTarget, alarmId: alarm.id, type: 'news_exact' },
            sound: true,
          },
          trigger: {
            type: notif.SchedulableTriggerInputTypes.DATE,
            date: targetDate,
            channelId,
          },
        });
        scheduledIds.push(exactId);
      }

      return scheduledIds;
    }

    // Caso 2: Alarme de rotina diária / semanal
    const targetDays = alarm.days.length > 0 ? alarm.days : [1, 2, 3, 4, 5];

    for (const dayOfWeek of targetDays) {
      const expoWeekday = dayOfWeek + 1; // 0->1 (Dom), 1->2 (Seg), etc.

      const notifId = await notif.scheduleNotificationAsync({
        content: {
          title: `🔔 ${alarm.title}`,
          body: alarm.subtitle || 'Hora de cumprir sua rotina e disciplina operacional.',
          data: { actionTarget: alarm.actionTarget, alarmId: alarm.id, type: 'routine' },
          sound: true,
        },
        trigger: {
          type: notif.SchedulableTriggerInputTypes.CALENDAR,
          hour,
          minute,
          weekday: expoWeekday,
          repeats: true,
          channelId,
        },
      });

      scheduledIds.push(notifId);
    }

    return scheduledIds;
  } catch (err) {
    console.error(`Erro ao agendar alarme "${alarm.title}":`, err);
    return [];
  }
};

/**
 * Sincroniza toda a lista de alarmes do app com o sistema operacional
 */
export const syncAllAlarmsWithSystem = async (alarms: TradingAlarm[]): Promise<TradingAlarm[]> => {
  const notif = getNotificationsModule();
  if (!notif) return alarms;

  try {
    await notif.cancelAllScheduledNotificationsAsync();

    const updatedAlarms: TradingAlarm[] = [];
    for (const alarm of alarms) {
      if (alarm.enabled) {
        const ids = await scheduleTradingAlarm(alarm);
        updatedAlarms.push({ ...alarm, scheduledNotificationIds: ids });
      } else {
        updatedAlarms.push({ ...alarm, scheduledNotificationIds: [] });
      }
    }

    return updatedAlarms;
  } catch (err) {
    console.error('Erro ao sincronizar alarmes com o sistema:', err);
    return alarms;
  }
};

/**
 * Agenda um Timer Live Desk (Ex: Cool-Down pós-stop de 15 minutos)
 */
export const scheduleDeskTimerNotification = async (
  title: string,
  durationMinutes: number,
  body: string
): Promise<string | null> => {
  const notif = getNotificationsModule();
  if (!notif) return null;

  try {
    const triggerDate = new Date(Date.now() + durationMinutes * 60 * 1000);

    const id = await notif.scheduleNotificationAsync({
      content: {
        title: `⏱️ ${title}`,
        body: body || `Seu tempo de resfriamento de ${durationMinutes} min acabou. Mente recarregada.`,
        data: { actionTarget: 'protocol_pre', type: 'desk_timer' },
        sound: true,
      },
      trigger: {
        type: notif.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: ANDROID_CHANNELS.TIMERS,
      },
    });

    return id;
  } catch (err) {
    console.error('Erro ao agendar timer de mesa:', err);
    return null;
  }
};

/**
 * Dispara uma notificação imediata de teste
 */
export const scheduleTestNotification = async (secondsDelay: number = 3): Promise<void> => {
  const notif = getNotificationsModule();
  if (!notif) {
    alert('Notificações nativas exatas são executadas no APK / Development Build.');
    return;
  }

  await initNotifications();

  await notif.scheduleNotificationAsync({
    content: {
      title: '🔔 Teste de Alarme: Trading Mindset',
      body: 'Seu sistema de alarmes e avisos operacionais está ativo e funcionando perfeitamente!',
      data: { actionTarget: 'protocol_pre' },
      sound: true,
    },
    trigger: {
      type: notif.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(secondsDelay, 1),
      repeats: false,
      channelId: ANDROID_CHANNELS.ALARMS,
    },
  });
};
