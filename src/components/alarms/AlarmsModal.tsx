import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import {
  Bell,
  Clock,
  Zap,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Volume2,
  Calendar,
  X,
  Play,
  Square,
  RefreshCw,
  Sparkles,
  Radio,
  ChevronRight,
} from 'lucide-react-native';
import { TradingAlarm, MacroNewsPreset, AlarmCategory, NotificationActionTarget } from '../../types';
import {
  loadAlarms,
  saveAlarms,
  toggleAlarm,
  addOrUpdateAlarm,
  deleteAlarm,
  resetToDefaultAlarms,
  DEFAULT_MACRO_NEWS_PRESETS,
} from '../../storage/alarmStore';
import {
  initNotifications,
  scheduleTradingAlarm,
  cancelAlarmNotifications,
  syncAllAlarmsWithSystem,
  scheduleTestNotification,
  scheduleDeskTimerNotification,
} from '../../services/alarmService';
import * as Haptics from 'expo-haptics';

interface AlarmsModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateToTarget?: (target: NotificationActionTarget) => void;
}

type ModalTab = 'routines' | 'news' | 'timers';

const WEEKDAYS = [
  { day: 1, label: 'Seg' },
  { day: 2, label: 'Ter' },
  { day: 3, label: 'Qua' },
  { day: 4, label: 'Qui' },
  { day: 5, label: 'Sex' },
  { day: 6, label: 'Sáb' },
  { day: 0, label: 'Dom' },
];

