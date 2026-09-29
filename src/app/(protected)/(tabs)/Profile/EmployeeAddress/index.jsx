import { router } from 'expo-router';
import CommonLog from '../../../../../components/CommonLog';
import { DataPages } from '../../../../../ConfigData/DataPages';

export default function EmployeeAddressList() {
  const DataPage = DataPages.EmployeeAddress;
  return (
    <CommonLog
      DataPage={DataPage}
      ResourcePage="EmployeeAddress"
 
    />
  );
}
