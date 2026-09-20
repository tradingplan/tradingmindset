import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import {
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw,
  User,
  Lock,
  Mail,
  LogOut,
  X,
  CheckCircle,
  AlertCircle,
  Shield,
  Smartphone,
  Laptop,
} from 'lucide-react-native';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { syncAllProtocols, getSyncStatus, subscribeSyncStatus, SyncStatus } from '../../services/syncService';

interface AuthSyncModalProps {
  visible: boolean;
  onClose: () => void;
  onSyncComplete?: () => void;
}

export const AuthSyncModal: React.FC<AuthSyncModalProps> = ({
  visible,
  onClose,
  onSyncComplete,
}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSync, setLastSync] = useState<Date | undefined>();

  useEffect(() => {
    checkUser();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
      if (session?.user) {
        handleManualSync();
      }
    });

    // Subscribe to sync status
    const unsubscribeSync = subscribeSyncStatus((status, lastSyncedAt) => {
      setSyncStatus(status);
      setLastSync(lastSyncedAt);
    });

    return () => {
      authListener.subscription.unsubscribe();
      unsubscribeSync();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setCurrentUser(data?.session?.user || null);
    } catch {
      setCurrentUser(null);
    }
  };

  const handleAuth = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor, preencha o e-mail e a senha.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { error, data } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrorMessage('E-mail ou senha incorretos.');
          } else {
            setErrorMessage(error.message);
          }
        } else {
          setCurrentUser(data.user);
          setSuccessMessage('Login realizado com sucesso!');
          await handleManualSync();
        }
      } else {
        const { error, data } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorMessage(error.message);
        } else if (data.session) {
          setCurrentUser(data.user);
          setSuccessMessage('Conta criada e conectada com sucesso!');
          await handleManualSync();
        } else {
          setSuccessMessage('Conta criada! Verifique seu e-mail para confirmar seu cadastro se necessário, ou tente fazer o login.');
          setMode('login');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro inesperado na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Desconectar',
      'Deseja realmente sair? Seus dados locais serão mantidos, mas a sincronização em nuvem ficará pausada até você logar novamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            setCurrentUser(null);
            setSuccessMessage(null);
            setErrorMessage(null);
          },
        },
      ]
    );
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setErrorMessage(null);
    try {
      const result = await syncAllProtocols();
      if (result.success) {
        setSuccessMessage(`Sincronização concluída! (${result.updatedCount} registros atualizados)`);
        onSyncComplete?.();
      } else {
        setErrorMessage('Não foi possível sincronizar no momento. Verifique sua conexão.');
      }
    } catch {
      setErrorMessage('Erro ao executar sincronização.');
    } finally {
      setSyncing(false);
    }
  };

  const renderConfigWarning = () => {
    if (isSupabaseConfigured()) return null;
    return (
      <View style={styles.warningBox}>
        <AlertCircle size={18} color={Colors.amber} />
        <Text style={styles.warningText}>
          Supabase não configurado. Verifique as variáveis de ambiente (.env).
        </Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Cloud size={20} color={Colors.cyan} />
              </View>
              <View>
                <Text style={styles.title}>Sincronização em Nuvem</Text>
                <Text style={styles.subtitle}>Web & Mobile Companion</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {renderConfigWarning()}

            {/* Explain Sync Mechanism */}
            <View style={styles.featureCard}>
              <View style={styles.deviceRow}>
                <View style={styles.deviceItem}>
                  <Laptop size={22} color={Colors.cyan} />
                  <Text style={styles.deviceText}>Web Browser</Text>
                </View>
                <RefreshCw size={16} color={Colors.emerald} />
                <View style={styles.deviceItem}>
                  <Smartphone size={22} color={Colors.cyan} />
                  <Text style={styles.deviceText}>App Celular</Text>
                </View>
              </View>
              <Text style={styles.featureDesc}>
                Escreva seu diário no computador com conforto e acompanhe o protocolo e disciplina no celular onde estiver.
              </Text>
            </View>

            {/* Messages */}
            {errorMessage && (
              <View style={styles.errorBox}>
                <AlertCircle size={16} color={Colors.crimson} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {successMessage && (
              <View style={styles.successBox}>
                <CheckCircle size={16} color={Colors.emerald} />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}

            {/* If Logged In */}
            {currentUser ? (
              <View style={styles.profileSection}>
                <View style={styles.userCard}>
                  <View style={styles.avatarCircle}>
                    <User size={20} color={Colors.cyan} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userEmailLabel}>CONECTADO COMO</Text>
                    <Text style={styles.userEmail} numberOfLines={1}>
                      {currentUser.email}
                    </Text>
                  </View>
                  <View style={styles.onlineBadge}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>Ativo</Text>
                  </View>
                </View>

                {/* Sync status info */}
                <View style={styles.statusRow}>
                  <View style={styles.statusLeft}>
                    {syncing || syncStatus === 'syncing' ? (
                      <ActivityIndicator size="small" color={Colors.cyan} />
                    ) : syncStatus === 'synced' ? (
                      <CloudCheck size={18} color={Colors.emerald} />
                    ) : (
                      <Cloud size={18} color={Colors.cyan} />
                    )}
                    <Text style={styles.statusText}>
                      {syncing || syncStatus === 'syncing'
                        ? 'Sincronizando dados...'
                        : syncStatus === 'synced'
                        ? 'Tudo atualizado na nuvem'
                        : 'Pronto para sincronizar'}
                    </Text>
                  </View>
                  {lastSync && (
                    <Text style={styles.lastSyncText}>
                      {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  )}
                </View>

                {/* Actions */}
                <TouchableOpacity
                  style={[styles.primaryBtn, syncing && { opacity: 0.7 }]}
                  onPress={handleManualSync}
                  disabled={syncing}
                  activeOpacity={0.8}
                >
                  {syncing ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <>
                      <RefreshCw size={18} color="#000" />
                      <Text style={styles.primaryBtnText}>Sincronizar Agora</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.logoutBtn}
                  onPress={handleLogout}
                  activeOpacity={0.7}
                >
                  <LogOut size={16} color={Colors.crimson} />
                  <Text style={styles.logoutBtnText}>Desconectar desta Conta</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* If NOT Logged In: Login & Sign Up Forms */
              <View style={styles.authSection}>
                <View style={styles.tabsRow}>
                  <TouchableOpacity
                    style={[styles.tabBtn, mode === 'login' && styles.tabBtnActive]}
                    onPress={() => {
                      setMode('login');
                      setErrorMessage(null);
                    }}
                  >
                    <Text style={[styles.tabBtnText, mode === 'login' && styles.tabBtnTextActive]}>
                      Entrar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tabBtn, mode === 'signup' && styles.tabBtnActive]}
                    onPress={() => {
                      setMode('signup');
                      setErrorMessage(null);
                    }}
                  >
                    <Text style={[styles.tabBtnText, mode === 'signup' && styles.tabBtnTextActive]}>
                      Criar Conta
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Inputs */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>E-MAIL</Text>
                  <View style={styles.inputContainer}>
                    <Mail size={16} color={Colors.textMuted} />
                    <TextInput
                      style={styles.input}
                      placeholder="seu@email.com"
                      placeholderTextColor={Colors.textMuted}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>SENHA</Text>
                  <View style={styles.inputContainer}>
                    <Lock size={16} color={Colors.textMuted} />
                    <TextInput
                      style={styles.input}
                      placeholder="Mínimo 6 caracteres"
                      placeholderTextColor={Colors.textMuted}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                  onPress={handleAuth}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <>
                      <Shield size={18} color="#000" />
                      <Text style={styles.primaryBtnText}>
                        {mode === 'login' ? 'Conectar e Sincronizar' : 'Criar Conta de Sincronização'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <Text style={styles.secureNotice}>
                  🔒 Seus protocolos e anotações são criptografados e protegidos por Row Level Security (RLS).
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 10, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  subtitle: {
    color: Colors.cyan,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  warningText: {
    color: Colors.amber,
    fontSize: Typography.fontSize.xs,
    flex: 1,
  },
  featureCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  deviceItem: {
    alignItems: 'center',
    gap: 4,
  },
  deviceText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
  },
  featureDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  errorText: {
    color: Colors.crimson,
    fontSize: Typography.fontSize.xs,
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  successText: {
    color: Colors.emerald,
    fontSize: Typography.fontSize.xs,
    flex: 1,
  },
  profileSection: {
    gap: Spacing.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.md,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  userEmailLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  userEmail: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.emerald,
  },
  onlineText: {
    color: Colors.emerald,
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
  },
  lastSyncText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
  },
  primaryBtn: {
    backgroundColor: Colors.cyan,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#000',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  logoutBtnText: {
    color: Colors.crimson,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
  },
  authSection: {
    gap: Spacing.md,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.md,
    padding: 3,
    marginBottom: Spacing.xs,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  tabBtnActive: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tabBtnText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
  },
  tabBtnTextActive: {
    color: Colors.cyan,
    fontWeight: Typography.fontWeight.bold,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
  },
  secureNotice: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    marginTop: Spacing.xs,
  },
});
