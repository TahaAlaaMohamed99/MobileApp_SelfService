import { Stack } from 'expo-router';
import { useTabScreenOptions } from '../../../../hooks/useTabScreenOptions';

export default function MissionLayout() {
  const tabOptions = useTabScreenOptions();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ ...tabOptions, title: 'Missions' }} />
      <Stack.Screen name="[id]" options={{ title: 'Mission' }} />
    </Stack>
  );
}
