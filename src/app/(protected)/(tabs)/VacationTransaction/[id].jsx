import { useCallback, useMemo, useRef, useState } from 'react';
import { View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { router, Stack, useFocusEffect } from 'expo-router';
import { Formik } from 'formik';
import useFormMode from '../../../../hooks/useFormMode';
import { useUserData } from '../../../../hooks/useUserData';
import { useDesignSystem } from '../../../../hooks/useDesignSystem';
import { useHeaderOptionsAddEdit } from '../../../../hooks/useHeaderOptionsAddEdit';
import { useRefreshControlProps } from '../../../../hooks/useRefreshControlProps';
import useGetById from '../../../../hooks/useGetById';
import useGetLookup from '../../../../hooks/useGetLookup';
import useApiAction from '../../../../hooks/useApiAction';
import useHandleSubmit from '../../../../hooks/useHandleSubmit';
import useGetSelected from '../../../../hooks/useGetSelected';
import useMultiFormikSubmit from '../../../../hooks/useMultiFormikSubmit';
import useTransactionInitialValues from '../../../../hooks/useTransactionInitialValues';
import useGetWorkFlowTransactionLog from '../../../../hooks/useGetWorkFlowTransactionLog';
import { formatDateOnlyForAPI, getCurrentDate, parseAPIDate } from '../../../../hooks/useFormatDate';
import { vacationTransactionDataSchema } from '../../../../utils/validationSchema';
import SectionContainer from '../../../../components/SectionContainer';
import Stepper, { Step } from '../../../../components/Stepper';
import CustomSelect from '../../../../components/Form/CustomSelect';
import CustomDatePicker from '../../../../components/Form/CustomDatePicker';
import CardCounter from '../../../../components/CardCounter';
import TransactionSection from '../../../../components/TransactionSection';
import AuditTransaction from '../../../../components/AuditTransaction';
import WorkFlowTransactionLog from '../../../../components/WorkFlowTransactionLog';
import FooterActions from '../../../../components/FooterActions';
import { IconDocument, IconAttachments } from '../../../../assets/IconsSvg';
import HeaderLeft from '../../../../components/HeaderLeft';

const ResourcePage = 'VacationTransaction';
const ApiPage = 'VacationTransaction';

export default function VacationTransactionForm() {
  const { id } = useFormMode();
  const { employeeId } = useUserData();
  const { colors, spacing, globalStyles } = useDesignSystem();
  const refreshControlProps = useRefreshControlProps();

  const formikRef = useRef();
  const formikRefTransaction = useRef();
  const { execute } = useMultiFormikSubmit([formikRef, formikRefTransaction]);
  const { getLookup } = useGetLookup();
  const { callApi } = useApiAction();
  const { handleSubmitFormik, handleUpdateAndSubmitTransaction } = useHandleSubmit();

  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoadingSubmitTransaction, setIsLoadingSubmitTransaction] = useState(false);
  const [data, setData] = useState({ status: 1 });
  const [vacationCategoryList, setVacationCategoryList] = useState(null);
  const [vacationLoading, setVacationLoading] = useState(false);
  const [vacationBalance, setVacationBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [workFlowTransaction, setWorkFlowTransaction] = useState(null);

  const fetchData = useGetById(ApiPage, id, setIsLoading, setData, null, ResourcePage);
  useFocusEffect(
    useCallback(() => {
      if (id > 0) fetchData();
      else setIsLoading(false);
    }, [id])
  );

  const fetchWorkFlowTransaction = useGetWorkFlowTransactionLog(
    id,
    ResourcePage,
    setIsLoading,
    setWorkFlowTransaction,
    data?.isSendNotification,
    data?.code
  );
  useFocusEffect(
    useCallback(() => {
      if (data.status && data.status != 1) {
        fetchWorkFlowTransaction();
      } else {
        setWorkFlowTransaction([]);
      }
    }, [data])
  );

  const getVacationCategory = () => {
    if (!employeeId) return;
    getLookup(
      `VacationCategory/GetVacationCategoriesByEmployeeAsync/${employeeId}`,
      'name',
      null,
      'recId',
      setVacationLoading,
      setVacationCategoryList,
      null,
      null,
      true,
      true
    );
  };

  const getVacationBalance = ({ vacationCategoryRecId, fromDate, toDate }) => {
    if (!(employeeId && vacationCategoryRecId && fromDate && toDate)) return;
    callApi({
      method: 'post',
      url: `${ApiPage}/CalculateVacationDetails`,
      payload: {
        employeeRecId: employeeId,
        vacationCategoryRecId,
        FromDate: formatDateOnlyForAPI(fromDate),
        ToDate: formatDateOnlyForAPI(toDate),
      },
      setIsLoading: setIsLoadingBalance,
      onSuccess: setVacationBalance,
    });
  };

  useFocusEffect(
    useCallback(() => {
      if (!employeeId) return;
      getVacationCategory();
      if (data.status === 1 && data.vacationCategoryRecId && data.fromDate && data.toDate) {
        getVacationBalance({
          vacationCategoryRecId: data.vacationCategoryRecId,
          fromDate: data.fromDate,
          toDate: data.toDate,
        });
      }
    }, [employeeId, data.vacationCategoryRecId, data.fromDate, data.toDate])
  );

  const selectedVacationCategory = useGetSelected(vacationCategoryList, data?.vacationCategoryRecId);

  const initialValuesTransaction = useTransactionInitialValues(data);
  const initialValuesStepOne = useMemo(
    () => ({
      fromDate: data?.fromDate ? parseAPIDate(data.fromDate) : getCurrentDate(),
      toDate: data?.toDate ? parseAPIDate(data.toDate) : getCurrentDate(),
      vacationCategory: selectedVacationCategory || null,
    }),
    [data, selectedVacationCategory]
  );

  const isDisabled = data.status !== 1;

  const headerOptions = useHeaderOptionsAddEdit({ ResourcePage, data });

  const sendData = (values) => ({
    employeeRecId: employeeId,
    name: values.name,
    vacationCategoryRecId: values?.vacationCategory?.value,
    fromDate: formatDateOnlyForAPI(values.fromDate),
    toDate: formatDateOnlyForAPI(values.toDate),
    transDate: formatDateOnlyForAPI(values.transDate),
    executionDate: formatDateOnlyForAPI(values.fromDate),
    code: values?.code,
  });

  const handleSubmit = () => {
    execute((values) => {
      handleSubmitFormik({
        apiPage: ApiPage,
        values: sendData(values),
        recId: id,
        setIsLoadingSubmit,
        setData,
        onSuccess: () => (id > 0 ? fetchData() : router.back()),
      });
    });
  };

  const handleSubmitUpadteTransaction = () => {
    if (activeStep !== 0) return;
    execute((values) => {
      handleUpdateAndSubmitTransaction({
        apiPage: ApiPage,
        values: sendData(values),
        recId: id,
        setIsLoadingSubmitTransaction,
        setData,
        onSuccess: () => (id > 0 ? fetchData() : router.back()),
      });
    });
  };

  const steps = [
    { step: 0, title: 'transactionData', icon: <IconDocument />, onClick: () => setActiveStep(0) },
    { step: 1, title: 'attachments', icon: <IconAttachments />, onClick: () => setActiveStep(1), disabled: true },
  ];

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
          refreshControl={<RefreshControl refreshing={false} onRefresh={fetchData} {...refreshControlProps} />}
        >
          <Stepper id={id} steps={steps} activeStep={activeStep} ResourcePage="General">
            <Step step={0}>
              <Formik
                innerRef={formikRef}
                validationSchema={vacationTransactionDataSchema}
                initialValues={initialValuesStepOne}
                enableReinitialize={true}
              >
                {({ setFieldValue, values, errors, touched, setFieldTouched }) => (
                  <SectionContainer ResourcePage={ResourcePage} title="transactionInformation">
                    <CustomSelect
                      label="title"
                      options={vacationCategoryList}
                      Required
                      ResourcePage="VacationCategory"
                      isLoading={isLoadingBalance || vacationLoading}
                      value={values.vacationCategory}
                      isDisabled={isDisabled}
                      isClearable={false}
                      placeholder="pleaseSelect"
                      errors={errors.vacationCategory}
                      touched={touched.vacationCategory}
                      onBlur={() => setFieldTouched('vacationCategory', true)}
                      onChange={(option) => {
                        setFieldValue('vacationCategory', option);
                        if (option?.value) {
                          getVacationBalance({
                            vacationCategoryRecId: option.value,
                            fromDate: values.fromDate,
                            toDate: values.toDate,
                          });
                        }
                      }}
                    />

                    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                      <CustomDatePicker
                        label="fromDate"
                        ResourcePage="GeneralField"
                        Required
                        disabled={isDisabled}
                        value={values.fromDate}
                        errors={errors.fromDate}
                        touched={touched.fromDate}
                        onChange={(date) => {
                          setFieldValue('fromDate', date);
                          formikRefTransaction.current?.setFieldValue('executionDate', date);
                          if (date > values.toDate) setFieldValue('toDate', date);
                          getVacationBalance({
                            vacationCategoryRecId: values?.vacationCategory?.value,
                            fromDate: date,
                            toDate: values.toDate,
                          });
                        }}
                        style={{ flex: 1 }}
                      />
                      <CustomDatePicker
                        label="toDate"
                        ResourcePage="GeneralField"
                        Required
                        disabled={isDisabled}
                        minDate={values.fromDate}
                        value={values.toDate}
                        errors={errors.toDate}
                        touched={touched.toDate}
                        onChange={(date) => {
                          setFieldValue('toDate', date);
                          getVacationBalance({
                            vacationCategoryRecId: values?.vacationCategory?.value,
                            fromDate: values.fromDate,
                            toDate: date,
                          });
                        }}
                        style={{ flex: 1 }}
                      />
                    </View>
                    {values?.vacationCategory?.vacationFrequency == 5 &&
                      values?.vacationCategory?.categoryType == 4 && (
                        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                          <CustomDatePicker
                            label="cycleStart"
                            ResourcePage="VacationTransaction"
                            disabled={true}
                            value={
                              vacationBalance?.data?.cycleStart ||
                              data?.cycleStart
                            }
                            style={{ flex: 1 }}

                          />
                          <CustomDatePicker
                            label="cycleEnd"
                            ResourcePage="VacationTransaction"
                            disabled={true}
                            style={{ flex: 1 }}
                            value={
                              vacationBalance?.data?.cycleEnd || data?.cycleEnd
                            }
                          />
                        </View>
                      )}
                    <View style={{ gap: spacing.sm }}>
                      <CardCounter
                        ResourcePage={ResourcePage}
                        title="balance"
                        type="number"
                        isDisabled={isDisabled}
                        counter={isDisabled ? data?.balance || 0 : vacationBalance?.balance || 0}
                      />

                      {values?.vacationCategory?.categoryType === 2 && (
                        <>
                          <CardCounter
                            ResourcePage={ResourcePage}
                            title="remainingOpeningBalance"
                            type="number"
                            isDisabled={isDisabled}
                            counter={isDisabled ? data?.remainingOpeningBalance || 0 : vacationBalance?.remainingOpeningBalance || 0}
                          />
                          <CardCounter
                            ResourcePage={ResourcePage}
                            title="openingBalance"
                            type="number"
                            isDisabled={isDisabled}
                            counter={isDisabled ? data?.balanceOpening || 0 : vacationBalance?.balanceOpening || 0}
                          />
                        </>
                      )}

                      <CardCounter
                        ResourcePage={ResourcePage}
                        title="Duration"
                        type="number"
                        isDisabled={isDisabled}
                        counter={isDisabled ? data?.duration || 0 : vacationBalance?.duration || 0}
                      />
                      <CardCounter
                        ResourcePage={ResourcePage}
                        title="remainder"
                        type="number"
                        isDisabled={isDisabled}
                        counter={isDisabled ? data?.remainder || 0 : vacationBalance?.remaining || 0}
                      />

                      {values?.vacationCategory?.hasBalanceTimes === 2 && (
                        <CardCounter
                          ResourcePage={ResourcePage}
                          title="timesBalance"
                          type="number"
                          isDisabled={isDisabled}
                          counter={isDisabled ? data?.timesBalance || 0 : vacationBalance?.timesBalance || 0}
                        />
                      )}
                    </View>
                  </SectionContainer>
                )}
              </Formik>
              <TransactionSection
                formikRef={formikRefTransaction}
                initialValues={initialValuesTransaction}
                isFromDate
                executionDateValue={formikRef.current?.values?.fromDate}
                ResourcePage={ResourcePage}
                isDisabled={isDisabled}
                data={data}
                id={id}
              />
              <WorkFlowTransactionLog
                id={id}
                ResourcePage={ResourcePage}
                setIsLoading={setIsLoading}
                isLoading={isLoading}
                workFlowTransaction={workFlowTransaction}
              />
              <AuditTransaction data={data} id={id} />


            </Step>
          </Stepper>
        </ScrollView>

        <FooterActions
          id={id}
          statusId={data.status}
          apiPage={ApiPage}
          data={data}
          setData={setData}
          fetchData={fetchData}
          viewOnly={isDisabled}
          onSave={handleSubmit}
          isLoadingSave={isLoadingSubmit}
          formikRefs={[formikRef, formikRefTransaction]}
          onSubmitEdited={handleSubmitUpadteTransaction}
          isLoadingSubmitEdited={isLoadingSubmitTransaction}
        />
      </View>
    </>
  );
}
