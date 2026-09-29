import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { DataPages } from '../../../../ConfigData/DataPages';
import CommonLog from '../../../../components/CommonLog';


export default function MissionList() {
  const DataPage = DataPages.Mission;

  return (
    <CommonLog
      DataPage={DataPage}
      ResourcePage="Mission"
      onRowPress={(row) => router.push(`/Mission/${row[DataPage.keyId]}`)}
      onAddPress={() => router.push('/Mission/0')}
    />
  );
}
