import { useChannels } from '@/components/ChannelContext';
import { Channel } from '@/constants/channels';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FAVORITES_KEY = 'favorite_channels';

const getFavorites = (): string[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return [];
};

const setFavorites = (favorites: string[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
};

const toggleFavorite = (channelId: string) => {
  const favorites = getFavorites();
  if (favorites.includes(channelId)) {
    const newFavorites = favorites.filter(id => id !== channelId);
    setFavorites(newFavorites);
    return false;
  } else {
    const newFavorites = [...favorites, channelId];
    setFavorites(newFavorites);
    return true;
  }
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      video: React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
    }
  }
}

export default function PlayerScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>();
  const { channels } = useChannels();
  const router = useRouter();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState(-1);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const dashRef = useRef<any>(null);

  useEffect(() => {
    const foundChannel = channels.find((ch) => ch.id === channelId);
    if (foundChannel) {
      setChannel(foundChannel);
      const favorites = getFavorites();
      setIsFavorite(favorites.includes(channelId));
    } else {
      Alert.alert('Error', 'Channel not found');
      router.back();
    }
  }, [channelId, channels]);

  useEffect(() => {
    if (!channel || !videoRef.current) return;

    const video = videoRef.current;
    const url = channel.url;

    // Load hls.js dynamically
    const hlsScript = document.createElement('script');
    hlsScript.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js';
    hlsScript.async = true;

    // Load dash.js dynamically
    const dashScript = document.createElement('script');
    dashScript.src = 'https://cdn.dashjs.org/latest/dash.all.min.js';
    dashScript.async = true;

    let scriptsLoaded = 0;
    const checkScripts = () => {
      scriptsLoaded++;
      if (scriptsLoaded === 2) {
        initializePlayer();
      }
    };

    hlsScript.onload = checkScripts;
    dashScript.onload = checkScripts;

    const initializePlayer = () => {
      if (url.includes('.m3u8')) {
        // HLS playback
        if (typeof (window as any).Hls !== 'undefined') {
          const hls = new (window as any).Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
          hlsRef.current = hls;

          hls.on((window as any).Hls.Events.MANIFEST_PARSED, () => {
            const tracks = hls.audioTracks;
            setAudioTracks(tracks);
            setCurrentAudioTrack(hls.audioTrack);
          });
        }
      } else if (url.includes('.mpd')) {
        // DASH playback
        if (typeof (window as any).dashjs !== 'undefined') {
          const dash = (window as any).dashjs.MediaPlayer().create();
          dash.initialize(video, url, false);
          dashRef.current = dash;

          dash.on((window as any).dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
            const audioTracks = dash.getTracksFor('audio');
            setAudioTracks(audioTracks);
            const currentTrack = dash.getCurrentTrackFor('audio');
            setCurrentAudioTrack(currentTrack ? currentTrack.index : -1);
          });
        }
      } else {
        // Direct playback
        video.src = url;
      }
    };

    document.head.appendChild(hlsScript);
    document.head.appendChild(dashScript);

    return () => {
      if (document.head.contains(hlsScript)) {
        document.head.removeChild(hlsScript);
      }
      if (document.head.contains(dashScript)) {
        document.head.removeChild(dashScript);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (dashRef.current) {
        dashRef.current.reset();
      }
    };
  }, [channel]);

  const handleToggleFavorite = () => {
    const newState = toggleFavorite(channelId);
    setIsFavorite(newState);
  };

  const handleBack = () => {
    router.back();
  };

  const handleAudioTrackChange = (trackId: number) => {
    if (hlsRef.current) {
      // HLS audio track switching
      hlsRef.current.audioTrack = trackId;
      setCurrentAudioTrack(trackId);
      setShowAudioMenu(false);
    } else if (dashRef.current) {
      // DASH audio track switching
      const audioTracks = dashRef.current.getTracksFor('audio');
      const track = audioTracks.find((t: any) => t.index === trackId);
      if (track) {
        dashRef.current.setCurrentTrack(track);
        setCurrentAudioTrack(trackId);
        setShowAudioMenu(false);
      }
    }
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
              onPress={() => handleAudioTrackChange(track.id !== undefined ? track.id : track.index)}
              style={[
                styles.audioMenuItem,
                (currentAudioTrack === track.id || currentAudioTrack === track.index) && styles.audioMenuItemActive
              ]}
            >
              <Text style={styles.audioMenuItemText}>
                {track.name || track.lang || `Track ${index + 1}`}
                {track.lang && track.name && ` (${track.lang})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={styles.videoContainer}>
        <video
          ref={videoRef as any}
          controls
          autoPlay
          loop
          style={styles.video}
          playsInline
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
  } as any,
});
