import { StyleSheet, View } from 'react-native';
import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';

import { NavBar } from '@/components/NavBar';

export default function MainLayout() {
  return (
    <Tabs>
      <View style={styles.container}>
        <NavBar />
        <TabSlot style={styles.content} />
      </View>
      <TabList style={styles.hiddenTabList}>
        <TabTrigger name="home" href="/" />
        <TabTrigger name="channels" href="/channels" />
        <TabTrigger name="guide" href="/guide" />
        <TabTrigger name="settings" href="/settings" />
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  hiddenTabList: {
    display: 'none',
  },
});
