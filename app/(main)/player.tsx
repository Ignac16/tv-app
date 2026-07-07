import { useChannels } from '@/components/ChannelContext';
import { Channel } from '@/constants/channels';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AudioTracks, ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FAVORITES_KEY = 'favorite_channels';

const getFavorites = async (): Promise<string[]> => {
  try {
    const stored = await AsyncStorage.getItem(FAVORITES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading favorites:', error);
  }
  return [];
};

const setFavorites = async (favorites: string[]) => {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites:', error);
  }
};

const toggleFavorite = async (channelId: string): Promise<boolean> => {
  const favorites = await getFavorites();
  if (favorites.includes(channelId)) {
    const newFavorites = favorites.filter(id => id !== channelId);
    await setFavorites(newFavorites);
    return false;
  } else {
    const newFavorites = [...favorites, channelId];
    await setFavorites(newFavorites);
    return true;
  }
};

export default function PlayerScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>();
  const { channels } = useChannels();
  const router = useRouter();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [audioTracks, setAudioTracks] = useState<AudioTracks[]>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState(-1);
  const [showAudioMenu, setShowAudioMenu] = useState(false);

  useEffect(() => {
    const foundChannel = channels.find((ch) => ch.id === channelId);
    if (foundChannel) {
      setChannel(foundChannel);
      loadFavoriteStatus();
    } else {
      Alert.alert('Error', 'Channel not found');
      router.back();
    }
  }, [channelId, channels]);

  const loadFavoriteStatus = async () => {
    const favorites = await getFavorites();
    setIsFavorite(favorites.includes(channelId));
  };

  const handleToggleFavorite = async () => {
    const newState = await toggleFavorite(channelId);
    setIsFavorite(newState);
  };

  const handleBack = () => {
    router.back();
  };

  const handleAudioTrackChange = async (trackId: number) => {
    // Audio track switching for expo-av would require more complex implementation
    setCurrentAudioTrack(trackId);
    setShowAudioMenu(false);
  };

  if (!channel) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerButtons}>
          {audioTracks.length > 0 && (
            <TouchableOpacity onPress={() => setShowAudioMenu(!showAudioMenu)} style={styles.audioButton}>
              <Text style={styles.audioButtonText}>🎵</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
            <Text style={styles.favoriteButtonText}>
              {isFavorite ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {showAudioMenu && (
        <View style={styles.audioMenu}>
          <Text style={styles.audioMenuTitle}>Audio Tracks</Text>
          {audioTracks.map((track, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleAudioTrackChange(track.index)}
              style={[
                styles.audioMenuItem,
                currentAudioTrack === track.index && styles.audioMenuItemActive
              ]}
            >
              <Text style={styles.audioMenuItemText}>
                {track.language || `Track ${index + 1}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: channel.url }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          isLooping
          onAudioTracksUpdate={(tracks) => {
            if (tracks && tracks.length > 0) {
              setAudioTracks(tracks);
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioButton: {
    padding: 10,
    marginRight: 10,
  },
  audioButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  favoriteButton: {
    padding: 10,
  },
  favoriteButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  audioMenu: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  audioMenuTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  audioMenuItem: {
    padding: 10,
    backgroundColor: '#2a2a2a',
    marginBottom: 5,
    borderRadius: 5,
  },
  audioMenuItemActive: {
    backgroundColor: '#2f95dc',
  },
  audioMenuItemText: {
    color: '#fff',
    fontSize: 14,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
