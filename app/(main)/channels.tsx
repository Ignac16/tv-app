import { useChannels } from '@/components/ChannelContext';
import { Text, View, useThemeColor } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function ChannelsScreen() {
  const { getCategories, getChannelsByCategory } = useChannels();
  const channelsByCategory = getChannelsByCategory();
  const categories = getCategories();
  const router = useRouter();
  
  const handleChannelPress = (channelId: string) => {
    router.push(`/player?channelId=${channelId}`);
  };

  const surfaceColor = useThemeColor({ light: '#fff', dark: '#1a1a1a' }, 'background');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'text');
  const subtitleColor = useThemeColor({ light: '#666', dark: '#ccc' }, 'text'); // Lighter for dark mode
  const containerBackgroundColor = useThemeColor({ light: '#f5f5f5', dark: '#000' }, 'background');
  const channelItemBorderColor = useThemeColor({ light: '#f0f0f0', dark: '#222' }, 'text');

  return (
    <ScrollView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <View style={[styles.header, { backgroundColor: surfaceColor, borderBottomColor: borderColor }]}>
        <Text style={styles.headerTitle}>Channels by Category</Text>
        <Text style={[styles.headerSubtitle, { color: subtitleColor }]}>Browse channels organized by category</Text>
      </View>
      {categories.map((category) => (
        <View key={category} style={styles.categorySection}>
          <View style={[styles.categoryHeader, { backgroundColor: surfaceColor, borderBottomColor: borderColor }]}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <Text style={[styles.categoryCount, { color: subtitleColor }]}>{channelsByCategory[category].length} channels</Text>
          </View>
          <View style={[styles.channelsList, { backgroundColor: surfaceColor }]}>
            {channelsByCategory[category].map((channel) => (
              <TouchableOpacity 
                key={channel.id} 
                style={[styles.channelItem, { borderBottomColor: channelItemBorderColor }]}
                onPress={() => handleChannelPress(channel.id)}
              >
                <Image source={{ uri: channel.logo }} style={styles.channelLogo} resizeMode="contain" />
                <View style={styles.channelInfo}>
                  <Text style={styles.channelName}>{channel.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
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
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryCount: {
    fontSize: 12,
  },
  channelsList: {
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  channelLogo: {
    width: 50,
    height: 50,
    marginRight: 15,
    borderRadius: 8,
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '500',
  },
});
