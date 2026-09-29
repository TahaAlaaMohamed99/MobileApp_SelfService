import { Stack } from 'expo-router';
import { useTabScreenOptions } from '../../../../hooks/useTabScreenOptions';

export default function MissedAttendanceRequestLayout() {
  const tabOptions = useTabScreenOptions();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ ...tabOptions, title: 'MissedAttendanceRequest' }} />
      <Stack.Screen name="[id]" options={{ title: 'MissedAttendanceRequest' }} />
    </Stack>
  );
}
