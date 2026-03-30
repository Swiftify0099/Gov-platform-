import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface TimerProps {
  secondsLeft: number;
  isLow?: boolean;
  isCritical?: boolean;
}

export const Timer: React.FC<TimerProps> = ({ secondsLeft, isLow = false, isCritical = false }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isCritical) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isCritical]);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const h = Math.floor(secondsLeft / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = secondsLeft % 60;
  const formatted = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;

  const color = isCritical ? '#ef4444' : isLow ? '#f59e0b' : '#10b981';
  const borderColor = isCritical ? 'rgba(239,68,68,0.3)' : isLow ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.2)';

  return (
    <Animated.View style={[styles.container, { borderColor }, { transform: [{ scale: pulseAnim }] }]}>
      <Text style={styles.label}>⏱ Time Left</Text>
      <Text style={[styles.time, { color }]}>{formatted}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  label: { color: '#64748b', fontSize: 10, fontWeight: '600', marginBottom: 2 },
  time: { fontSize: 22, fontWeight: '900', fontVariant: ['tabular-nums'] },
});
