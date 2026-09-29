import { Stack } from 'expo-router';
import { useTabScreenOptions } from '../../../../hooks/useTabScreenOptions';

export default function PartialDayLeaveLayout() {
  const tabOptions = useTabScreenOptions();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ ...tabOptions, title: 'Partial Day Leaves' }} />
      <Stack.Screen name="[id]" options={{ title: 'Partial Day Leave' }} />
    </Stack>
  );
}
