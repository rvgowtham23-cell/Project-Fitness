import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../src/theme';
import { Button, Screen, TextField } from '../../src/components/ui';
import { StepHeader } from '../../src/components/onboarding/StepHeader';
import { useOnboarding } from '../../src/state/onboarding-context';

export default function OnboardingAccountScreen() {
  const { draft, updateDraft } = useOnboarding();
  const [password, setPassword] = useState('');

  function handleContinue() {
    router.push('/onboarding/basic-info');
  }

  return (
    <Screen>
      <StepHeader step={1} totalSteps={6} title="Let's get you set up" subtitle="Just a few quick steps." />

      <TextField
        label="Email"
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={draft.email}
        onChangeText={(v) => updateDraft({ email: v })}
      />
      <TextField
        label="Password"
        placeholder="At least 8 characters"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button
        label="Continue"
        onPress={handleContinue}
        variant="accent"
        disabled={!draft.email.includes('@') || password.length < 8}
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
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  socialGap: { height: spacing.md },
  footerNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl },
});
