import { router } from 'expo-router';
import { DataPagesLine } from '../../ConfigData/DataPages';
import CommonLogLine from '../CommonLogLine';

export default function InstallmentsLIne({ employeeId, data }) {
    const DataPage = DataPagesLine.BenefitEnrollmentRequestEmployeePayment;

    return (
        <CommonLogLine
            ApiGetAllLines={`BenefitEnrollmentRequestEmployeePayment/GetEmployeePayments?employeeId=${employeeId}&enrollmentRequestEmployeeRecId=${data?.benefitEnrollmentRequestEmployeeRecId}`}
            DataPage={DataPage}
            ResourcePage="BenefitEnrollmentRequestEmployeePayment"
          
        />
    );
}
