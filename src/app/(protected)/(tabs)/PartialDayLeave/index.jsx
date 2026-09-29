import { router } from 'expo-router';
import { DataPages } from '../../../../ConfigData/DataPages';
import CommonLog from '../../../../components/CommonLog';

export default function PartialDayLeaveList() {
  const DataPage = DataPages.PartialDayLeave;

  return (
    <CommonLog
      DataPage={DataPage}
      ResourcePage="PartialDayLeave"
      onRowPress={(row) => router.push(`/PartialDayLeave/${row[DataPage.keyId]}`)}
      onAddPress={() => router.push('/PartialDayLeave/0')}
    />
  );
}
