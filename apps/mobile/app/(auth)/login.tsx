import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useMobileAuth } from '../../src/auth-context';
import { Ionicons } from '@expo/vector-icons';

export default function MobileLoginScreen() {
  const { login, isLoading } = useMobileAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in both email and password');
      return;
    }
    setError(null);
    try {
      await login({ email: email.trim(), password });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Icon & Heading */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={36} color="#ffffff" />
          </View>
          <Text style={styles.title}>PulseDesk Mobile</Text>
          <Text style={styles.subtitle}>Cross-Platform Enterprise Ticketing</Text>
        </View>

        {/* Demo Fast-Fill Buttons */}
        <View style={styles.demoCard}>
          <Text style={styles.demoLabel}>QUICK DEMO ACCOUNTS:</Text>
          <View style={styles.demoButtonsRow}>
            <TouchableOpacity
              style={[styles.demoBtn, { borderColor: '#a855f7' }]}
              onPress={() => handleQuickFill('admin@example.com')}
            >
              <Text style={[styles.demoBtnText, { color: '#c084fc' }]}>Admin</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.demoBtn, { borderColor: '#3b82f6' }]}
              onPress={() => handleQuickFill('agent@example.com')}
            >
              <Text style={[styles.demoBtnText, { color: '#60a5fa' }]}>Agent</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.demoBtn, { borderColor: '#10b981' }]}
              onPress={() => handleQuickFill('customer@example.com')}
            >
              <Text style={[styles.demoBtnText, { color: '#34d399' }]}>Customer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Input Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="name@company.com"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#64748b"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#6366f1',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 6,
  },
  demoCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 20,
  },
  demoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    flex: 1,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#ffffff',
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#6366f1',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

