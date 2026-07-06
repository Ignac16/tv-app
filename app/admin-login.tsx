import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/components/Themed';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123'; // Simple demo credentials

export default function AdminLoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const containerBackgroundColor = useThemeColor({ light: '#f5f5f5', dark: '#000' }, 'background');
  const surfaceColor = useThemeColor({ light: '#fff', dark: '#1a1a1a' }, 'background');
  const tintColor = useThemeColor({ light: '#2f95dc', dark: '#1a73e8' }, 'tint');
  const textColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
  const subtitleColor = useThemeColor({ light: '#666', dark: '#ccc' }, 'text');

  const handleLogin = () => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Navigate to admin panel
      router.push('/admin-panel');
    } else {
      Alert.alert('Login Failed', 'Invalid username or password');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Admin Panel Login</Text>
      <View style={[styles.formContainer, { backgroundColor: surfaceColor }]}>
        <Text style={[styles.label, { color: textColor }]}>Username</Text>
        <TextInput
          style={[styles.input, { borderColor: subtitleColor, color: textColor }]}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
          placeholderTextColor={subtitleColor}
        />
        <Text style={[styles.label, { color: textColor }]}>Password</Text>
        <TextInput
          style={[styles.input, { borderColor: subtitleColor, color: textColor }]}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          placeholderTextColor={subtitleColor}
          secureTextEntry
        />
        <TouchableOpacity style={[styles.loginButton, { backgroundColor: tintColor }]} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={[styles.backButtonText, { color: tintColor }]}>Back to Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  formContainer: {
    borderRadius: 10,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  loginButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
