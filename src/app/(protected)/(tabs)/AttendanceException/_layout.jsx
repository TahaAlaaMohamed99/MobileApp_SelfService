import { Stack } from 'expo-router';
import { useTabScreenOptions } from '../../../../hooks/useTabScreenOptions';

export default function AttendanceExceptionLayout() {
  const tabOptions = useTabScreenOptions();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ ...tabOptions, title: 'Attendance Exceptions' }} />
      <Stack.Screen name="[id]" options={{ title: 'Attendance Exception' }} />
    </Stack>
  );
}
