import { router } from 'expo-router';
import CommonLog from '../../../../components/CommonLog';
import { DataPages } from '../../../../ConfigData/DataPages';

export default function AttendanceExceptionList() {
  const DataPage = DataPages.AttendanceException;
  return (
    <CommonLog
      DataPage={DataPage}
      ResourcePage="AttendanceException"
      onRowPress={(row) => router.push(`/AttendanceException/${row[DataPage.keyId]}`)}
      onAddPress={() => router.push('/AttendanceException/0')}
    />
  );
}
