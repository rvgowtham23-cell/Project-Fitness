import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../src/theme';
import { Button, Screen, TextField } from '../../src/components/ui';
import { StepHeader } from '../../src/components/onboarding/StepHeader';
import { useOnboarding } from '../../src/state/onboarding-context';
import { apiClient, ApiError } from '../../src/lib/api-client';

export default function OnboardingAccountScreen() {
  const { draft, updateDraft } = useOnboarding();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    setSubmitting(true);
    setError(null);
    try {
      // A fresh install always registers first; a 409 means this email already has an
      // account on this backend (e.g. re-onboarding after a reinstall) — fall back to
      // logging in with the same credentials rather than treating that as a hard failure.
      let isExistingAccount = false;
      try {
        await apiClient.register(draft.email, password, draft.name || draft.email);
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          isExistingAccount = true;
          await apiClient.login(draft.email, password);
        } else {
          throw err;
        }
      }

      // An existing account may have already finished onboarding in a previous session —
      // don't force them through the whole survey again just because they had to type their
      // password (e.g. after a fresh install/reinstall wiped SecureStore).
      if (isExistingAccount) {
        try {
          const { profile } = await apiClient.getProfile();
          if (profile.onboardingCompletedAt) {
            router.replace('/(tabs)/home');
            return;
          }
        } catch {
          // 404 (no profile yet) just means proceed to onboarding as normal below.
        }
      }

      router.push('/onboarding/basic-info');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <StepHeader step={1} totalSteps={6} title="Let's get you set up" subtitle="Just a few quick steps." />

      <TextField
        label="Email"
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="username"
        value={draft.email}
        onChangeText={(v) => updateDraft({ email: v })}
      />
      <TextField
        label="Password"
        placeholder="At least 8 characters"
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button
        label="Continue"
        onPress={handleContinue}
        variant="accent"
        disabled={!draft.email.includes('@') || password.length < 8}
        loading={submitting}
        style={styles.continueBtn}
      />

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={typography.caption}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <Button
        label="Continue with Google"
        onPress={() => Alert.alert('Google sign-in (stub)', 'OAuth wiring is a later step — see architecture-plan.md §D.')}
        variant="outline"
      />
      <View style={styles.socialGap} />
      <Button
        label="Continue with Apple"
        onPress={() => Alert.alert('Apple sign-in (stub)', 'Required before App Store submission per §D.')}
        variant="outline"
      />

      <View style={styles.footerNote}>
        <Ionicons name="lock-closed-outline" size={14} color={colors.textTertiary} />
        <Text style={typography.caption}> Your data is encrypted and never shared without consent.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  continueBtn: { marginTop: spacing.sm },
  errorText: { color: colors.danger, marginBottom: spacing.sm },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  socialGap: { height: spacing.md },
  footerNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl },
});
