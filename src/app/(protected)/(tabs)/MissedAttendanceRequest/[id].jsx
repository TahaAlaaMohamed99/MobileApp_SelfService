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
import useGetGenerallist from '../../../../hooks/useGetGenerallist';
import useHandleSubmit from '../../../../hooks/useHandleSubmit';
import useGetSelected from '../../../../hooks/useGetSelected';
import useMultiFormikSubmit from '../../../../hooks/useMultiFormikSubmit';
import useTransactionInitialValues from '../../../../hooks/useTransactionInitialValues';
import useGetWorkFlowTransactionLog from '../../../../hooks/useGetWorkFlowTransactionLog';
import { formatDateOnlyForAPI, getCurrentDate, parseAPIDate } from '../../../../hooks/useFormatDate';
import { missedAttendanceRequestDataSchema } from '../../../../utils/validationSchema';
import SectionContainer from '../../../../components/SectionContainer';
import Stepper, { Step } from '../../../../components/Stepper';
import CustomSelect from '../../../../components/Form/CustomSelect';
import CustomDatePicker from '../../../../components/Form/CustomDatePicker';
import CustomTimePicker from '../../../../components/Form/CustomTimePicker';
import TransactionSection from '../../../../components/TransactionSection';
import AuditTransaction from '../../../../components/AuditTransaction';
import WorkFlowTransactionLog from '../../../../components/WorkFlowTransactionLog';
import FooterActions from '../../../../components/FooterActions';
import { IconDocument, IconAttachments } from '../../../../assets/IconsSvg';

const ResourcePage = 'MissedAttendanceRequest';
const ApiPage = 'MissedAttendanceRequest';

export default function MissedAttendanceRequestForm() {
  const { id } = useFormMode();
  const { employeeId } = useUserData();
  const { colors, spacing, globalStyles } = useDesignSystem();
  const refreshControlProps = useRefreshControlProps();

  const formikRef = useRef();
  const formikRefTransaction = useRef();
  const { execute } = useMultiFormikSubmit([formikRef, formikRefTransaction]);
  const { getGenerallist } = useGetGenerallist();
  const { handleSubmitFormik, handleUpdateAndSubmitTransaction } = useHandleSubmit();

  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoadingSubmitTransaction, setIsLoadingSubmitTransaction] = useState(false);
  const [data, setData] = useState({ status: 1 });
  const [forgetFingerList, setForgetFingerList] = useState([]);
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
      if (data.status && data.status !== 1) {
        fetchWorkFlowTransaction();
      } else {
        setWorkFlowTransaction([]);
      }
    }, [data])
  );

  useFocusEffect(
    useCallback(() => {
      getGenerallist('ForgetFinger', setIsLoading, setForgetFingerList);
    }, [id])
  );

  const selectedForgetFinger = useGetSelected(forgetFingerList, data?.forgetFinger || 1);

  const initialValuesTransaction = useTransactionInitialValues(data);
  const initialValuesStepOne = useMemo(
    () => ({
      attendanceDateIn: data?.attendanceDateIn ? parseAPIDate(data.attendanceDateIn) : getCurrentDate(),
      attendanceDateOut: data?.attendanceDateOut ? parseAPIDate(data.attendanceDateOut) : getCurrentDate(),
      timeIn: data?.timeIn ?? '09:00:00',
      timeOut: data?.timeOut ?? '17:00:00',
      forgetFinger: selectedForgetFinger,
    }),
    [data, selectedForgetFinger]
  );

  const isDisabled = data.status !== 1;

  const headerOptions = useHeaderOptionsAddEdit({ ResourcePage, data });

  const sendData = (values) => ({
    employeeRecId: employeeId,
    name: values.name || '',
    transDate: formatDateOnlyForAPI(values.transDate),
    executionDate: formatDateOnlyForAPI(values.executionDate || values.attendanceDateIn || values.attendanceDateOut),
    code: values?.code,
    attendanceDateIn: formatDateOnlyForAPI(values.attendanceDateIn),
    attendanceDateOut: formatDateOnlyForAPI(values.attendanceDateOut),
    forgetFinger: values?.forgetFinger?.value,
    timeIn: values?.timeIn,
    timeOut: values?.timeOut,
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
                validationSchema={missedAttendanceRequestDataSchema}
                initialValues={initialValuesStepOne}
                enableReinitialize={true}
              >
                {({ setFieldValue, values, errors, touched, setFieldTouched }) => (
                  <SectionContainer ResourcePage={ResourcePage} title="transactionInformation">
                    <CustomSelect
                      label="title"
                      titleGenerallist
                      options={forgetFingerList}
                      Required
                      ResourcePage="ForgetFinger"
                      isDisabled={isDisabled}
                      value={values.forgetFinger}
                      errors={errors.forgetFinger}
                      touched={touched.forgetFinger}
                      isClearable={false}
                      placeholder="pleaseSelect"
                      onBlur={() => setFieldTouched('forgetFinger', true)}
                      onChange={(option) => setFieldValue('forgetFinger', option)}
                    />

                    {/* Check In Fields: When forgetFinger is 1 (CheckIn) or 3 (Both) */}
                    {(values?.forgetFinger?.value === 1 || values?.forgetFinger?.value === 3) && (
                      <>
                        <CustomDatePicker
                          label="checkIn"
                          ResourcePage="GeneralField"
                          Required
                          disabled={isDisabled}
                          value={values.attendanceDateIn}
                          errors={errors.attendanceDateIn}
                          touched={touched.attendanceDateIn}
                          onChange={(date) => {
                            setFieldValue('attendanceDateIn', date);
                            formikRefTransaction.current?.setFieldValue('executionDate', date);
                          }}
                        />
                        <CustomTimePicker
                          label="timeIn"
                          ResourcePage="GeneralField"
                          Required
                          disabled={isDisabled}
                          value={values.timeIn}
                          errors={errors.timeIn}
                          touched={touched.timeIn}
                          onChange={(time) => setFieldValue('timeIn', time)}
                        />
                      </>
                    )}

                    {/* Check Out Fields: When forgetFinger is 2 (CheckOut) or 3 (Both) */}
                    {(values?.forgetFinger?.value === 2 || values?.forgetFinger?.value === 3) && (
                      <>
                        <CustomDatePicker
                          label="checkOut"
                          ResourcePage="GeneralField"
                          Required
                          disabled={isDisabled}
                          value={values.attendanceDateOut}
                          errors={errors.attendanceDateOut}
                          touched={touched.attendanceDateOut}
                          onChange={(date) => {
                            setFieldValue('attendanceDateOut', date);
                            if (values?.forgetFinger?.value === 2) {
                              formikRefTransaction.current?.setFieldValue('executionDate', date);
                            }
                          }}
                        />
                        <CustomTimePicker
                          label="timeOut"
                          ResourcePage="GeneralField"
                          Required
                          disabled={isDisabled}
                          value={values.timeOut}
                          errors={errors.timeOut}
                          touched={touched.timeOut}
                          onChange={(time) => setFieldValue('timeOut', time)}
                        />
                      </>
                    )}
                  </SectionContainer>
                )}
              </Formik>

              <TransactionSection
                formikRef={formikRefTransaction}
                initialValues={initialValuesTransaction}
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

            <Step step={1}>
              <View />
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
