import { TabTrigger, TabTriggerSlotProps } from 'expo-router/ui';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const NAV_ITEMS = [
  { name: 'home', label: 'Home' },
  { name: 'channels', label: 'Channels' },
  { name: 'guide', label: 'Guide' },
  { name: 'settings', label: 'Settings' },
] as const;

type NavItemName = (typeof NAV_ITEMS)[number]['name'];

type NavBarItemProps = TabTriggerSlotProps & {
  label: string;
  preferredFocus?: boolean;
};

function NavBarItem({ label, isFocused, preferredFocus, ...props }: NavBarItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [isTVFocused, setIsTVFocused] = useState(false);

  const active = isFocused || isTVFocused;

  return (
    <Pressable
      {...props}
      focusable
      hasTVPreferredFocus={preferredFocus}
      onFocus={() => setIsTVFocused(true)}
      onBlur={() => setIsTVFocused(false)}
      style={[styles.item, active && { backgroundColor: colors.tint }]}>
      <Text style={[styles.itemLabel, { color: active ? colors.background : colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function NavBar() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          paddingTop: insets.top + 12,
          backgroundColor: colors.background,
          borderBottomColor: colorScheme === 'dark' ? '#333' : '#e0e0e0',
        },
      ]}>
      <Text style={[styles.brand, { color: colors.tint }]}>TV App</Text>
      <View style={styles.items}>
        {NAV_ITEMS.map((item) => (
          <TabTrigger key={item.name} name={item.name} asChild>
            <NavBarItem
              label={item.label}
              preferredFocus={item.name === 'home'}
            />
          </TabTrigger>
        ))}
      </View>
    </View>
  );
}

export type { NavItemName };

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 32,
  },
  brand: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  items: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
});
