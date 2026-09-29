import { router } from 'expo-router';
import { DataPages } from '../../../../ConfigData/DataPages';
import CommonLog from '../../../../components/CommonLog';

export default function MissedAttendanceRequestList() {
  const DataPage = DataPages.MissedAttendanceRequest;

  return (
    <CommonLog
      DataPage={DataPage}
      ResourcePage="MissedAttendanceRequest"
      onRowPress={(row) => router.push(`/MissedAttendanceRequest/${row[DataPage.keyId]}`)}
      onAddPress={() => router.push('/MissedAttendanceRequest/0')}
    />
  );
}
