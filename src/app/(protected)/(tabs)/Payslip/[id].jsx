import { useCallback, useState } from 'react';
import { View, ScrollView, ActivityIndicator, RefreshControl, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useFocusEffect } from 'expo-router';
import { useDesignSystem } from '../../../../hooks/useDesignSystem';
import useGetById from '../../../../hooks/useGetById';
import { useHeaderOptionsAddEdit } from '../../../../hooks/useHeaderOptionsAddEdit';
import useFormMode from '../../../../hooks/useFormMode';
import { useRefreshControlProps } from '../../../../hooks/useRefreshControlProps';
import { IconAllowances, IconBasicSalary, IconDeductions, IconNetSalary } from '../../../../assets/IconsSvg';
import AutoFontText from '../../../../components/AutoFontText';
import formatMoney from '../../../../utils/formatMoney';
import TranslationText from '../../../../components/TranslationText';
import Accordion from '../../../../components/Accordion';
import { useUserData } from '../../../../hooks/useUserData';
import useGetData from '../../../../hooks/useGetData';

const ResourcePage = 'Payslip';
const ApiPage = 'PayrollEmployee';

function MoneyDisplay({ value, color = 'title', size = 'md', currency, rowMoneyStyle, stylesText }) {
  return (
    <View style={rowMoneyStyle}>
      <Text style={stylesText({ color, size, weight: 'bold' })}>
        {formatMoney(value || "0")}
      </Text>
      <AutoFontText
        value={currency}
        color={color}
        size="xs"
        weight="bold"
        numberOfLines={1}
      />
    </View>
  );
}

function MoneyListItem({ item, index, length, data, rowMoneyStyle, stylesText, colors, spacing, rowDirection }) {
  return (
    <View
      key={index}
      style={{
        flexDirection: rowDirection,
        justifyContent: "space-between",
        gap: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: index < length - 1 ? 1 : 0,
        borderBottomColor: colors.border,
      }}
    >
      <AutoFontText
        value={item?.childRecName}
        color="text"
        size="sm"
        weight="medium"
      />
      <MoneyDisplay
        value={item?.amount}
        color="title"
        size="md"
        currency={data?.currencysymbol}
        rowMoneyStyle={rowMoneyStyle}
        stylesText={stylesText}
      />
    </View>
  );
}

function AccordionMoneyTitle({ icon: Icon, titleKey, value, color, sign, data, rowMoneyStyle, stylesText, colors, spacing, iconSize, rowDirection }) {
  return (
    <View style={{ flexDirection: rowDirection, justifyContent: "space-between", alignItems: 'center', gap: spacing.md }}>
      <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.sm }}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Icon color={colors[color]} size={iconSize.md} />
        </View>
        <TranslationText
          title={titleKey}
          page={"GeneralField"}
          style={stylesText({ color: 'text', size: 'md', weight: 'medium' })}
        />
      </View>
      <View style={rowMoneyStyle}>
        <Text style={stylesText({ color, size: 'base', weight: 'bold' })}>
          {sign}{formatMoney(value || "0")}
        </Text>
        <AutoFontText
          value={data?.currencysymbol}
          color={color}
          size="sm"
          weight="bold"
          numberOfLines={1}
        />
      </View>
    </View>
  );
}

