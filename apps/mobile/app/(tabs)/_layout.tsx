import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../../src/theme';

function CentralLogIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.logButton, focused && styles.logButtonFocused]}>
      <Ionicons name="add" size={28} color={colors.textOnAccent} accessibilityLabel="Log" />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.charcoal,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: '',
          tabBarIcon: CentralLogIcon,
        }}
        listeners={{
          // The Log tab is deliberately not a screen: architecture-plan.md §I organizes
          // navigation around a single central Log ACTION (camera/barcode/manual/workout)
          // rather than a browsable tab, to keep manual data entry minimal and consistent
          // everywhere the user might want to log something. We still need a route file
          // here (see log.tsx) because Tabs requires one per Tabs.Screen — intercepting
          // tabPress is how it stays an action instead of a destination.
          tabPress: (e) => {
            e.preventDefault();
            router.push('/log');
          },
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Coach',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopColor: colors.border,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabLabel: { fontSize: 11, fontWeight: '600' },
  logButton: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logButtonFocused: { backgroundColor: colors.accentPressed },
});
