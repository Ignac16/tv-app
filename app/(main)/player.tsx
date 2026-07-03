import { Channel, channels } from '@/constants/channels';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PlayerScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>();
  const router = useRouter();
  const webViewRef = useRef<any>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    const foundChannel = channels.find((ch) => ch.id === channelId);
    if (foundChannel) {
      setChannel(foundChannel);
    } else {
      Alert.alert('Error', 'Channel not found');
      router.back();
    }
  }, [channelId]);

  const handleBack = () => {
    router.back();
  };

  if (!channel) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Video Player</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
            #player { width: 100%; height: 100%; }
        </style>
    </head>
    <body>
        <div id="player"></div>
        <script src="https://cdn.jsdelivr.net/npm/playerjs@latest/dist/player.min.js"></script>
        <script>
            if (typeof Playerjs !== 'undefined') {
                new Playerjs({
                    id: "player",
                    file: "${channel.url}",
                    autoplay: 1,
                    loop: 1
                });
            } else {
                console.error('Playerjs not loaded');
            }
        </script>
    </body>
    </html>
  `;

  const renderPlayer = () => {
    // Use iframe for web platform with proper CSS styling
    return (
      <iframe
        srcDoc={htmlContent}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: '#000',
        }}
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.videoContainer}>
        {renderPlayer()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webView: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  channelName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  channelCategory: {
    color: '#999',
    fontSize: 14,
  },
});
