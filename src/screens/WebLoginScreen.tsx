import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { supabase } from '../services/supabase';
import { Lock, Mail, Shield, ArrowRight, CheckCircle, AlertCircle, Terminal, Sparkles, Eye, EyeOff } from 'lucide-react-native';

interface WebLoginScreenProps {
  onLoginSuccess?: () => void;
}

export const WebLoginScreen: React.FC<WebLoginScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor, informe seu e-mail e sua senha.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
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
        } else if (data?.user) {
          setSuccessMessage('Acesso autorizado! Carregando painel...');
          onLoginSuccess?.();
        }
      } else {
        const { error, data } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorMessage(error.message);
        } else if (data?.session) {
          setSuccessMessage('Conta criada com sucesso! Entrando...');
          onLoginSuccess?.();
        } else {
          setSuccessMessage('Conta registrada! Por favor, faça login com suas credenciais.');
          setMode('login');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocorreu um erro ao processar a autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.pageContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Glow background effects */}
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.card}>
          {/* Header & Logo */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.badgeRow}>
              <Terminal size={12} color={Colors.cyan} />
              <Text style={styles.badgeText}>SISTEMA DE AUDITORIA OPERACIONAL</Text>
            </View>
            <Text style={styles.title}>TRADING MINDSET</Text>
            <Text style={styles.subtitle}>
              Terminal Web de Disciplina e Diário de Alta Performance
            </Text>
          </View>

          {/* Mode Switcher */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tabButton, mode === 'login' && styles.tabButtonActive]}
              onPress={() => {
                setMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.tabButtonText, mode === 'login' && styles.tabButtonTextActive]}
              >
                Entrar no Terminal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, mode === 'signup' && styles.tabButtonActive]}
              onPress={() => {
                setMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.tabButtonText, mode === 'signup' && styles.tabButtonTextActive]}
              >
                Criar Nova Conta
              </Text>
            </TouchableOpacity>
          </View>

          {/* Feedback Messages */}
          {errorMessage && (
            <View style={styles.alertError}>
              <AlertCircle size={16} color={Colors.crimson} />
              <Text style={styles.alertErrorText}>{errorMessage}</Text>
            </View>
          )}

          {successMessage && (
            <View style={styles.alertSuccess}>
              <CheckCircle size={16} color={Colors.emerald} />
              <Text style={styles.alertSuccessText}>{successMessage}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-MAIL DO TRADER</Text>
              <View style={styles.inputBox}>
                <Mail size={16} color={Colors.textMuted} />
                <TextInput
                  style={styles.inputField}
                  placeholder="seu@email.com"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CHAVE DE ACESSO (SENHA)</Text>
              <View style={styles.inputBox}>
                <Lock size={16} color={Colors.textMuted} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onSubmitEditing={handleSubmit}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                  accessibilityLabel={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={Colors.cyan} />
                  ) : (
                    <Eye size={18} color={Colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Shield size={18} color="#000" />
                  <Text style={styles.submitButtonText}>
                    {mode === 'login' ? 'Desbloquear Acesso' : 'Registrar e Conectar'}
                  </Text>
                  <ArrowRight size={16} color="#000" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Security Notice */}
          <View style={styles.footer}>
            <View style={styles.securityTag}>
              <Sparkles size={13} color={Colors.cyan} />
              <Text style={styles.securityText}>
                Terminal Protegido por Row Level Security (RLS) & Criptografia AES
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#07090E',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    position: 'relative',
    minHeight: '100%',
  },
  glowTop: {
    position: 'absolute',
    top: -100,
    left: '50%',
    transform: [{ translateX: -150 }],
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    filter: 'blur(80px)' as any,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -100,
    left: '50%',
    transform: [{ translateX: -150 }],
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
    filter: 'blur(80px)' as any,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#0D111A',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(6, 182, 212, 0.4)',
    marginBottom: Spacing.md,
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  badgeText: {
    color: Colors.cyan,
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.8,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
    marginTop: 2,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.md,
    padding: 3,
    marginBottom: Spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  tabButtonActive: {
    backgroundColor: '#141A26',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  tabButtonText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
  },
  tabButtonTextActive: {
    color: Colors.cyan,
    fontWeight: Typography.fontWeight.bold,
  },
  alertError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  alertErrorText: {
    color: Colors.crimson,
    fontSize: Typography.fontSize.xs,
    flex: 1,
  },
  alertSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  alertSuccessText: {
    color: Colors.emerald,
    fontSize: Typography.fontSize.xs,
    flex: 1,
  },
  form: {
    gap: Spacing.md,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#080B10',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  inputField: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    paddingVertical: Spacing.md,
    outlineStyle: 'none' as any,
  },
  eyeBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: Colors.cyan,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#000',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  securityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.75,
  },
  securityText: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
});
