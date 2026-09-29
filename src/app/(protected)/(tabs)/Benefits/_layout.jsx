import { Stack } from 'expo-router';
import { useTabScreenOptions } from '../../../../hooks/useTabScreenOptions';

export default function PartialDayLeaveLayout() {
  const tabOptions = useTabScreenOptions();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ ...tabOptions, title: 'Benefits' }} />
      <Stack.Screen name="[id]" options={{ title: 'Benefits' }} />
    </Stack>
  );
}
