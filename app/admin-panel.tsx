import { useChannels } from '@/components/ChannelContext';
import { useThemeColor } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AdminPanelScreen() {
  const router = useRouter();
  const { channels, addChannel, removeChannel, getCategories, getChannelsByCategory } = useChannels();
  const containerBackgroundColor = useThemeColor({ light: '#f5f5f5', dark: '#000' }, 'background');
  const surfaceColor = useThemeColor({ light: '#fff', dark: '#1a1a1a' }, 'background');
  const tintColor = useThemeColor({ light: '#2f95dc', dark: '#1a73e8' }, 'tint');
  const textColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
  const subtitleColor = useThemeColor({ light: '#666', dark: '#ccc' }, 'text');
  const inputBg = useThemeColor({ light: '#f0f0f0', dark: '#333' }, 'background');

  // Form state for add channel
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [category, setCategory] = useState('');
  const [url, setUrl] = useState('');

  // State for raw file editor
  const [rawFileContent, setRawFileContent] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const categories = getCategories();
  const channelsByCategory = getChannelsByCategory();

  // Load raw file on mount
  const loadRawFile = async () => {
    setIsLoadingFile(true);
    try {
      const response = await fetch('http://localhost:3002/api/channels');
      if (response.ok) {
        const data = await response.json();
        setRawFileContent(data.content);
      }
    } catch (error) {
      console.error('Failed to load file:', error);
    } finally {
      setIsLoadingFile(false);
    }
  };

  // Save raw file
  const saveRawFile = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: rawFileContent }),
      });
      if (response.ok) {
        Alert.alert('Success', 'channels.ts saved successfully! Restart your dev server to see changes!');
      }
    } catch (error) {
      console.error('Failed to save file:', error);
      Alert.alert('Error', 'Failed to save channels.ts! Make sure dev-server is running!');
    }
  };

  const handleAddChannel = async () => {
    if (!id || !name || !logo || !category || !url) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Add to context
    addChannel({
      id,
      name,
      logo,
      category,
      url,
    });

    // Also update the raw file content and save to dev server
    try {
      const newChannelEntry = `  {
    id: '${id}',
    name: '${name}',
    logo: '${logo}',
    category: '${category}',
    url: '${url}',
  },`;

      // Find the position before the closing bracket and add the new channel
      const updatedContent = rawFileContent.replace(
        /(];)$/,
        `${newChannelEntry}\n];`
      );
      setRawFileContent(updatedContent);

      const response = await fetch('http://localhost:3002/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedContent }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Channel added successfully! Restart your dev server to see changes!');
        // Reload the file to ensure sync
        await loadRawFile();
      } else {
        Alert.alert('Partial Success', 'Channel added to context but failed to update channels.ts file');
      }
    } catch (error) {
      console.error('Failed to update channels.ts:', error);
      Alert.alert('Partial Success', 'Channel added to context but failed to update channels.ts file');
    }

    // Reset form
    setId('');
    setName('');
    setLogo('');
    setCategory('');
    setUrl('');
  };

  const handleRemoveChannel = async (channelId: string, channelName: string) => {
    Alert.alert(
      'Confirm',
      `Are you sure you want to remove ${channelName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            // Remove from context
            removeChannel(channelId);
            
            // Also update the raw file content and save to dev server
            try {
              const updatedContent = rawFileContent.replace(
                new RegExp(`\\{\\s*id:\\s*['"]${channelId}['"][\\s\\S]*?\\},?\\s*`),
                ''
              );
              setRawFileContent(updatedContent);
              
              const response = await fetch('http://localhost:3002/api/channels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: updatedContent }),
              });
              
              if (response.ok) {
                Alert.alert('Success', 'Channel removed successfully! Restart your dev server to see changes!');
                // Reload the file to ensure sync
                await loadRawFile();
              } else {
                Alert.alert('Partial Success', 'Channel removed from context but failed to update channels.ts file');
              }
            } catch (error) {
              console.error('Failed to update channels.ts:', error);
              Alert.alert('Partial Success', 'Channel removed from context but failed to update channels.ts file');
            }
          },
        },
      ],
    );
  };

  // Load file on mount
  useEffect(() => {
    loadRawFile();
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Admin Panel</Text>

      {/* Quick Stats */}
      <View style={[styles.section, { backgroundColor: surfaceColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Quick Stats</Text>
        <Text style={[styles.statText, { color: subtitleColor }]}>Total Channels: {channels.length}</Text>
        <Text style={[styles.statText, { color: subtitleColor }]}>Total Categories: {categories.length}</Text>
      </View>

      {/* Edit channels.ts */}
      <View style={[styles.section, { backgroundColor: surfaceColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Edit channels.ts</Text>
        <Text style={[styles.label, { color: textColor }]}>
          Note: You must run `npm run dev-server` in another terminal for this to work!
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: tintColor, marginBottom: 10 }]}
          onPress={loadRawFile}
          disabled={isLoadingFile}
        >
          <Text style={styles.addButtonText}>
            {isLoadingFile ? 'Loading...' : 'Reload File'}
          </Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.textarea, { backgroundColor: inputBg, color: textColor }]}
          value={rawFileContent}
          onChangeText={setRawFileContent}
          multiline
          placeholder="Loading channels.ts..."
          placeholderTextColor={subtitleColor}
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: tintColor, marginTop: 10 }]}
          onPress={saveRawFile}
        >
          <Text style={styles.addButtonText}>Save to channels.ts</Text>
        </TouchableOpacity>
      </View>

      {/* Add Channel */}
      <View style={[styles.section, { backgroundColor: surfaceColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Add New Channel</Text>

        <Text style={[styles.label, { color: textColor }]}>ID</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
          value={id}
          onChangeText={setId}
          placeholder="Channel ID"
          placeholderTextColor={subtitleColor}
        />

        <Text style={[styles.label, { color: textColor }]}>Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
          value={name}
          onChangeText={setName}
          placeholder="Channel Name"
          placeholderTextColor={subtitleColor}
        />

        <Text style={[styles.label, { color: textColor }]}>Logo URL</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
          value={logo}
          onChangeText={setLogo}
          placeholder="https://example.com/logo.png"
          placeholderTextColor={subtitleColor}
        />

        <Text style={[styles.label, { color: textColor }]}>Category</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
          value={category}
          onChangeText={setCategory}
          placeholder="e.g., Spain, Fútbol"
          placeholderTextColor={subtitleColor}
        />

        <Text style={[styles.label, { color: textColor }]}>Stream URL</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
          value={url}
          onChangeText={setUrl}
          placeholder="https://example.com/stream.m3u8"
          placeholderTextColor={subtitleColor}
        />

        <TouchableOpacity style={[styles.addButton, { backgroundColor: tintColor }]} onPress={handleAddChannel}>
          <Text style={styles.addButtonText}>Add Channel</Text>
        </TouchableOpacity>
      </View>

      {/* Remove Channel */}
      <View style={[styles.section, { backgroundColor: surfaceColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Remove Channel</Text>

        {channels.map((channel) => (
          <View key={channel.id} style={styles.channelItem}>
            <View style={styles.channelInfo}>
              <Text style={[styles.channelName, { color: textColor }]}>
                {channel.name}
              </Text>
              <Text style={[styles.channelCategory, { color: subtitleColor }]}>
                {channel.category}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveChannel(channel.id, channel.name)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: tintColor }]} onPress={() => router.back()}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statText: {
    fontSize: 16,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  textarea: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 12,
    minHeight: 400,
    textAlignVertical: 'top',
  },
  addButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  channelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '500',
  },
  channelCategory: {
    fontSize: 14,
  },
  removeButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  logoutButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
