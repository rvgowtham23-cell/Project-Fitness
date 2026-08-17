import React from 'react';
import { Redirect } from 'expo-router';
import { useAppBootstrap } from '../src/hooks/use-app-bootstrap';
import { LoadingState, Screen } from '../src/components/ui';

// The sole "/" route — kept separate from (tabs)/home.tsx (rather than naming it
// (tabs)/index.tsx) specifically so this redirect and the actual Home screen don't
// collide on the same route path.
export default function Index() {
  const status = useAppBootstrap();

  if (status === 'loading') {
    return (
      <Screen>
        <LoadingState label="Loading…" />
      </Screen>
    );
  }

  if (status === 'ready') return <Redirect href="/(tabs)/home" />;
  if (status === 'needs-onboarding') return <Redirect href="/onboarding/basic-info" />;
  return <Redirect href="/onboarding" />;
}
