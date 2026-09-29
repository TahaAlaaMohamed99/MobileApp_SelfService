import { Stack } from 'expo-router';
import { useTabScreenOptions } from '../../../../hooks/useTabScreenOptions';

export default function PayslipLayout() {
  const tabOptions = useTabScreenOptions();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ ...tabOptions, title: 'Payslips' }} />
      <Stack.Screen name="[id]" options={{ title: 'Payslip' }} />
    </Stack>
  );
}
