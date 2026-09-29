import { Stack } from 'expo-router';
import { useSimpleTabOptions } from '../../../../../hooks/useTabScreenOptionsAddEdit';

export default function EmployeeBankLayout() {
  const tabOptions = useSimpleTabOptions('registration',"resetPassword",false);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ ...tabOptions, title: 'resetPassword' }} />
    </Stack>
  );
}