export const AlarmsModal: React.FC<AlarmsModalProps> = ({
  visible,
  onClose,
  onNavigateToTarget,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('routines');
  const [alarms, setAlarms] = useState<TradingAlarm[]>([]);
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  // Form State para Novo Alarme
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newDays, setNewDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [newCategory, setNewCategory] = useState<AlarmCategory>('custom');
  const [newTarget, setNewTarget] = useState<NotificationActionTarget>('none');

  // Timers de Mesa (Live HUD)
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number | null>(null);
  const [timerTotalSeconds, setTimerTotalSeconds] = useState<number>(0);
  const [timerTitle, setTimerTitle] = useState<string>('');

  useEffect(() => {
    if (visible) {
      loadData();
      initNotifications();
    }
  }, [visible]);

  // Contagem regressiva do timer de mesa
  useEffect(() => {
    let interval: any = null;
    if (activeTimerSeconds !== null && activeTimerSeconds > 0) {
      interval = setInterval(() => {
        setActiveTimerSeconds((prev) => {
          if (prev === null || prev <= 1) {
            triggerHaptic('heavy');
            Alert.alert('⏱️ Timer Finalizado', `${timerTitle || 'Seu timer de mesa'} foi concluído!`);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimerSeconds, timerTitle]);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (Platform.OS !== 'web') {
      try {
        if (style === 'heavy') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        else if (style === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
  };

  const loadData = async () => {
    const data = await loadAlarms();
    setAlarms(data);
  };

  const handleToggle = async (alarm: TradingAlarm) => {
    triggerHaptic('medium');
    const newStatus = !alarm.enabled;
    const updated = await toggleAlarm(alarm.id, newStatus);
    setAlarms(updated);

    const target = updated.find((a) => a.id === alarm.id);
    if (target) {
      if (newStatus) {
        await scheduleTradingAlarm(target);
      } else {
        await cancelAlarmNotifications(target);
      }
    }
  };

  const handleDelete = async (alarmId: string) => {
    triggerHaptic('medium');
    const target = alarms.find((a) => a.id === alarmId);
    if (target) {
      await cancelAlarmNotifications(target);
    }
    const updated = await deleteAlarm(alarmId);
    setAlarms(updated);
  };

  const handleCreateAlarm = async () => {
    if (!newTitle.trim() || !newTime.trim()) {
      Alert.alert('Campos Obrigatórios', 'Por favor preencha o título e o horário (HH:mm).');
      return;
    }

    // Valida formato HH:mm
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newTime.trim())) {
      Alert.alert('Horário Inválido', 'Use o formato HH:mm (ex: 08:30 ou 14:15).');
      return;
    }

    triggerHaptic('heavy');

    const newAlarm: TradingAlarm = {
      id: `alarm_${Date.now()}`,
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'Alarme configurado no Trading Mindset',
      time: newTime.trim(),
      enabled: true,
      days: newDays,
      category: newCategory,
      sound: 'bell',
      actionTarget: newTarget,
    };

    const scheduledIds = await scheduleTradingAlarm(newAlarm);
    newAlarm.scheduledNotificationIds = scheduledIds;

    const updated = await addOrUpdateAlarm(newAlarm);
    setAlarms(updated);

    // Limpar formulário
    setIsAddingCustom(false);
    setNewTitle('');
    setNewSubtitle('');
    setNewTime('09:00');
    setNewDays([1, 2, 3, 4, 5]);

    Alert.alert('✅ Alarme Ativado', `Alarme "${newAlarm.title}" programado para às ${newAlarm.time}.`);
  };

  const handleAddNewsPreset = async (preset: MacroNewsPreset) => {
    triggerHaptic('heavy');

    const newsAlarm: TradingAlarm = {
      id: `news_${preset.id}_${Date.now()}`,
      title: `Notícia: ${preset.name}`,
      subtitle: preset.description,
      time: preset.defaultTime,
      enabled: true,
      days: [new Date().getDay()], // hoje
      category: 'news_macro',
      sound: 'warning',
      actionTarget: 'protocol_pre',
      isNewsAlarm: true,
      leadTimeMinutes: preset.suggestedLeadTime,
    };

    const scheduledIds = await scheduleTradingAlarm(newsAlarm);
    newsAlarm.scheduledNotificationIds = scheduledIds;

    const updated = await addOrUpdateAlarm(newsAlarm);
    setAlarms(updated);

    Alert.alert(
      '🚨 Alerta de Notícia Programado',
      `Alarme duplo ativado para ${preset.name}:\n• Aviso prévio: ${preset.suggestedLeadTime} min antes\n• Alerta exato: ${preset.defaultTime}`
    );
  };

  const handleStartDeskTimer = async (title: string, minutes: number) => {
    triggerHaptic('heavy');
    const totalSecs = minutes * 60;
    setTimerTotalSeconds(totalSecs);
    setActiveTimerSeconds(totalSecs);
    setTimerTitle(title);

    await scheduleDeskTimerNotification(title, minutes, `Timer de ${minutes} min finalizado.`);
    Alert.alert('⏱️ Timer de Mesa Iniciado', `${title} iniciado (${minutes} minutos).`);
  };

  const handleCancelDeskTimer = () => {
    triggerHaptic('medium');
    setActiveTimerSeconds(null);
    setTimerTotalSeconds(0);
    setTimerTitle('');
  };

  const handleTestNotification = async () => {
    triggerHaptic('light');
    await scheduleTestNotification(3);
    Alert.alert('🔔 Alarme de Teste Enviado', 'Você receberá uma notificação de teste em 3 segundos!');
  };

  const handleResetDefaults = async () => {
    Alert.alert(
      'Restaurar Padrões?',
      'Deseja recarregar todos os alarmes e rotinas oficiais de trading?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            const defaults = await resetToDefaultAlarms();
            await syncAllAlarmsWithSystem(defaults);
            setAlarms(defaults);
            Alert.alert('Padrões Restaurados', 'Todos os alarmes recomendados foram reagendados.');
          },
        },
      ]
    );
  };

  const formatTimerDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const routineAlarms = alarms.filter((a) => !a.isNewsAlarm);
  const newsAlarms = alarms.filter((a) => a.isNewsAlarm);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.bellIconBox}>
                <Bell size={18} color={Colors.cyan} />
              </View>
              <View>
                <Text style={styles.headerTitle}>ALARMES & ALERTAS</Text>
                <Text style={styles.headerSubtitle}>COMPANION DE DISCIPLINA OPERACIONAL</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Sub Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'routines' && styles.tabButtonActive]}
              onPress={() => {
                triggerHaptic();
                setActiveTab('routines');
              }}
            >
              <Calendar size={14} color={activeTab === 'routines' ? Colors.cyan : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === 'routines' && styles.tabTextActive]}>
                Rotinas Diárias
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'news' && styles.tabButtonActive]}
              onPress={() => {
                triggerHaptic();
                setActiveTab('news');
              }}
            >
              <Zap size={14} color={activeTab === 'news' ? Colors.amber : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === 'news' && { color: Colors.amber }]}>
                Notícias Macro
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'timers' && styles.tabButtonActive]}
              onPress={() => {
                triggerHaptic();
                setActiveTab('timers');
              }}
            >
              <Clock size={14} color={activeTab === 'timers' ? Colors.emerald : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === 'timers' && { color: Colors.emerald }]}>
                Timers de Mesa
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content Body */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* 1. ABA ROTINAS DIÁRIAS */}
            {activeTab === 'routines' && (
              <View style={styles.tabContent}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>PROGRAMAÇÃO DE ROTINA (SEG A SEX)</Text>
                  <TouchableOpacity
                    style={styles.addSmallBtn}
                    onPress={() => {
                      triggerHaptic();
                      setIsAddingCustom(!isAddingCustom);
                    }}
                  >
                    <Plus size={14} color={Colors.cyan} />
                    <Text style={styles.addSmallBtnText}>Novo Alarme</Text>
                  </TouchableOpacity>
                </View>

                {/* Form Adicionar Custom */}
                {isAddingCustom && (
                  <View style={styles.formCard}>
                    <Text style={styles.formTitle}>CRIAR NOVO ALARME PERSONALIZADO</Text>

                    <Text style={styles.fieldLabel}>Título do Alarme:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: Revisão de Volatilidade 11h"
                      placeholderTextColor={Colors.textMuted}
                      value={newTitle}
                      onChangeText={setNewTitle}
                    />

                    <Text style={styles.fieldLabel}>Horário (HH:mm):</Text>
                    <TextInput
                      style={[styles.input, styles.inputTime]}
                      placeholder="08:30"
                      placeholderTextColor={Colors.textMuted}
                      value={newTime}
                      onChangeText={setNewTime}
                      maxLength={5}
                    />

                    <Text style={styles.fieldLabel}>Mensagem / Instrução:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: Verificar volume e não caçar topo"
                      placeholderTextColor={Colors.textMuted}
                      value={newSubtitle}
                      onChangeText={setNewSubtitle}
                    />

                    <Text style={styles.fieldLabel}>Ação ao tocar na Notificação:</Text>
                    <View style={styles.targetOptionsRow}>
                      {(
                        [
                          { id: 'protocol_pre', label: 'Checklist Pré' },
                          { id: 'protocol_post', label: 'Checklist Pós' },
                          { id: 'audioteca', label: 'Audioteca' },
                          { id: 'sos_tilt', label: 'SOS Tilt' },
                          { id: 'none', label: 'Apenas Som' },
                        ] as { id: NotificationActionTarget; label: string }[]
                      ).map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.targetPill,
                            newTarget === item.id && styles.targetPillActive,
                          ]}
                          onPress={() => {
                            triggerHaptic();
                            setNewTarget(item.id);
                          }}
                        >
                          <Text
                            style={[
                              styles.targetPillText,
                              newTarget === item.id && styles.targetPillTextActive,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={styles.formButtonsRow}>
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => setIsAddingCustom(false)}
                      >
                        <Text style={styles.cancelBtnText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saveAlarmBtn}
                        onPress={handleCreateAlarm}
                      >
                        <Text style={styles.saveAlarmBtnText}>Salvar e Agendar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Lista de Alarmes de Rotina */}
                {routineAlarms.map((alarm) => (
                  <View
                    key={alarm.id}
                    style={[styles.alarmCard, !alarm.enabled && styles.alarmCardDisabled]}
                  >
                    <View style={styles.alarmTimeRow}>
                      <View style={styles.alarmTimeContainer}>
                        <Text
                          style={[
                            styles.alarmTimeText,
                            !alarm.enabled && styles.alarmTimeTextDisabled,
                          ]}
                        >
                          {alarm.time}
                        </Text>
                        <View style={styles.daysBadgeRow}>
                          {WEEKDAYS.filter((w) => w.day >= 1 && w.day <= 5).map((w) => {
                            const isIncluded = alarm.days.includes(w.day);
                            return (
                              <Text
                                key={w.day}
                                style={[
                                  styles.dayBadgeText,
                                  isIncluded && styles.dayBadgeTextActive,
                                ]}
                              >
                                {w.label}
                              </Text>
                            );
                          })}
                        </View>
                      </View>

                      <View style={styles.alarmActionsRow}>
                        <Switch
                          value={alarm.enabled}
                          onValueChange={() => handleToggle(alarm)}
                          trackColor={{ false: Colors.border, true: 'rgba(6, 182, 212, 0.4)' }}
                          thumbColor={alarm.enabled ? Colors.cyan : Colors.textMuted}
                        />
                        {alarm.id.startsWith('alarm_') && !['alarm_pre_market', 'alarm_b3_open', 'alarm_ny_open', 'alarm_post_market'].includes(alarm.id) && (
                          <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => handleDelete(alarm.id)}
                          >
                            <Trash2 size={16} color={Colors.crimson} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.alarmTitle,
                        !alarm.enabled && styles.alarmTitleDisabled,
                      ]}
                    >
                      {alarm.title}
                    </Text>

                    {alarm.subtitle && (
                      <Text style={styles.alarmSubtitle}>{alarm.subtitle}</Text>
                    )}

                    {alarm.actionTarget !== 'none' && (
                      <TouchableOpacity
                        style={styles.actionLinkRow}
                        onPress={() => {
                          if (onNavigateToTarget) {
                            onClose();
                            onNavigateToTarget(alarm.actionTarget);
                          }
                        }}
                      >
                        <Text style={styles.actionLinkText}>
                          {alarm.actionTarget === 'protocol_pre' && '↳ Abre Checklist Pré-Mercado'}
                          {alarm.actionTarget === 'protocol_post' && '↳ Abre Diário Pós-Mercado'}
                          {alarm.actionTarget === 'audioteca' && '↳ Abre Audioteca de Foco'}
                          {alarm.actionTarget === 'sos_tilt' && '↳ Abre Modo SOS Anti-Tilt'}
                        </Text>
                        <ChevronRight size={12} color={Colors.cyan} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* 2. ABA NOTÍCIAS MACRO */}
            {activeTab === 'news' && (
              <View style={styles.tabContent}>
                <View style={styles.newsBanner}>
                  <AlertTriangle size={18} color={Colors.amber} />
                  <View style={styles.newsBannerTextContainer}>
                    <Text style={styles.newsBannerTitle}>PROTEÇÃO CONTRA VOLATILIDADE</Text>
                    <Text style={styles.newsBannerDesc}>
                      Alarmes duplos com aviso prévio (10 a 15 min antes) para zerar ordens ou proteger stops, e aviso imediato no minuto do anúncio.
                    </Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>PRESETS RÁPIDOS (1 TOQUE PARA PROGRAMAR HOJE)</Text>

                <View style={styles.presetsGrid}>
                  {DEFAULT_MACRO_NEWS_PRESETS.map((preset) => (
                    <TouchableOpacity
                      key={preset.id}
                      style={styles.presetCard}
                      onPress={() => handleAddNewsPreset(preset)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.presetTop}>
                        <View style={styles.currencyBadge}>
                          <Text style={styles.currencyText}>{preset.currency}</Text>
                        </View>
                        <Text style={styles.presetTime}>{preset.defaultTime}</Text>
                      </View>
                      <Text style={styles.presetName}>{preset.name}</Text>
                      <Text style={styles.presetDesc} numberOfLines={2}>
                        {preset.description}
                      </Text>
                      <View style={styles.presetActionBtn}>
                        <Plus size={12} color={Colors.cyan} />
                        <Text style={styles.presetActionText}>Ativar Alerta Hoje</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {newsAlarms.length > 0 && (
                  <View style={styles.activeNewsSection}>
                    <Text style={styles.sectionTitle}>ALERTAS DE NOTÍCIAS ATIVOS HOJE</Text>
                    {newsAlarms.map((na) => (
                      <View key={na.id} style={styles.activeNewsCard}>
                        <View style={styles.activeNewsLeft}>
                          <Zap size={16} color={Colors.crimson} />
                          <View>
                            <Text style={styles.activeNewsTitle}>{na.title}</Text>
                            <Text style={styles.activeNewsSubtitle}>
                              Disparo às {na.time} (Aviso prévio {na.leadTimeMinutes || 15}m antes)
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => handleDelete(na.id)}
                        >
                          <Trash2 size={16} color={Colors.crimson} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* 3. ABA TIMERS LIVE (MESA) */}
            {activeTab === 'timers' && (
              <View style={styles.tabContent}>
                {/* HUD Display de Timer Ativo */}
                {activeTimerSeconds !== null ? (
                  <View style={styles.activeTimerHud}>
                    <View style={styles.hudTop}>
                      <Radio size={16} color={Colors.emerald} />
                      <Text style={styles.hudTitle}>{timerTitle.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.hudCountdown}>
                      {formatTimerDisplay(activeTimerSeconds)}
                    </Text>
                    <Text style={styles.hudSub}>
                      Afaste as mãos das ordens. Respire e aguarde a mente recalibrar.
                    </Text>
                    <TouchableOpacity
                      style={styles.hudCancelBtn}
                      onPress={handleCancelDeskTimer}
                    >
                      <Square size={14} color={Colors.crimson} />
                      <Text style={styles.hudCancelText}>Cancelar Timer</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.timerIntroCard}>
                    <Clock size={20} color={Colors.cyan} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.timerIntroTitle}>MODO LIVE DESK & TIMERS DE RESFRIAMENTO</Text>
                      <Text style={styles.timerIntroDesc}>
                        Acione ao lado do monitor durante o pregão. Ao terminar a contagem, um alerta sonoro e vibratório avisará que sua mente está pronta.
                      </Text>
                    </View>
                  </View>
                )}

                <Text style={styles.sectionTitle}>TIMERS RÁPIDOS DE CONTROLE OPERACIONAL</Text>

                {/* Card Cool-down Pós-Stop */}
                <TouchableOpacity
                  style={styles.timerActionCard}
                  onPress={() => handleStartDeskTimer('Resfriamento Pós-Loss', 15)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.timerIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                    <Flame size={20} color={Colors.crimson} />
                  </View>
                  <View style={styles.timerActionInfo}>
                    <Text style={styles.timerActionTitle}>🛑 15 Minutos Pós-Stop (Anti-Vingança)</Text>
                    <Text style={styles.timerActionDesc}>
                      Bloqueio de 15 min após levar um loss para evitar revenge trading imediato.
                    </Text>
                  </View>
                  <Play size={18} color={Colors.crimson} />
                </TouchableOpacity>

                {/* Card Pausa de Tela */}
                <TouchableOpacity
                  style={styles.timerActionCard}
                  onPress={() => handleStartDeskTimer('Pausa Anti-Fadiga', 60)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.timerIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Clock size={20} color={Colors.emerald} />
                  </View>
                  <View style={styles.timerActionInfo}>
                    <Text style={styles.timerActionTitle}>🧘 60 Minutos de Foco (Pausa de Tela)</Text>
                    <Text style={styles.timerActionDesc}>
                      Lembrete para levantar, beber água e relaxar a musculatura ocular.
                    </Text>
                  </View>
                  <Play size={18} color={Colors.emerald} />
                </TouchableOpacity>

                {/* Card Pausa Curta 5 min */}
                <TouchableOpacity
                  style={styles.timerActionCard}
                  onPress={() => handleStartDeskTimer('Respiração 5 Min', 5)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.timerIconBox, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                    <Sparkles size={20} color={Colors.cyan} />
                  </View>
                  <View style={styles.timerActionInfo}>
                    <Text style={styles.timerActionTitle}>⚡ 5 Minutos de Respiração 4-7-8</Text>
                    <Text style={styles.timerActionDesc}>
                      Desacelere a frequência cardíaca antes de tomar uma nova decisão.
                    </Text>
                  </View>
                  <Play size={18} color={Colors.cyan} />
                </TouchableOpacity>
              </View>
            )}

            {/* Footer Utilitários */}
            <View style={styles.footerRow}>
              <TouchableOpacity
                style={styles.footerBtn}
                onPress={handleTestNotification}
                activeOpacity={0.7}
              >
                <Volume2 size={14} color={Colors.cyan} />
                <Text style={styles.footerBtnText}>Testar Notificação (3s)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.footerBtn}
                onPress={handleResetDefaults}
                activeOpacity={0.7}
              >
                <RefreshCw size={14} color={Colors.textMuted} />
                <Text style={[styles.footerBtnText, { color: Colors.textMuted }]}>
                  Restaurar Padrões
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: '90%',
    minHeight: '80%',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bellIconBox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: Typography.fontWeight.medium,
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.xs,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  tabText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.cyan,
  },
  body: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  tabContent: {
    gap: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  addSmallBtnText: {
    color: Colors.cyan,
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cyan,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  formTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.cyan,
    marginBottom: Spacing.xs,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
  },
  inputTime: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.cyan,
    textAlign: 'center',
    width: 100,
  },
  targetOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  targetPill: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  targetPillActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: Colors.cyan,
  },
  targetPillText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: Typography.fontWeight.medium,
  },
  targetPillTextActive: {
    color: Colors.cyan,
    fontWeight: Typography.fontWeight.bold,
  },
  formButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelBtnText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
  },
  saveAlarmBtn: {
    backgroundColor: Colors.cyan,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  saveAlarmBtnText: {
    color: '#000',
    fontWeight: Typography.fontWeight.bold,
    fontSize: Typography.fontSize.xs,
  },
  alarmCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.sm,
  },
  alarmCardDisabled: {
    opacity: 0.6,
  },
  alarmTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alarmTimeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  alarmTimeText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.cyan,
    letterSpacing: 0.5,
  },
  alarmTimeTextDisabled: {
    color: Colors.textMuted,
  },
  daysBadgeRow: {
    flexDirection: 'row',
    gap: 3,
  },
  dayBadgeText: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: Typography.fontWeight.medium,
  },
  dayBadgeTextActive: {
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.bold,
  },
  alarmActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  deleteBtn: {
    padding: 6,
  },
  alarmTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  alarmTitleDisabled: {
    color: Colors.textMuted,
  },
  alarmSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  actionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionLinkText: {
    fontSize: 10,
    color: Colors.cyan,
    fontWeight: Typography.fontWeight.semiBold,
  },
  newsBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  newsBannerTextContainer: {
    flex: 1,
  },
  newsBannerTitle: {
    color: Colors.amber,
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  newsBannerDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 16,
  },
  presetsGrid: {
    gap: Spacing.sm,
  },
  presetCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  presetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  currencyBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  currencyText: {
    color: Colors.cyan,
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
  },
  presetTime: {
    color: Colors.amber,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  presetName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  presetDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  presetActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  presetActionText: {
    color: Colors.cyan,
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
  },
  activeNewsSection: {
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  activeNewsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  activeNewsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  activeNewsTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.crimson,
  },
  activeNewsSubtitle: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  activeTimerHud: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.emerald,
    alignItems: 'center',
  },
  hudTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  hudTitle: {
    color: Colors.emerald,
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.8,
  },
  hudCountdown: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    marginVertical: Spacing.xs,
  },
  hudSub: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  hudCancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  hudCancelText: {
    color: Colors.crimson,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  timerIntroCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  timerIntroTitle: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.cyan,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  timerIntroDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  timerActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.md,
  },
  timerIconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerActionInfo: {
    flex: 1,
  },
  timerActionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  timerActionDesc: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Spacing.xl,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  footerBtnText: {
    color: Colors.cyan,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
  },
});
