import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../src/theme';
import { TextField } from '../../src/components/ui';

interface ChatMessage {
  id: string;
  role: 'user' | 'coach';
  text: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: 'm1',
    role: 'coach',
    text: "Hi! I'm your AI coach. Ask me about your nutrition, workouts, or progress.",
  },
  { id: 'm2', role: 'user', text: 'How much protein do I still need today?' },
  {
    id: 'm3',
    role: 'coach',
    text: "You're at 78g of your 140g target — about 62g left. A Greek yogurt or paneer serving would close most of that gap.",
  },
];

// Coach is V1 scope (architecture-plan.md §K) — this is a styled, non-functional shell.
// The real implementation is SSE-streamed (POST /coach/chat) with server-side tool-calling
// and a safety-classification pass (architecture-plan.md §H); wiring that up is out of
// scope for this scaffold, so sends just echo locally.
export default function CoachScreen() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');

  function handleSend() {
    if (!input.trim()) return;
    const userMessage: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text: input.trim() };
    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: `c-${Date.now()}`,
        role: 'coach',
        text: "Coach responses aren't wired up yet — this is a V1 feature. Your message was captured locally only.",
      },
    ]);
    setInput('');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={typography.h1}>Coach</Text>
        <Text style={typography.caption}>AI-powered guidance, grounded in your data</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.bubbleRow, item.role === 'user' && styles.bubbleRowUser]}>
            <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleCoach]}>
              <Text style={item.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextCoach}>{item.text}</Text>
            </View>
          </View>
        )}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={12}>
        <View style={styles.inputRow}>
          <View style={styles.inputWrap}>
            <TextField
              value={input}
              onChangeText={setInput}
              placeholder="Ask your coach anything…"
              style={styles.textFieldOverride}
            />
          </View>
          <Pressable style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={18} color={colors.textOnAccent} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', borderRadius: radius.lg, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  bubbleCoach: { backgroundColor: colors.surfaceAlt, borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: colors.charcoal, borderBottomRightRadius: 4 },
  bubbleTextCoach: { color: colors.textPrimary, fontSize: 15, lineHeight: 21 },
  bubbleTextUser: { color: colors.textOnCharcoal, fontSize: 15, lineHeight: 21 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputWrap: { flex: 1 },
  textFieldOverride: { marginBottom: 0 },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
