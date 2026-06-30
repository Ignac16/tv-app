import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

type ScreenProps = {
  title: string;
};

export function Screen({ title }: ScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});
