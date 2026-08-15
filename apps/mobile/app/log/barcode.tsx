import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, radius, spacing, typography } from '../../src/theme';
import { Button, ErrorState, LoadingState, Screen } from '../../src/components/ui';
import { useBarcodeLookup } from '../../src/features/nutrition/use-meal-mutations';
import { useMealDraft } from '../../src/state/meal-draft-context';

type Stage = 'scanning' | 'looking-up' | 'error';

export default function BarcodeScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [stage, setStage] = useState<Stage>('scanning');
  const scannedRef = useRef(false);
  const lookupMutation = useBarcodeLookup();
  const { setDraftFromItems } = useMealDraft();

  function handleBarcodeScanned(code: string) {
    if (scannedRef.current) return; // onBarcodeScanned fires repeatedly per frame — only act once
    scannedRef.current = true;
    setStage('looking-up');

    lookupMutation.mutate(code, {
      onSuccess: (product) => {
        setDraftFromItems([product.item], `From barcode · ${product.name}`);
        router.replace('/meal/confirm');
      },
      onError: () => setStage('error'),
    });
  }

  if (!permission) {
    return (
      <Screen scroll={false}>
        <LoadingState label="Checking camera permission…" />
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen scroll={false} style={styles.center}>
        <Text style={typography.h2}>Camera access needed</Text>
        <Text style={[typography.caption, styles.hint]}>
          We need your camera to scan product barcodes.
        </Text>
        <Button label="Grant camera access" onPress={requestPermission} variant="accent" />
      </Screen>
    );
  }

  if (stage === 'looking-up') {
    return (
      <Screen scroll={false}>
        <LoadingState label="Looking up product…" />
      </Screen>
    );
  }

  if (stage === 'error') {
    return (
      <Screen scroll={false}>
        <ErrorState
          message="Couldn't find that product."
          onRetry={() => {
            scannedRef.current = false;
            setStage('scanning');
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll={false} style={styles.screen}>
      <View style={styles.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
          onBarcodeScanned={(result) => handleBarcodeScanned(result.data)}
        />
        <View style={styles.frame} />
      </View>
      <Text style={[typography.caption, styles.hint]}>Align the barcode within the frame</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { alignItems: 'center', justifyContent: 'center', padding: 0 },
  center: { alignItems: 'center', justifyContent: 'center' },
  cameraWrap: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.charcoal,
  },
  frame: {
    position: 'absolute',
    top: '35%',
    left: '10%',
    right: '10%',
    height: '20%',
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: radius.md,
  },
  hint: { marginTop: spacing.lg, textAlign: 'center' },
});
