import { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import MegaGrid from '../../../../components/MegaGrid';
import { DataPages } from '../../../../ConfigData/DataPages';
import { useUserData } from '../../../../hooks/useUserData';
import { useDesignSystem } from '../../../../hooks/useDesignSystem';
import useGridData from '../../../../hooks/useGridData';

export default function PayslipList() {
  const DataPage = DataPages.Payslip;
  const { employeeId } = useUserData();
  const { globalStyles, spacing } = useDesignSystem();

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { fetchGridData } = useGridData(
    `${DataPage.Api}=${employeeId}`,
    DataPage?.gridList,
    setData,
    setIsLoading,
  );

  useFocusEffect(
    useCallback(() => {
      if (employeeId > 0) {
        fetchGridData();
      }
     }, [employeeId]),
  );
   
   return (
    <View style={[globalStyles.container, styles.root, { paddingTop: spacing.md }]}>
      <MegaGrid
        GridKey="Payslip"
        columns={DataPage.columns}
        data={data}
        ResourcePage="Payslip"
        keyId={DataPage.keyId}
        isSearch
        onClickRow={(row) => {router.push(`/Payslip/${row?.payrollEmployeeId}`)}}
        refreshing={isLoading}
        loading={isLoading}
        onRefresh={fetchGridData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
