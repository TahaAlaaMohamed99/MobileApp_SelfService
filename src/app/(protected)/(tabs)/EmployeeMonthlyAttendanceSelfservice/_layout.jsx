import { Stack } from 'expo-router';
import { useTabScreenOptions } from '../../../../hooks/useTabScreenOptions';

export default function EmployeeMonthlyAttendanceSelfserviceLayout() {
  const tabOptions = useTabScreenOptions();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ ...tabOptions, title: 'Attendance' }} />
    </Stack>
  );
}
