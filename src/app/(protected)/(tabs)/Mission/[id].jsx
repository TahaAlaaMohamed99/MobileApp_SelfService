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
import { formatDateForAPI, formatDateOnlyForAPI, getCurrentDate, parseAPIDate } from '../../../../hooks/useFormatDate';
import { missionTransactionDataSchema } from '../../../../utils/validationSchema';
import SectionContainer from '../../../../components/SectionContainer';
import Stepper, { Step } from '../../../../components/Stepper';
import CustomSelect from '../../../../components/Form/CustomSelect';
import CustomDatePicker from '../../../../components/Form/CustomDatePicker';
import CustomCheckboxCard from '../../../../components/Form/CustomCheckboxCard';
import TransactionSection from '../../../../components/TransactionSection';
import AuditTransaction from '../../../../components/AuditTransaction';
import WorkFlowTransactionLog from '../../../../components/WorkFlowTransactionLog';
import FooterActions from '../../../../components/FooterActions';
import { IconDocument, IconAttachments } from '../../../../assets/IconsSvg';

const ResourcePage = 'Mission';
const ApiPage = 'Mission';

export default function MissionForm() {
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
  const [locationList, setLocationList] = useState([]);
  const [reasonList, setReasonList] = useState([]);
  const [missionSubTypesList, setMissionSubTypesList] = useState([]);
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
      getGenerallist('MissionSubTypes', setIsLoading, setMissionSubTypesList);
    }, [id])
  );
   useFocusEffect(
    useCallback(() => {
      if (data.status == 1) {
        getLookup('Location', 'name', null, 'recId', setIsLoading, setLocationList);
        getLookup('Reason', 'name', null, 'recId', setIsLoading, setReasonList);
      }
    }, [data.status])
  );
  const selectedMissionSubType = useGetSelected(missionSubTypesList, data?.type || 0);
  const selectedLocation = useGetSelected(locationList, data?.locationRecId, data?.locationName);
  const selectedReason = useGetSelected(reasonList, data?.reasonRecId, data?.reasonName);

  const initialValuesTransaction = useTransactionInitialValues(data);
  const initialValuesStepOne = useMemo(
    () => ({
      dateTimeFrom: data?.dateTimeFrom ? parseAPIDate(data.dateTimeFrom) : getCurrentDate(),
      dateTimeTo: data?.dateTimeTo ? parseAPIDate(data.dateTimeTo) : getCurrentDate(),
      missionSubType: selectedMissionSubType,
      location: selectedLocation,
      reason: selectedReason,
      IsFullDayMission: data?.isFullDay == 2 ? true : false,
    }),
    [data, selectedMissionSubType, selectedLocation, selectedReason]
  );

  const isDisabled = data.status !== 1;

  const headerOptions = useHeaderOptionsAddEdit({ ResourcePage, data });

  const sendData = (values) => ({
    employeeRecId: employeeId,
    type: values.missionSubType?.value,
    name: values.name,
    isFullDay: values?.IsFullDayMission == true ? 2 : 1,
    locationRecId: values?.location?.value,
    reasonRecId: values?.reason?.value,
    dateTimeFrom: formatDateForAPI(values.dateTimeFrom),
    dateTimeTo: formatDateForAPI(values.dateTimeTo),
    transactionDate: formatDateOnlyForAPI(values.transDate),
    executionDate: formatDateOnlyForAPI(values.dateTimeFrom),
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
                validationSchema={missionTransactionDataSchema}
                initialValues={initialValuesStepOne}
                enableReinitialize={true}
              >
                {({ setFieldValue, values, errors, touched, setFieldTouched }) => (
                  <SectionContainer ResourcePage={ResourcePage} title="transactionInformation">
                    <CustomSelect
                      label="title"
                      titleGenerallist
                      options={missionSubTypesList}
                      Required
                      ResourcePage="MissionSubTypes"
                      isDisabled={isDisabled}
                      value={values.missionSubType}
                      errors={errors.missionSubType}
                      touched={touched.missionSubType}
                      isClearable={false}
                      placeholder="pleaseSelect"
                      onBlur={() => setFieldTouched('missionSubType', true)}
                      onChange={(option) => setFieldValue('missionSubType', option)}
                    />
                    <View style={globalStyles.containerFiled}>
                      <CustomCheckboxCard
                        label="isFullDayMission"
                        ResourcePage="Generallist?.NoYes"
                        disabled={isDisabled}
                        checked={values.IsFullDayMission === true}
                        onChange={(val) => setFieldValue('IsFullDayMission', val)}
                      />
                    </View>


                    <CustomDatePicker
                      label="dateTimeFrom"
                      ResourcePage="GeneralField"
                      Required
                      disabled={isDisabled}
                      viewTime={values.IsFullDayMission !== true}
                      value={values.dateTimeFrom}
                      errors={errors.dateTimeFrom}
                      touched={touched.dateTimeFrom}
                      onChange={(date) => {
                        setFieldValue('dateTimeFrom', date);
                        formikRefTransaction.current?.setFieldValue('executionDate', date);                        
                        if (date > values.dateTimeTo) setFieldValue('dateTimeTo', date);
                      }}
                    />
                    <CustomDatePicker
                      label="dateTimeTo"
                      ResourcePage="GeneralField"
                      Required
                      disabled={isDisabled}
                      viewTime={values.IsFullDayMission !== true}
                      minDate={values.dateTimeFrom}
                      value={values.dateTimeTo}
                      errors={errors.dateTimeTo}
                      touched={touched.dateTimeTo}
                      onChange={(date) => setFieldValue('dateTimeTo', date)}
                    />

                    <CustomSelect
                      label="title"
                      options={locationList}
                      ResourcePage="Location"
                      isDisabled={isDisabled}
                      value={values.location}
                      isClearable
                      placeholder="pleaseSelect"
                      onBlur={() => setFieldTouched('location', true)}
                      onChange={(option) => setFieldValue('location', option)}
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
