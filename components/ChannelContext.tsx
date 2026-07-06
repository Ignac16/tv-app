import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Channel, channels as initialChannels } from '@/constants/channels';

const CHANNELS_KEY = 'custom_channels';

type ChannelContextType = {
  channels: Channel[];
  addChannel: (channel: Channel) => void;
  removeChannel: (channelId: string) => void;
  getChannelsByCategory: () => Record<string, Channel[]>;
  getCategories: () => string[];
};

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export const ChannelProvider = ({ children }: { children: ReactNode }) => {
  const [channels, setChannels] = useState<Channel[]>(initialChannels);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CHANNELS_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setChannels(parsed);
          }
        } catch (e) {
          console.error('Failed to load channels from localStorage', e);
        }
      }
    }
  }, []);

  const saveChannels = (newChannels: Channel[]) => {
    setChannels(newChannels);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CHANNELS_KEY, JSON.stringify(newChannels));
    }
  };

  const addChannel = (channel: Channel) => {
    saveChannels([...channels, channel]);
  };

  const removeChannel = (channelId: string) => {
    saveChannels(channels.filter((ch) => ch.id !== channelId));
  };

  const getChannelsByCategory = (): Record<string, Channel[]> => {
    const grouped: Record<string, Channel[]> = {};
    channels.forEach((channel) => {
      if (!grouped[channel.category]) {
        grouped[channel.category] = [];
      }
      grouped[channel.category].push(channel);
    });
    return grouped;
  };

  const getCategories = (): string[] => {
    const categories = new Set(channels.map((channel) => channel.category));
    return Array.from(categories).sort();
  };

  return (
    <ChannelContext.Provider
      value={{
        channels,
        addChannel,
        removeChannel,
        getChannelsByCategory,
        getCategories,
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
};

export const useChannels = () => {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error('useChannels must be used within a ChannelProvider');
  }
  return context;
};
