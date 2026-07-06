import { useChannels } from '@/components/ChannelContext';
import { Text, View, useThemeColor } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const { channels } = useChannels();
  const router = useRouter();
  const surfaceColor = useThemeColor({ light: '#fff', dark: '#1a1a1a' }, 'background');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'text');
  const subtitleColor = useThemeColor({ light: '#666', dark: '#ccc' }, 'text'); // Lighter for dark mode
  const containerBackgroundColor = useThemeColor({ light: '#f5f5f5', dark: '#000' }, 'background');

  const handleChannelPress = (channelId: string) => {
    router.push(`/player?channelId=${channelId}`);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <View style={[styles.header, { backgroundColor: surfaceColor, borderBottomColor: borderColor }]}>
        <Text style={styles.headerTitle}>Spanish TV Channels</Text>
        <Text style={[styles.headerSubtitle, { color: subtitleColor }]}>Available channels from playlist</Text>
      </View>
      <View style={styles.channelsGrid}>
        {channels.map((channel) => (
          <TouchableOpacity 
            key={channel.id} 
            style={[styles.channelCard, { backgroundColor: surfaceColor }]}
            onPress={() => handleChannelPress(channel.id)}
          >
            <Image source={{ uri: channel.logo }} style={styles.channelLogo} resizeMode="contain" />
            <Text style={styles.channelName}>{channel.name}</Text>
            <Text style={[styles.channelCategory, { color: subtitleColor }]}>{channel.category}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  channelsGrid: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  channelCard: {
    width: '48%',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  channelLogo: {
    width: 80,
    height: 80,
    marginBottom: 10,
    borderRadius: 8,
  },
  channelName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
  },
  channelCategory: {
    fontSize: 12,
  },
});
