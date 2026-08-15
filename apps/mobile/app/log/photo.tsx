import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius, spacing, typography } from '../../src/theme';
import { Button, ErrorState, LoadingState, Screen } from '../../src/components/ui';
import { useAnalyzeMealImage } from '../../src/features/nutrition/use-meal-mutations';
import { useMealDraft } from '../../src/state/meal-draft-context';

type Stage = 'idle' | 'captured' | 'analyzing' | 'error';

export default function PhotoLogScreen() {
  const [stage, setStage] = useState<Stage>('idle');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const analyzeMutation = useAnalyzeMealImage();
  const { setDraftFromItems } = useMealDraft();

  async function capture(fromCamera: boolean) {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setStage('error');
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });

    if (result.canceled || result.assets.length === 0) return;

    const uri = result.assets[0].uri;
    setImageUri(uri);
    setStage('analyzing');
    analyzeMutation.mutate(uri, {
      onSuccess: (response) => {
        setDraftFromItems(response.items, 'From photo', response.aiRequestId);
        router.replace('/meal/confirm');
      },
      onError: () => setStage('error'),
    });
  }

  if (stage === 'analyzing') {
    return (
      <Screen scroll={false}>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
        <LoadingState label="Analyzing your meal…" />
        <Text style={[typography.caption, styles.hint]}>
          Our AI is estimating portions and macros — you'll confirm everything before it's saved.
        </Text>
      </Screen>
    );
  }

  if (stage === 'error') {
    return (
      <Screen scroll={false}>
        <ErrorState
          message="Couldn't analyze that photo. Check camera permissions and try again."
          onRetry={() => setStage('idle')}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll={false} style={styles.screen}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconEmoji}>📷</Text>
      </View>
      <Text style={typography.h2}>Snap your meal</Text>
      <Text style={[typography.caption, styles.hint]}>
        Get the whole plate in frame for the most accurate estimate.
      </Text>

      <View style={styles.actions}>
        <Button label="Take Photo" onPress={() => capture(true)} variant="accent" />
        <Button label="Choose from Library" onPress={() => capture(false)} variant="outline" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { alignItems: 'center', justifyContent: 'center' },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  iconEmoji: { fontSize: 36 },
  hint: { textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xl, paddingHorizontal: spacing.xl },
  actions: { width: '100%', gap: spacing.md },
  preview: { width: '100%', height: 220, borderRadius: radius.lg, marginBottom: spacing.xl },
});
