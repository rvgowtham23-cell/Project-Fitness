import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        gestureEnabled: false, // progressive steps shouldn't be swiped-back accidentally
      }}
    />
  );
}
