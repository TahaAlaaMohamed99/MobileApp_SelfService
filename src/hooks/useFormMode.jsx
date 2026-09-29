import { useLocalSearchParams } from 'expo-router';

export default function useFormMode() {
  const { id } = useLocalSearchParams();
  const numericId = Number(id);
  const isCreate = numericId === 0;
  const isEdit = numericId > 0;
 
  return { id: numericId, isCreate, isEdit };
}
