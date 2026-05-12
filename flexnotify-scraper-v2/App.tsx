import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, Linking, AppState, Platform,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';

const C = {
  bg: '#0A0F1E', surface: '#111827', border: '#1F2937',
  accent: '#00FF94', text: '#E8E8F0', muted: '#4A4A6A',
  error: '#FF4060', success: '#00FF94', warning: '#FFB800',
};

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://notiflex-production.up.railway.app';

export default function App() {
  const [apiUrl, setApiUrl] = useState(API_URL);
  const [apiKey, setApiKey] = useState('');
  const [step, setStep] = useState<'setup' | 'ready'>('setup');
  const [saving, setSaving] = useState(false);
  const [accessibilityOk, setAccessibilityOk] = useState(false);

  useEffect(() => {
    loadConfig();
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') checkAccessibility();
    });
    return () => sub.remove();
  }, []);

  const loadConfig = async () => {
    try {
      const url = await SecureStore.getItemAsync('api_url');
      const key = await SecureStore.getItemAsync('api_key');
      if (url) setApiUrl(url);
      if (key) setApiKey(key);
      if (url && key) { setStep('ready'); checkAccessibility(); }
    } catch {}
  };

  const checkAccessibility = async () => {
    // On Expo we can't directly check accessibility service
    // User confirms manually
  };

  const handleSave = async () => {
    if (!apiUrl.trim() || !apiKey.trim()) {
      Alert.alert('Required', 'Fill in both fields'); return;
    }
    setSaving(true);
    try {
      await SecureStore.setItemAsync('api_url', apiUrl.trim());
      await SecureStore.setItemAsync('api_key', apiKey.trim());
      setStep('ready');
      Alert.alert('✓ Saved', 'Configuration saved');
    } catch (e) {
      Alert.alert('Error', 'Failed to save');
    }
    setSaving(false);
  };

  const openAccessibility = () => {
    Linking.openSettings();
  };

  if (step === 'setup') {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={s.container}>
          <StatusBar style="light" />
          <ScrollView contentContainerStyle={s.inner} showsVerticalScrollIndicator={false}>
            <View style={s.logoArea}>
              <View style={s.logoBox}><Text style={{ fontSize: 36 }}>⚡</Text></View>
              <Text style={s.logoText}>FlexNotify</Text>
              <Text style={s.logoSub}>SCRAPER v2 — ACCESSIBILITY ENGINE</Text>
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
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.container}>
        <StatusBar style="light" />
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={s.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={s.logoBoxSm}><Text style={{ fontSize: 20 }}>⚡</Text></View>
              <View>
                <Text style={s.headerTitle}>FlexNotify Scraper v2</Text>
                <Text style={s.headerSub}>Accessibility Engine</Text>
              </View>
            </View>
          </View>

          {/* Accessibility toggle */}
          <TouchableOpacity style={s.accessCard} onPress={openAccessibility}>
            <View style={s.accessLeft}>
              <Text style={{ fontSize: 28 }}>♿</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.accessTitle}>Enable Accessibility Service</Text>
                <Text style={s.accessSub}>Tap to open Accessibility Settings → Find "FlexNotify Scraper" → Enable</Text>
              </View>
            </View>
            <Text style={{ color: C.accent, fontSize: 20 }}>→</Text>
          </TouchableOpacity>

          {/* How it works */}
          <View style={s.howCard}>
            <Text style={s.sectionLabel}>HOW IT WORKS</Text>
            {[
              { icon: '1️⃣', text: 'Tap button above → Open Accessibility Settings' },
              { icon: '2️⃣', text: 'Find "FlexNotify Scraper" → Enable it' },
              { icon: '3️⃣', text: 'Open Amazon Flex → Go to Available Blocks' },
              { icon: '4️⃣', text: 'FlexNotify reads blocks from screen automatically' },
              { icon: '5️⃣', text: 'Blocks sent to API → visible to all users instantly ⚡' },
            ].map(({ icon, text }) => (
              <View key={text} style={s.howRow}>
                <Text style={{ fontSize: 20, width: 32 }}>{icon}</Text>
                <Text style={s.howText}>{text}</Text>
              </View>
            ))}
          </View>

          {/* Important note */}
          <View style={s.noteCard}>
            <Text style={{ fontSize: 20 }}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.noteTitle}>Keep Amazon Flex Open</Text>
              <Text style={s.noteSub}>
                The scraper reads blocks while Amazon Flex is visible on screen.
                Navigate to "Available Blocks" and scroll to capture all available blocks.
              </Text>
            </View>
          </View>

          {/* Config summary */}
          <View style={s.configCard}>
            <Text style={s.sectionLabel}>CONFIGURATION</Text>
            <Text style={s.configLabel}>API URL</Text>
            <Text style={s.configValue} numberOfLines={1}>{apiUrl}</Text>
            <Text style={[s.configLabel, { marginTop: 8 }]}>API KEY</Text>
            <Text style={s.configValue}>{'•'.repeat(12)}</Text>
            <TouchableOpacity style={s.editBtn} onPress={() => setStep('setup')}>
              <Text style={s.editBtnText}>Edit Configuration</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  inner: { padding: 24, paddingBottom: 40 },
  scroll: { flex: 1, padding: 20 },
  logoArea: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
  logoBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: C.accent + '20', borderWidth: 1, borderColor: C.accent + '40', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoBoxSm: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.accent + '20', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 26, fontWeight: '900', color: C.text, letterSpacing: 4 },
  logoSub: { fontSize: 9, color: C.muted, letterSpacing: 3, marginTop: 6, textAlign: 'center' },
  card: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 20 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 20 },
  label: { fontSize: 10, color: C.muted, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 14, color: C.text, fontSize: 13, marginBottom: 16 },
  btn: { backgroundColor: C.accent, borderRadius: 12, padding: 16, alignItems: 'center' },
  btnOff: { opacity: 0.5 },
  btnText: { color: C.bg, fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 17, fontWeight: '900', color: C.text },
  headerSub: { fontSize: 11, color: C.muted, marginTop: 2 },
  accessCard: { backgroundColor: C.accent + '10', borderWidth: 1, borderColor: C.accent + '40', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  accessLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  accessTitle: { fontSize: 14, fontWeight: '800', color: C.accent, marginBottom: 4 },
  accessSub: { fontSize: 11, color: C.muted, lineHeight: 16 },
  howCard: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 14 },
  sectionLabel: { fontSize: 10, color: C.muted, fontWeight: '700', letterSpacing: 2, marginBottom: 14 },
  howRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  howText: { flex: 1, fontSize: 13, color: C.text, lineHeight: 18 },
  noteCard: { backgroundColor: C.warning + '10', borderWidth: 1, borderColor: C.warning + '30', borderRadius: 14, padding: 16, flexDirection: 'row', gap: 12, marginBottom: 14 },
  noteTitle: { fontSize: 13, color: C.warning, fontWeight: '700', marginBottom: 4 },
  noteSub: { fontSize: 11, color: C.muted, lineHeight: 16 },
  configCard: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16 },
  configLabel: { fontSize: 10, color: C.muted, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  configValue: { fontSize: 12, color: C.text, fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier New', marginBottom: 4 },
  editBtn: { borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 12 },
  editBtnText: { color: C.muted, fontSize: 12, fontWeight: '600' },
});
