import { useCallback, useMemo, useRef, useState } from 'react';
import { View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { router, Stack, useFocusEffect } from 'expo-router';
import { Formik } from 'formik';
import dayjs from 'dayjs';
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
import { formatDateForAPI, formatDateOnlyForAPI, getCurrentDate, parseAPIDate } from '../../../../hooks/useFormatDate';
import { partialDayLeaveTransactionDataSchema } from '../../../../utils/validationSchema';
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

const ResourcePage = 'PartialDayLeave';
const ApiPage = 'PartialDayLeave';

export default function PartialDayLeaveForm() {
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
  const [isLoadingDate, setIsLoadingDate] = useState(false);
  const [data, setData] = useState({ status: 1 });
  const [attendanceSetupList, setAttendanceSetupList] = useState([]);
  const [reasonList, setReasonList] = useState([]);
  const [permissionPerMonth, setPermissionPerMonth] = useState({});
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

  useFocusEffect(
    useCallback(() => {
      getLookup(
        'AttendanceSetup/GetCustomLookupAsync?type=8',
        'name',
        null,
        'recId',
        setIsLoading,
        setAttendanceSetupList,
        ['isFixedHours', 'hours'],
        null,
        true
      );
    }, [id])
  );

  useFocusEffect(
    useCallback(() => {
      if (data.status == 1) {
        getLookup('Reason', 'name', null, 'recId', setIsLoading, setReasonList);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.status])
  );

  const getPeriodandCountPermission = async (attendanceRecId, fromDate) => {
    if (!(employeeId && attendanceRecId && fromDate)) return;
    await callApi({
      method: 'get',
      url: `${ApiPage}/GetPartialDayLeaveEmployeeState?employeeRecId=${employeeId}&attendanceSetupRecId=${attendanceRecId}&fromDate=${fromDate}`,
      setIsLoading: setIsLoadingDate,
      onSuccess: setPermissionPerMonth,
    });
  };

  useFocusEffect(
    useCallback(() => {
      if (data.attendanceSetupRecId && employeeId) {
        getPeriodandCountPermission(data.attendanceSetupRecId, formatDateForAPI(data.dateTimeFrom));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, employeeId])
  );

  const selectedAttendanceSetup = useGetSelected(attendanceSetupList, data?.attendanceSetupRecId);
  const selectedReason = useGetSelected(reasonList, data?.reasonRecId, data?.reasonName);
  const initialValuesTransaction = useTransactionInitialValues(data, 'transactionDate');

  const initialValuesStepOne = useMemo(
    () => ({
      DateTimeFrom: data?.dateTimeFrom ? parseAPIDate(data.dateTimeFrom) : getCurrentDate(),
      DateTimeTo: data?.dateTimeTo ? parseAPIDate(data.dateTimeTo) : dayjs(getCurrentDate()).add(1, 'hour').toDate(),
      attendanceSetup: selectedAttendanceSetup,
      reason: selectedReason,
    }),
    [data, selectedAttendanceSetup, selectedReason]
  );

  const isDisabled = data.status !== 1;

  const headerOptions = useHeaderOptionsAddEdit({ ResourcePage, data });

  const sendData = (values) => ({
    employeeRecId: employeeId,
    name: values.name,
    attendanceSetupRecId: values?.attendanceSetup?.value,
    reasonRecId: values?.reason?.value,
    dateTimeFrom: formatDateForAPI(values.DateTimeFrom),
    dateTimeTo: formatDateForAPI(values.DateTimeTo),
    transactionDate: formatDateOnlyForAPI(values.transactionDate),
    executionDate: formatDateOnlyForAPI(values.DateTimeFrom),
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
                validationSchema={partialDayLeaveTransactionDataSchema}
                initialValues={initialValuesStepOne}
                enableReinitialize={true}
              >
                {({ setFieldValue, values, errors, touched, setFieldTouched }) => (
                  <SectionContainer ResourcePage={ResourcePage} title="transactionInformation">
                    <CustomSelect
                      label="title"
                      options={attendanceSetupList}
                      Required
                      ResourcePage="AttendanceSetupPartialDayLeave"
                      isDisabled={isDisabled}
                      value={values.attendanceSetup}
                      errors={errors.attendanceSetup}
                      touched={touched.attendanceSetup}
                      isClearable
                      placeholder="pleaseSelect"
                      onBlur={() => setFieldTouched('attendanceSetup', true)}
                      onChange={(option) => {
                        setFieldValue('attendanceSetup', option);
                        if (option?.value != data?.attendanceSetupRecId) {
                          if (option?.isFixedHours == 2 && option?.hours) {
                            const toDate = dayjs(values.DateTimeFrom).add(Number(option.hours), 'hour').toDate();
                            setFieldValue('DateTimeTo', toDate);
                          }
                        }
                        getPeriodandCountPermission(option?.value, formatDateForAPI(values.DateTimeFrom));
                      }}
                    />

                    <CustomSelect
                      label="title"
                      options={reasonList}
                      ResourcePage="Reason"
                      isDisabled={isDisabled}
                      value={values.reason}
                      isClearable
                      placeholder="pleaseSelect"
                      onBlur={() => setFieldTouched('reason', true)}
                      onChange={(option) => setFieldValue('reason', option)}
                    />

                    <CustomDatePicker
                      label="dateTimeFrom"
                      ResourcePage="GeneralField"
                      Required
                      viewTime
                      disabled={isDisabled || values.attendanceSetup == null}
                      value={values.DateTimeFrom}
                      errors={errors.DateTimeFrom}
                      touched={touched.DateTimeFrom}
                      onChange={(date) => {
                        setFieldValue('DateTimeFrom', date);
                        formikRefTransaction.current?.setFieldValue('executionDate', date);
                        if (values.attendanceSetup?.isFixedHours == 2 && values.attendanceSetup?.hours) {
                          const toDate = dayjs(date).add(Number(values.attendanceSetup.hours), 'hour').toDate();
                          setFieldValue('DateTimeTo', toDate);
                        } else {
                          setFieldValue('DateTimeTo', date);
                        }
                        getPeriodandCountPermission(values.attendanceSetup?.value, formatDateForAPI(date));
                      }}
                    />

                    <CustomDatePicker
                      label="dateTimeTo"
                      ResourcePage="GeneralField"
                      Required
                      viewTime
                      isLoading={isLoadingDate}
                      minDate={values.DateTimeFrom}
                      disabled={isDisabled || values.attendanceSetup == null || values?.attendanceSetup?.isFixedHours == 2}
                      value={values.DateTimeTo}
                      errors={errors.DateTimeTo}
                      touched={touched.DateTimeTo}
                      onChange={(date) => setFieldValue('DateTimeTo', date)}
                    />

                    <CardCounter
                      ResourcePage={ResourcePage}
                      title="totalCountPerMonth"
                      counter={permissionPerMonth?.count || 0}
                      style={{ width: '100%' }}
                    />
                    <CardCounter
                      ResourcePage={ResourcePage}
                      title="totalPeriodPerMonth"
                      counter={permissionPerMonth?.hours || '00:00'}
                      style={{ width: '100%' }}
                    />
                  </SectionContainer>
                )}
              </Formik>

              <TransactionSection
                formikRef={formikRefTransaction}
                initialValues={initialValuesTransaction}
                isFromDate
                transactionDatekey={"transactionDate"}
                executionDateValue={formikRef.current?.values?.DateTimeFrom}
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
