import React from 'react';
import { Redirect } from 'expo-router';

// Unreachable in normal use: the Log tab's tabPress is intercepted in ./_layout.tsx to
// push the /log modal instead of navigating here. This file exists only because Expo
// Router's Tabs requires a real route per Tabs.Screen entry — if it's ever reached
// directly (e.g. deep link to this exact path), fall back to Home rather than a blank
// screen.
export default function LogTabPlaceholder() {
  return <Redirect href="/(tabs)/home" />;
}
