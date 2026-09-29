import { router } from 'expo-router';
import CommonLog from '../../../../components/CommonLog';
import { DataPages } from '../../../../ConfigData/DataPages';



export default function VacationTransactionList() {
  const DataPage = DataPages.VacationTransaction;
  return (
    <CommonLog
      DataPage={DataPage}
      ResourcePage="VacationTransaction"
      onRowPress={(row) => router.push(`/VacationTransaction/${row[DataPage.keyId]}`)}
      onAddPress={() => router.push('/VacationTransaction/0')}
    />
  );
}
