import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { useUserTier } from '../../context/TierContext';
import {
  Crown,
  CheckCircle2,
  X,
  Lock,
  Headphones,
  Download,
  Cloud,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  HelpCircle,
} from 'lucide-react-native';

const PRO_BENEFITS = [
  {
    icon: Headphones,
    title: 'Catálogo Completo (+20 Áudios)',
    desc: 'Auto-hipnose, frequências binaurais, blindagem pré-market e áudios de descompressão pós-loss.',
  },
  {
    icon: Download,
    title: 'Modo Offline e Avião',
    desc: 'Baixe todas as faixas diretamente no seu celular para escutar em qualquer lugar.',
  },
  {
    icon: Cloud,
    title: 'Backup & Sincronização em Nuvem',
    desc: 'Seus checklists e notas sincronizados em tempo real entre o computador (Web) e o celular.',
  },
  {
    icon: Sparkles,
    title: 'Tarot Trader & Histórico 90 Dias',
    desc: 'Acesso à matriz completa de 22 arquétipos comportamentais e tendências de viés cognitivo.',
  },
  {
    icon: ShieldCheck,
    title: 'Auditoria de Disciplina & Sniper',
    desc: 'Relatórios de consistência, cálculo automático de score e trava de final de pregão.',
  },
];

export const PaywallModal: React.FC = () => {
  const { paywallVisible, paywallFeature, closePaywall, openAuthModal } = useUserTier();
  const [showHowToSubscribe, setShowHowToSubscribe] = useState(false);

  const handleLoginPress = () => {
    closePaywall();
    openAuthModal();
  };

  const handleOpenMemberPortal = () => {
    // URL do portal externo de membros/checkout
    const url = 'https://tradingplan.com.br/mindset';
    Linking.openURL(url).catch(() => {});
  };

  return (
    <Modal
      visible={paywallVisible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={closePaywall}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closePaywall}
        />

        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.proBadgeContainer}>
              <Crown size={14} color="#F59E0B" />
              <Text style={styles.proBadgeText}>TRADER PRO</Text>
            </View>
            <TouchableOpacity onPress={closePaywall} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Title & Callout */}
            <View style={styles.titleSection}>
              <Text style={styles.mainTitle}>Desbloqueie o Acesso Completo</Text>
              <Text style={styles.featureCallout}>
                {paywallFeature ? `Recurso Exclusivo: ${paywallFeature}` : 'Eleve seu controle emocional e opere como os 5% mais disciplinados.'}
              </Text>
            </View>

            {/* Benefits List */}
            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsCardHeader}>VANTAGENS DO PLANO PRO</Text>
              {PRO_BENEFITS.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <View key={index} style={styles.benefitRow}>
                    <View style={styles.benefitIconWrapper}>
                      <IconComponent size={16} color={Colors.cyan} />
                    </View>
                    <View style={styles.benefitTextContainer}>
                      <Text style={styles.benefitTitle}>{item.title}</Text>
                      <Text style={styles.benefitDesc}>{item.desc}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.primaryLoginBtn}
                onPress={handleLoginPress}
                activeOpacity={0.8}
              >
                <Crown size={18} color="#0B0E14" />
                <Text style={styles.primaryLoginBtnText}>JÁ SOU ASSINANTE — FAZER LOGIN</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondarySubscribeBtn}
                onPress={() => setShowHowToSubscribe(!showHowToSubscribe)}
                activeOpacity={0.8}
              >
                <HelpCircle size={16} color={Colors.textSecondary} />
                <Text style={styles.secondarySubscribeBtnText}>Como se tornar um Trader PRO?</Text>
              </TouchableOpacity>

              {showHowToSubscribe && (
                <View style={styles.howToCard}>
                  <Text style={styles.howToTitle}>Portal de Membros Trading Mindset</Text>
                  <Text style={styles.howToText}>
                    As assinaturas são gerenciadas no nosso portal de membros. Após assinar na web (Hotmart / Kiwify / Plataforma), basta fazer login no app com o mesmo e-mail cadastrado para desbloquear o acesso PRO em todos os seus aparelhos.
                  </Text>
                  <TouchableOpacity
                    style={styles.portalLinkBtn}
                    onPress={handleOpenMemberPortal}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.portalLinkText}>Acessar Portal de Membros</Text>
                    <ExternalLink size={14} color={Colors.cyan} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Footer Compliance Note */}
            <Text style={styles.complianceNote}>
              Acesso multiplataforma via credenciais de membro do ecossistema Trading Mindset.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 10, 0.88)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '92%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.3)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  proBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.xs,
  },
  proBadgeText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  scrollBody: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl + 20,
  },
  titleSection: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  mainTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: 4,
  },
  featureCallout: {
    color: Colors.cyan,
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
  },
  benefitsCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    gap: 12,
  },
  benefitsCardHeader: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  benefitIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  benefitDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 17,
  },
  actionsContainer: {
    marginTop: Spacing.md,
    gap: 10,
  },
  primaryLoginBtn: {
    backgroundColor: Colors.cyan,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryLoginBtnText: {
    color: '#0B0E14',
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondarySubscribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  secondarySubscribeBtnText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
  },
  howToCard: {
    backgroundColor: 'rgba(6, 182, 212, 0.06)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    padding: Spacing.md,
    gap: 8,
  },
  howToTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
  howToText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
  },
  portalLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  portalLinkText: {
    color: Colors.cyan,
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
  },
  complianceNote: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 15,
  },
});
