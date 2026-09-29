import { Stack } from 'expo-router';
import { useSimpleTabOptions } from '../../../../../hooks/useTabScreenOptionsAddEdit';

export default function EmployeeBankLayout() {
  const tabOptions = useSimpleTabOptions('EmployeeBank');

  return (
    <Stack>
      <Stack.Screen name="index" options={{ ...tabOptions, title: 'EmployeeBank' }} />
    </Stack>
  );
}
