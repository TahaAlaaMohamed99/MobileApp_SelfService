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
import useGetGenerallist from '../../../../hooks/useGetGenerallist';
import useHandleSubmit from '../../../../hooks/useHandleSubmit';
import useGetSelected from '../../../../hooks/useGetSelected';
import useMultiFormikSubmit from '../../../../hooks/useMultiFormikSubmit';
import useTransactionInitialValues from '../../../../hooks/useTransactionInitialValues';
import useGetWorkFlowTransactionLog from '../../../../hooks/useGetWorkFlowTransactionLog';
import { formatDateOnlyForAPI, getCurrentDate, parseAPIDate } from '../../../../hooks/useFormatDate';
import { attendanceExceptionSchema } from '../../../../utils/validationSchema';
import SectionContainer from '../../../../components/SectionContainer';
import Stepper, { Step } from '../../../../components/Stepper';
import CustomSelect from '../../../../components/Form/CustomSelect';
import CustomDatePicker from '../../../../components/Form/CustomDatePicker';
import TransactionSection from '../../../../components/TransactionSection';
import AuditTransaction from '../../../../components/AuditTransaction';
import WorkFlowTransactionLog from '../../../../components/WorkFlowTransactionLog';
import FooterActions from '../../../../components/FooterActions';
import { IconDocument, IconAttachments } from '../../../../assets/IconsSvg';

const ResourcePage = 'AttendanceException';
const ApiPage = 'AttendanceException';

export default function AttendanceExceptionForm() {
  const { id } = useFormMode();
  const { employeeId } = useUserData();
  const { colors, spacing, globalStyles } = useDesignSystem();
  const refreshControlProps = useRefreshControlProps();

  const formikRef = useRef();
  const formikRefTransaction = useRef();
  const { execute } = useMultiFormikSubmit([formikRef, formikRefTransaction]);
  const { getLookup } = useGetLookup();
  const { getGenerallist } = useGetGenerallist();
  const { handleSubmitFormik, handleUpdateAndSubmitTransaction } = useHandleSubmit();

  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoadingSubmitTransaction, setIsLoadingSubmitTransaction] = useState(false);
  const [data, setData] = useState({ status: 1 });
  const [attendanceExceptionTimingList, setAttendanceExceptionTiming] = useState([]);
  const [attendanceExceptionList, setAttendanceExceptionList] = useState([]);
  const [workFlowTransaction, setWorkFlowTransaction] = useState(null);

  const fetchData = useGetById(ApiPage, id, setIsLoading, setData, null, ResourcePage);
  useFocusEffect(
    useCallback(() => {
      if (id > 0) fetchData();
      else setIsLoading(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useFocusEffect(
    useCallback(() => {
      getGenerallist('AttendanceExceptionTiming', setIsLoading, setAttendanceExceptionTiming);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])
  );

  useFocusEffect(
    useCallback(() => {
      if (data.status == 1) {
        getLookup('AttendanceExceptionSetup', 'name', null, 'recId', setIsLoading, setAttendanceExceptionList);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.status])
  );

  const selectedAttendanceExceptionTiming = useGetSelected(attendanceExceptionTimingList, data?.timing ||0);
  const selectedAttendanceException = useGetSelected(
    attendanceExceptionList,
    data?.attendanceExceptionSetupRecId,
    data?.attendanceExceptionSetupName
  );

  const initialValuesTransaction = useTransactionInitialValues(data);
  const initialValuesStepOne = useMemo(
    () => ({
      fromDate: data?.fromDate ? parseAPIDate(data.fromDate) : getCurrentDate(),
      toDate: data?.toDate ? parseAPIDate(data.toDate) : getCurrentDate(),
      timing: selectedAttendanceExceptionTiming,
      attendanceExceptionSetup: selectedAttendanceException,
    }),
    [data, selectedAttendanceExceptionTiming, selectedAttendanceException]
  );

  const isDisabled = data.status !== 1;

  const headerOptions = useHeaderOptionsAddEdit({ ResourcePage, data });

  const sendData = (values) => ({
    employeeRecId: employeeId,
    name: values.name,
    fromDate: formatDateOnlyForAPI(values.fromDate),
    toDate: formatDateOnlyForAPI(values.toDate),
    timing: values?.timing?.value,
    attendanceExceptionSetupRecId: values?.attendanceExceptionSetup?.value,
    transDate: formatDateOnlyForAPI(values.transDate),
    executionDate: formatDateOnlyForAPI(values.executionDate),
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
                validationSchema={attendanceExceptionSchema}
                initialValues={initialValuesStepOne}
                enableReinitialize={true}
              >
                {({ setFieldValue, values, errors, touched, setFieldTouched }) => (
                  <SectionContainer ResourcePage={ResourcePage} title="transactionInformation">
                    <CustomSelect
                      label="title"
                      titleGenerallist
                      Required
                      options={attendanceExceptionTimingList}
                      ResourcePage="AttendanceExceptionTiming"
                      isDisabled={isDisabled}
                      value={values.timing}
                      isClearable={false}
                      placeholder="pleaseSelect"
                      errors={errors.timing}
                      touched={touched.timing}
                      onBlur={() => setFieldTouched('timing', true)}
                      onChange={(option) => setFieldValue('timing', option)}
                    />

                    <CustomSelect
                      label="title"
                      Required
                      options={attendanceExceptionList}
                      ResourcePage="AttendanceExceptionSetup"
                      isDisabled={isDisabled}
                      value={values.attendanceExceptionSetup}
                      isClearable={false}
                      placeholder="pleaseSelect"
                      errors={errors.attendanceExceptionSetup}
                      touched={touched.attendanceExceptionSetup}
                      onBlur={() => setFieldTouched('attendanceExceptionSetup', true)}
                      onChange={(option) => setFieldValue('attendanceExceptionSetup', option)}
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
                          setFieldValue('executionDate', date);
                          if (date > values.toDate) setFieldValue('toDate', date);
                          formikRefTransaction.current?.setFieldValue('executionDate', date);
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
                        onChange={(date) => setFieldValue('toDate', date)}
                        style={{ flex: 1 }}
                      />
                    </View>
                  </SectionContainer>
                )}
              </Formik>
              <TransactionSection
                formikRef={formikRefTransaction}
                initialValues={initialValuesTransaction}
                isFromDate
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
