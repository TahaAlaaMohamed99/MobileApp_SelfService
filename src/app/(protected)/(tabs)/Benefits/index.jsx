import { router } from 'expo-router';
import { DataPages } from '../../../../ConfigData/DataPages';
import CommonLog from '../../../../components/CommonLog';

export default function BenefitsList() {
  const DataPage = DataPages.BenefitEnrollmentRequest;

  return (
    <CommonLog
      DataPage={DataPage}
      ResourcePage="Benefits"
      onRowPress={(row) => router.push(`/Benefits/${row[DataPage.keyId]}`)}
      onAddPress={() => router.push('/Benefits/0')}
    />
  );
}
