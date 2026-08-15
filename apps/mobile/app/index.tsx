import React from 'react';
import { Redirect } from 'expo-router';
import { useOnboarding } from '../src/state/onboarding-context';

// The sole "/" route — kept separate from (tabs)/home.tsx (rather than naming it
// (tabs)/index.tsx) specifically so this redirect and the actual Home screen don't
// collide on the same route path.
export default function Index() {
  const { isOnboarded } = useOnboarding();
  return <Redirect href={isOnboarded ? '/(tabs)/home' : '/onboarding'} />;
}
