import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, Switch, Linking, AppState, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scraperBridge } from '../services/scraperBridge';

const C = {
  bg: '#0A0F1E', surface: '#111827', border: '#1F2937',
  accent: '#00FF94', text: '#E8E8F0', muted: '#4A4A6A',
  amazon: '#FF9900', error: '#FF4060', success: '#00FF94',
  warning: '#FFB800',
};

export default function App() {
  const [apiUrl, setApiUrl] = useState('https://notiflex-production.up.railway.app');
  const [apiKey, setApiKey] = useState('');
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'setup' | 'ready'>('setup');

  useEffect(() => {
    loadConfig();
    checkAccessibility();

    // Check accessibility every time app comes to foreground
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') checkAccessibility();
    });
    return () => sub.remove();
  }, []);

  const loadConfig = async () => {
    const config = await scraperBridge.getConfig();
    if (config.apiUrl) setApiUrl(config.apiUrl);
    if (config.apiKey) setApiKey(config.apiKey);
    if (config.apiUrl && config.apiKey) setStep('ready');
  };

  const checkAccessibility = async () => {
    const enabled = await scraperBridge.isAccessibilityEnabled();
    setAccessibilityEnabled(enabled);
  };

  const handleSave = async () => {
    if (!apiUrl.trim() || !apiKey.trim()) {
      Alert.alert('Required', 'Fill in both fields');
      return;
    }
    setSaving(true);
    const ok = await scraperBridge.saveConfig(apiUrl.trim(), apiKey.trim());
    setSaving(false);
    if (ok) {
      setStep('ready');
      Alert.alert('✓ Saved', 'Configuration saved successfully');
    }
  };

  const openAccessibility = async () => {
    await scraperBridge.openAccessibilitySettings();
  };

  // ── SETUP SCREEN ──────────────────────────────────────────
  if (step === 'setup') {
    return (
      <SafeAreaView style={s.container}>
        <ScrollView contentContainerStyle={s.inner} showsVerticalScrollIndicator={false}>
          <View style={s.logoArea}>
            <View style={s.logoBox}><Text style={s.logoIcon}>⚡</Text></View>
            <Text style={s.logoText}>FlexNotify</Text>
            <Text style={s.logoSub}>SCRAPER ENGINE v2</Text>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>API Configuration</Text>
            <Text style={s.label}>RAILWAY API URL</Text>
            <TextInput style={s.input} value={apiUrl} onChangeText={setApiUrl}
              placeholder="https://your-api.up.railway.app"
              placeholderTextColor={C.muted} autoCapitalize="none" />
            <Text style={s.label}>SCRAPER API KEY</Text>
            <TextInput style={s.input} value={apiKey} onChangeText={setApiKey}
              placeholder="your-secret-key" placeholderTextColor={C.muted}
              autoCapitalize="none" secureTextEntry />
            <TouchableOpacity style={[s.btn, saving && s.btnOff]} onPress={handleSave} disabled={saving}>
              <Text style={s.btnText}>{saving ? 'Saving...' : 'Save & Continue →'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── MAIN SCREEN ───────────────────────────────────────────
  return (
    <SafeAreaView style={s.container}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.logoRow}>
            <View style={s.logoBoxSm}><Text style={{ fontSize: 18 }}>⚡</Text></View>
            <View>
              <Text style={s.headerTitle}>FlexNotify Scraper</Text>
              <Text style={s.headerSub}>Accessibility Engine v2</Text>
            </View>
          </View>
        </View>

        {/* Status card */}
        <View style={[s.statusCard, accessibilityEnabled && s.statusCardActive]}>
          <View style={s.statusRow}>
            <View style={[s.dot, { backgroundColor: accessibilityEnabled ? C.success : C.error }]} />
            <View>
              <Text style={[s.statusText, { color: accessibilityEnabled ? C.success : C.error }]}>
                {accessibilityEnabled ? 'SCRAPER ACTIVE' : 'SCRAPER INACTIVE'}
              </Text>
              <Text style={s.statusSub}>
                {accessibilityEnabled
                  ? 'Watching Amazon Flex for blocks...'
                  : 'Enable accessibility service to start'}
              </Text>
            </View>
          </View>
        </View>

        {/* Accessibility toggle */}
        {!accessibilityEnabled ? (
          <View style={s.warningCard}>
            <Text style={s.warningIcon}>⚠</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.warningTitle}>Accessibility Service Required</Text>
              <Text style={s.warningSub}>
                Enable FlexNotify in Accessibility Settings to start capturing Amazon Flex blocks automatically.
              </Text>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={[s.accessBtn, accessibilityEnabled && s.accessBtnActive]}
          onPress={openAccessibility}
        >
          <Text style={s.accessBtnText}>
            {accessibilityEnabled
              ? '✓ Accessibility Enabled — Tap to manage'
              : '→ Enable Accessibility Service'}
          </Text>
        </TouchableOpacity>

        {/* How it works */}
        <View style={s.howCard}>
          <Text style={s.howTitle}>HOW IT WORKS</Text>
          {[
            { icon: '📱', title: 'Open Amazon Flex', desc: 'Navigate to the Available Blocks screen' },
            { icon: '👁', title: 'Auto Detection', desc: 'FlexNotify reads block data from the screen automatically' },
            { icon: '⚡', title: 'Instant Sync', desc: 'Blocks are sent to your API and shown to all users immediately' },
            { icon: '🔁', title: 'Continuous', desc: 'Works every time you scroll or refresh the blocks list' },
          ].map(({ icon, title, desc }) => (
            <View key={title} style={s.howRow}>
              <Text style={s.howIcon}>{icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.howTitle2}>{title}</Text>
                <Text style={s.howDesc}>{desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Steps */}
        <View style={s.stepsCard}>
          <Text style={s.stepsTitle}>QUICK START</Text>
          {[
            '1. Tap "Enable Accessibility Service" above',
            '2. Find "FlexNotify Scraper" in the list',
            '3. Toggle it ON and confirm',
            '4. Open Amazon Flex app',
            '5. Go to Available Blocks',
            '6. Blocks appear in FlexNotify automatically!',
          ].map((step, i) => (
            <Text key={i} style={[s.stepText, i === 5 && { color: C.success, fontWeight: '700' }]}>{step}</Text>
          ))}
        </View>

        {/* Config */}
        <View style={s.configCard}>
          <Text style={s.configLabel}>API URL</Text>
          <Text style={s.configValue} numberOfLines={1}>{apiUrl}</Text>
          <TouchableOpacity onPress={() => setStep('setup')} style={s.editConfigBtn}>
            <Text style={s.editConfigText}>Edit Configuration</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  inner: { padding: 24, paddingBottom: 40 },
  scroll: { flex: 1, padding: 20 },
  logoArea: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
  logoBox: { width: 72, height: 72, borderRadius: 20, backgroundColor: C.accent + '20', borderWidth: 1, borderColor: C.accent + '40', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoBoxSm: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.accent + '20', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  logoIcon: { fontSize: 32, color: C.accent },
  logoText: { fontSize: 24, fontWeight: '900', color: C.text, letterSpacing: 4 },
  logoSub: { fontSize: 10, color: C.muted, letterSpacing: 4, marginTop: 4 },
  card: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 16 },
  label: { fontSize: 10, color: C.muted, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 14, color: C.text, fontSize: 13, marginBottom: 16, fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier' },
  btn: { backgroundColor: C.accent, borderRadius: 12, padding: 16, alignItems: 'center' },
  btnOff: { opacity: 0.5 },
  btnText: { color: C.bg, fontSize: 14, fontWeight: '900' },
  header: { marginBottom: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: C.text },
  headerSub: { fontSize: 11, color: C.muted, marginTop: 2 },
  statusCard: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12 },
  statusCardActive: { borderColor: C.success + '40', backgroundColor: C.success + '08' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  statusText: { fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  statusSub: { fontSize: 11, color: C.muted, marginTop: 2 },
  warningCard: { backgroundColor: C.warning + '10', borderWidth: 1, borderColor: C.warning + '30', borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, marginBottom: 12 },
  warningIcon: { color: C.warning, fontSize: 18 },
  warningTitle: { fontSize: 13, color: C.warning, fontWeight: '700' },
  warningSub: { fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 16 },
  accessBtn: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.accent + '40', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 20 },
  accessBtnActive: { backgroundColor: C.success + '10', borderColor: C.success + '40' },
  accessBtnText: { color: C.accent, fontSize: 13, fontWeight: '700' },
  howCard: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12 },
  howTitle: { fontSize: 10, color: C.muted, fontWeight: '700', letterSpacing: 2, marginBottom: 14 },
  howRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  howIcon: { fontSize: 20, width: 26 },
  howTitle2: { fontSize: 13, color: C.text, fontWeight: '700', marginBottom: 2 },
  howDesc: { fontSize: 11, color: C.muted, lineHeight: 16 },
  stepsCard: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12 },
  stepsTitle: { fontSize: 10, color: C.muted, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
  stepText: { fontSize: 13, color: C.text, lineHeight: 22 },
  configCard: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16 },
  configLabel: { fontSize: 10, color: C.muted, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  configValue: { fontSize: 12, color: C.text, fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier', marginBottom: 12 },
  editConfigBtn: { borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 10, alignItems: 'center' },
  editConfigText: { color: C.muted, fontSize: 12, fontWeight: '600' },
});
