import { Text, View, useThemeColor } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { StyleSheet, Switch, TouchableOpacity } from 'react-native';

const COLOR_SCHEME_KEY = 'color_scheme';

const getStoredScheme = (): 'light' | 'dark' | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(COLOR_SCHEME_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  }
  return null;
};

const setStoredScheme = (scheme: 'light' | 'dark' | null) => {
  if (typeof window !== 'undefined') {
    if (scheme === null) {
      localStorage.removeItem(COLOR_SCHEME_KEY);
    } else {
      localStorage.setItem(COLOR_SCHEME_KEY, scheme);
    }
  }
};

export default function SettingsScreen() {
  const [manualScheme, setManualScheme] = useState<'light' | 'dark' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const surfaceColor = useThemeColor({ light: '#fff', dark: '#1a1a1a' }, 'background');
  const subtitleColor = useThemeColor({ light: '#666', dark: '#ccc' }, 'text');
  const containerBackgroundColor = useThemeColor({ light: '#f5f5f5', dark: '#000' }, 'background');

  useEffect(() => {
    const stored = getStoredScheme();
    setManualScheme(stored);
    setIsLoading(false);
  }, []);

  const isDarkMode = manualScheme === 'dark';
  const isSystem = manualScheme === null;

  const handleToggle = () => {
    if (isSystem) {
      setStoredScheme('dark');
      setManualScheme('dark');
    } else if (isDarkMode) {
      setStoredScheme('light');
      setManualScheme('light');
    } else {
      setStoredScheme(null);
      setManualScheme(null);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <View style={[styles.settingItem, { backgroundColor: surfaceColor }]}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Dark Mode</Text>
          <Text style={[styles.settingDescription, { color: subtitleColor }]}>
            {isSystem ? 'System' : isDarkMode ? 'On' : 'Off'}
          </Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={handleToggle}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>
      <TouchableOpacity
        style={[styles.resetButton, { backgroundColor: surfaceColor }]}
        onPress={() => {
          setStoredScheme(null);
          setManualScheme(null);
        }}
      >
        <Text style={styles.resetButtonText}>Use System Default</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 14,
  },
  resetButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    fontSize: 16,
    color: '#2f95dc',
    fontWeight: '600',
  },
});
