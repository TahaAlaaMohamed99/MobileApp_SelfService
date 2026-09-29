import { Stack } from 'expo-router';
import { useSimpleTabOptions } from '../../../../../hooks/useTabScreenOptionsAddEdit';

export default function EmployeeAddressLayout() {
  const tabOptions = useSimpleTabOptions('EmployeeAddress');

  return (
    <Stack>
      <Stack.Screen name="index" options={{ ...tabOptions, title: 'EmployeeAddress' }} />
    </Stack>
  );
}