export default function PayslipAddEdit() {
  const { id } = useFormMode();
  const { employeeId, EmployeeName } = useUserData();

  const { colors, spacing, globalStyles, iconSize, currentShadow, radius, stylesText, rowDirection } = useDesignSystem();
  const refreshControlProps = useRefreshControlProps();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({ status: 1 });
  const [dataAllowances, setDataAllowances] = useState([]);
  const [dataAllDeductions, setDataAllDeductions] = useState([]);
  const fetchData = useGetById(ApiPage, id, setIsLoading, setData, null, ResourcePage);
  const fetchDataAllowances = useGetData(
    `PayrollEmployeeSalaryItems/GetSalaryItemsByType?payrollEmployeeId=${id}&salaryItemType=1&pageNumber=1&pageSize=50`,
    setIsLoading,
    setDataAllowances,
    null,
  );
  const fetchDataAllDeductions = useGetData(
    `PayrollEmployeeSalaryItems/GetSalaryItemsByType?payrollEmployeeId=${id}&salaryItemType=2&pageNumber=1&pageSize=50`,
    setIsLoading,
    setDataAllDeductions,
    null,
  );
  useFocusEffect(
    useCallback(() => {
      if (id > 0) fetchData();
      else setIsLoading(false);
    }, [id])
  );
  useFocusEffect(
    useCallback(() => {
      if (id > 0) {
        fetchDataAllowances()
        fetchDataAllDeductions()
      }
      else setIsLoading(false);
    }, [id])
  );
  const headerOptions = useHeaderOptionsAddEdit({ ResourcePage, data, showStatus: false, keySubTilte: "monthYear" })
  const rowMoneyStyle = { flexDirection: rowDirection, gap: spacing.xs, alignItems: "flex-end" };


  if (isLoading) {
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={headerOptions} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView
          style={{ flex: 1, paddingHorizontal: spacing.base }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: spacing.lg }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchData} {...refreshControlProps} />}
        >
          <View style={{ gap: spacing.sm }}>
            <LinearGradient
              colors={[colors.primary, colors.primaryAccent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: radius.xxl,
                padding: spacing.xl,
                marginBottom: spacing.base,
                justifyContent: 'space-between',
                overflow: 'hidden',
                ...currentShadow,
              }}
            >
              <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.sm, marginBottom: spacing.base }}>
                <View style={{

                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <IconNetSalary color="#F0F4FF" size={iconSize.md} />
                </View>
                <TranslationText
                  title={"netSalary"}
                  page={"GeneralField"}
                  style={stylesText({ color: '#F0F4FF', size: 'sm', weight: 'medium' })}
                />
              </View>
              <View style={rowMoneyStyle}>
                <AutoFontText
                  value={formatMoney(data?.netSalary) || "0"}
                  color="#F0F4FF"
                  size="xxxl"
                  weight="bold"
                  numberOfLines={1}
                />
                <AutoFontText
                  value={data?.currencysymbol}
                  color="#F0F4FF"
                  size="md"
                  weight="bold"
                  numberOfLines={1}
                />
              </View>

            </LinearGradient>
            <View style={[globalStyles.card, { flexDirection: rowDirection, justifyContent: "space-between" }]}>


              <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.sm }}>
                <IconBasicSalary color={colors.title} size={iconSize.md} />
                <TranslationText
                  title={"basicSalary"}
                  page={"GeneralField"}
                  style={stylesText({ color: 'text', size: 'md', weight: 'medium' })}
                  numberOfLines={1}
                />
              </View>
              <MoneyDisplay
                value={data?.basicSalaryItemAmount}
                color="title"
                size="base"
                currency={data?.currencysymbol}
                rowMoneyStyle={rowMoneyStyle}
                stylesText={stylesText}
              />


            </View>
            <Accordion defaultExpanded={true} title={
              <AccordionMoneyTitle
                icon={IconAllowances}
                titleKey="totalAllowances"
                value={data?.totalAllowances}
                color="success"
                sign="+"
                data={data}
                rowMoneyStyle={rowMoneyStyle}
                stylesText={stylesText}
                colors={colors}
                spacing={spacing}
                iconSize={iconSize}
                rowDirection={rowDirection}
              />
            } >
              {dataAllowances?.length > 0 && dataAllowances?.map((item, index) => (
                <MoneyListItem
                  key={index}
                  item={item}
                  index={index}
                  length={dataAllowances.length}
                  data={data}
                  rowMoneyStyle={rowMoneyStyle}
                  stylesText={stylesText}
                  colors={colors}
                  spacing={spacing}
                  rowDirection={rowDirection}
                />
              ))}

            </Accordion>
            <Accordion defaultExpanded={true} title={
              <AccordionMoneyTitle
                icon={IconDeductions}
                titleKey="totalDeductions"
                value={data?.totalDeductions}
                color="error"
                sign="-"
                data={data}
                rowMoneyStyle={rowMoneyStyle}
                stylesText={stylesText}
                colors={colors}
                spacing={spacing}
                iconSize={iconSize}
                rowDirection={rowDirection}
              />
            } >
              {dataAllDeductions?.length > 0 && dataAllDeductions?.map((item, index) => (
                <MoneyListItem
                  key={index}
                  item={item}
                  index={index}
                  length={dataAllDeductions.length}
                  data={data}
                  rowMoneyStyle={rowMoneyStyle}
                  stylesText={stylesText}
                  colors={colors}
                  spacing={spacing}
                  rowDirection={rowDirection}
                />
              ))}

            </Accordion>
          </View>

        </ScrollView>


      </View>
    </>
  );
}
