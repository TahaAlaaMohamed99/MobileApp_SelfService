import { router } from 'expo-router';
import CommonLog from '../../../../../components/CommonLog';
import { DataPages } from '../../../../../ConfigData/DataPages';

export default function EmployeeBankList() {
  const DataPage = DataPages.EmployeeBank;
   return (
    <CommonLog
      DataPage={DataPage}
      ResourcePage="EmployeeBank"
 
    />
  );
}
