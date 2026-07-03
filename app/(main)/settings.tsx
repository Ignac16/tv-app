import { Text, View, useThemeColor } from '@/components/Themed';
import { useColorSchemeManager } from '@/components/useColorScheme';
import { StyleSheet, Switch, TouchableOpacity } from 'react-native';

export default function SettingsScreen() {
  const { manualScheme, isLoading, setColorScheme } = useColorSchemeManager();
  const surfaceColor = useThemeColor({ light: '#fff', dark: '#1a1a1a' }, 'background');
  const subtitleColor = useThemeColor({ light: '#666', dark: '#aaa' }, 'text');
  const containerBackgroundColor = useThemeColor({ light: '#f5f5f5', dark: '#000' }, 'background');

  const isDarkMode = manualScheme === 'dark';
  const isSystem = manualScheme === null;

  const handleToggle = () => {
    if (isSystem) {
      setColorScheme('dark');
    } else if (isDarkMode) {
      setColorScheme('light');
    } else {
      setColorScheme(null);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
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
        onPress={() => setColorScheme(null)}
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
