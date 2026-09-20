import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { TradingAlarm, NotificationActionTarget } from '../types';

export const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  (Constants as any).appOwnership === 'expo';

// Configura o comportamento das notificações quando o app está em primeiro plano (apenas fora do Expo Go para evitar incompatibilidade)
if (!isExpoGo && Platform.OS !== 'web') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
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
  if (Platform.OS === 'web' || isExpoGo) {
    return false;
  }

  try {
    // 1. Configurar Canais no Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNELS.ALARMS, {
        name: 'Alarmes de Rotina e Checklists',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250, 250, 500],
        lightColor: '#06B6D4',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });

      await Notifications.setNotificationChannelAsync(ANDROID_CHANNELS.NEWS, {
        name: 'Alertas de Notícias e Volatilidade',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#EF4444',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });

      await Notifications.setNotificationChannelAsync(ANDROID_CHANNELS.TIMERS, {
        name: 'Timers de Pregão e Cool-Down',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 200, 200, 200],
        lightColor: '#10B981',
        sound: 'default',
        enableVibrate: true,
      });
    }

    // 2. Verificar/Solicitar Permissões
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
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
  if (Platform.OS === 'web' || isExpoGo) return;

  if (alarm.scheduledNotificationIds && alarm.scheduledNotificationIds.length > 0) {
    for (const notifId of alarm.scheduledNotificationIds) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notifId);
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
  if (Platform.OS === 'web' || isExpoGo || !alarm.enabled) {
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

      // Se o horário de hoje já passou, agenda para o dia seguinte se não tiver newsDate
      if (targetDate.getTime() <= now.getTime() && !alarm.newsDate) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      // Alerta Prévio (ex: 15 ou 10 min antes da notícia)
      const leadTime = alarm.leadTimeMinutes || 15;
      const leadDate = new Date(targetDate.getTime() - leadTime * 60 * 1000);

      if (leadDate.getTime() > now.getTime()) {
        const leadId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `⚠️ ${alarm.title} em ${leadTime} min`,
            body: `Atenção: notícia com alta volatilidade às ${alarm.time}. Ajuste stops ou reduza contratos.`,
            data: { actionTarget: alarm.actionTarget, alarmId: alarm.id, type: 'news_lead' },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: leadDate,
            channelId,
          },
        });
        scheduledIds.push(leadId);
      }

      // Alerta Imediato na Hora Exata da Notícia
      if (targetDate.getTime() > now.getTime()) {
        const exactId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `🚨 NOTÍCIA AGORA: ${alarm.title}`,
            body: alarm.subtitle || 'Volatilidade máxima. Evite ordens impulsivas a mercado!',
            data: { actionTarget: alarm.actionTarget, alarmId: alarm.id, type: 'news_exact' },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: targetDate,
            channelId,
          },
        });
        scheduledIds.push(exactId);
      }

      return scheduledIds;
    }

    // Caso 2: Alarme de rotina diária / semanal (segunda a sexta ou dias selecionados)
    const targetDays = alarm.days.length > 0 ? alarm.days : [1, 2, 3, 4, 5];

    for (const dayOfWeek of targetDays) {
      const expoWeekday = dayOfWeek + 1; // mapeia 0->1 (Dom), 1->2 (Seg), etc.

      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔔 ${alarm.title}`,
          body: alarm.subtitle || 'Hora de cumprir sua rotina e disciplina operacional.',
          data: { actionTarget: alarm.actionTarget, alarmId: alarm.id, type: 'routine' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
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
  if (Platform.OS === 'web' || isExpoGo) return alarms;

  try {
    // 1. Limpa todos os agendamentos anteriores
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 2. Reagenda todos os alarmes habilitados
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
  if (Platform.OS === 'web' || isExpoGo) return null;

  try {
    const triggerDate = new Date(Date.now() + durationMinutes * 60 * 1000);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏱️ ${title}`,
        body: body || `Seu tempo de resfriamento de ${durationMinutes} min acabou. Mente recarregada.`,
        data: { actionTarget: 'protocol_pre', type: 'desk_timer' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
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
 * Dispara uma notificação imediata de teste (em X segundos) para validar som e vibração
 */
export const scheduleTestNotification = async (secondsDelay: number = 3): Promise<void> => {
  if (Platform.OS === 'web' || isExpoGo) {
    alert('Notificações nativas exatas são executadas no APK / Development Build.');
    return;
  }

  await initNotifications();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔔 Teste de Alarme: Trading Mindset',
      body: 'Seu sistema de alarmes e avisos operacionais está ativo e funcionando perfeitamente!',
      data: { actionTarget: 'protocol_pre' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(secondsDelay, 1),
      repeats: false,
      channelId: ANDROID_CHANNELS.ALARMS,
    },
  });
};
