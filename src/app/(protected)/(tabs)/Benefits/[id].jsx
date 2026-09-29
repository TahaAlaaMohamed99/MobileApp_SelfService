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
import { benefitEnrollmentRequestTransactionSchema } from '../../../../utils/validationSchema';
import checkIsEdited from '../../../../utils/checkIsEdited';
import SectionContainer from '../../../../components/SectionContainer';
import Stepper, { Step } from '../../../../components/Stepper';
import CustomSelect from '../../../../components/Form/CustomSelect';
import CustomDatePicker from '../../../../components/Form/CustomDatePicker';
import CustomInput from '../../../../components/Form/CustomInput';
import TransactionSection from '../../../../components/TransactionSection';
import FormChangeTracker from '../../../../components/FormChangeTracker';
import AuditTransaction from '../../../../components/AuditTransaction';
import WorkFlowTransactionLog from '../../../../components/WorkFlowTransactionLog';
import FooterActions from '../../../../components/FooterActions';
import { IconDocument, IconAttachments, IconBenefits } from '../../../../assets/IconsSvg';
import InstallmentsLIne from '../../../../components/Benefits/InstallmentsLIne';

const ResourcePage = 'Benefits';
const ApiPage = 'BenefitEnrollmentRequest';

const currentYear = () => new Date().getFullYear();
const toText = (value) => (value == null ? '' : String(value));

export default function BenefitsForm() {
  const { id } = useFormMode();
  const { employeeId, isSelfService } = useUserData();
  const { colors, spacing, globalStyles } = useDesignSystem();
  const refreshControlProps = useRefreshControlProps();

  const formikRef = useRef();
  const formikRefTransaction = useRef();
  const { execute } = useMultiFormikSubmit([formikRef, formikRefTransaction]);
  const { getLookup } = useGetLookup();
  const { getMultipleGenerallists } = useGetGenerallist();
  const { handleSubmitFormik, handleUpdateAndSubmitTransaction } = useHandleSubmit();
  const [isStepOneEdited, setIsStepOneEdited] = useState(false);
  const [isTransactionEdited, setIsTransactionEdited] = useState(false);
  const isEdited = isStepOneEdited || isTransactionEdited;
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoadingSubmitTransaction, setIsLoadingSubmitTransaction] = useState(false);
  const [isLoadingBenefit, setIsLoadingBenefit] = useState(false);
  const [data, setData] = useState({ status: 1 });
  const [paymentTemplateList, setPaymentTemplateList] = useState([]);
  const [benefitsList, setBenefitsList] = useState([]);
  const [monthsList, setMonthsList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [workFlowTransaction, setWorkFlowTransaction] = useState(null);

  const fetchData = useGetById(ApiPage, id, setIsLoading, setData, null, ResourcePage);

  useFocusEffect(
    useCallback(() => {
      if (id > 0) fetchData();
      else setIsLoading(false);
    }, [id])
  );

  useFocusEffect(
    useCallback(() => {
      getMultipleGenerallists(
        [
          { name: 'Months', setList: setMonthsList },
          { name: 'BenefitCategory', setList: setCategoryList },
        ],
        setIsLoading
      );
      getLookup('PaymentTemplate', 'name', null, 'recId', setIsLoading, setPaymentTemplateList);

    }, [])
  );

  const fetchWorkFlowTransaction = useGetWorkFlowTransactionLog(
    id,
    ResourcePage,
    setIsLoading,
    setWorkFlowTransaction,
    data?.isSendNotification || data?.sendNotification,
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

  const handleBenefitCategoryChange = useCallback(
    (value) => {
      if (value === undefined || value === null) return;
      getLookup(
        `BenefitEnrollmentRequest/GetBenefitPlanAccordingToCategory?category=${value}`,
        'name',
        null,
        'recId',
        setIsLoadingBenefit,
        setBenefitsList,
        ['showInPaySlip', 'numberOfInstallments', 'maxLimit'],
        null,
        true
      );
    },
    [getLookup]
  );

  useFocusEffect(
    useCallback(() => {
      handleBenefitCategoryChange(data?.benefitCategory || 0);
    }, [data?.benefitCategory, data.status])
  );

  const selectedMonths = useGetSelected(monthsList, data?.startingMonth || 1);
  const selectedPaySlipMonth = useGetSelected(monthsList, data?.paySlipMonth || 1);
  const selectedCategory = useGetSelected(categoryList, data?.benefitCategory || 0);
  const selectedPaymentTemplate = useGetSelected(paymentTemplateList, data?.paymentTemplateRecId, data?.paymentTemplateName);
  const selectedDefaultPaymentTemplate = useGetSelected(
    paymentTemplateList,
    data?.defaultDisbursementPaymentTemplateRecId,
    data?.defaultDisbursementPaymentTemplateName
  );
  const selectedBenefitPlan = useGetSelected(benefitsList, data?.benefitPlanRecId, data?.benefitPlanName, null, true);

  const initialValuesTransaction = useTransactionInitialValues(data);
  const initialValuesStepOne = {
    enrollmentDate: data?.enrollmentDate ? parseAPIDate(data.enrollmentDate) : getCurrentDate(),
    year: data?.startYear || currentYear(),
    month: selectedMonths,
    paymentTemplate: selectedPaymentTemplate,
    defaultDisbursementPaymentTemplate: selectedDefaultPaymentTemplate,
    benefitPlane: selectedBenefitPlan,
    benefitCategory: selectedCategory,
    paySlipMonth: selectedPaySlipMonth,
    paySlipYear: data?.paySlipYear || currentYear(),
    maxLimit: data?.amount ?? selectedBenefitPlan?.maxLimit ?? '',
    numberOfInstallments: data?.numberOfInstallments ?? selectedBenefitPlan?.numberOfInstallments ?? '',
  };

  const isDisabled = data.status !== 1;
  const headerOptions = useHeaderOptionsAddEdit({ ResourcePage, data });

  const sendData = (values) => ({
    name: values.name || '',
    enrollmentDate: values.enrollmentDate ? formatDateOnlyForAPI(values.enrollmentDate) : null,
    transactionDate: formatDateOnlyForAPI(values.transDate),
    executionDate: formatDateOnlyForAPI(values.executionDate),
    startYear: values.year,
    startingMonth: values?.month?.value,
    invoiceId: null,
    vendorRecId: null,
    paymentTemplateRecId: values?.paymentTemplate?.value || null,
    defaultDisbursementPaymentTemplateRecId: values?.defaultDisbursementPaymentTemplate?.value || null,
    benefitPlanRecId: values?.benefitPlane?.value,
    benefitCategory: values?.benefitCategory?.value,
    paySlipMonth: values?.paySlipMonth?.value,
    paySlipYear: values?.paySlipYear,
    amount: values?.maxLimit,
    numberOfInstallments: values?.numberOfInstallments,
    employeeRecId: employeeId,
  });

  const handleSubmit = () => {
    execute((values) => {
      handleSubmitFormik({
        apiPage:
          id > 0
            ? `/BenefitEnrollmentRequest/UpdateSelfServiceBenefitEnrollment`
            : "BenefitEnrollmentRequest/self-service",
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
        apiPage:
          id > 0
            ? `/BenefitEnrollmentRequest/UpdateSelfServiceBenefitEnrollment`
            : "BenefitEnrollmentRequest/self-service",
        values: sendData(values),
        recId: id,
        setIsLoadingSubmitTransaction,
        setData,
        onSuccess: () => (id > 0 ? fetchData() : router.back()),
      });
    });
  };

  const isInstallmentsDisabled = id <= 0 || isEdited;

  const steps = [
    { step: 0, title: 'transactionData', icon: <IconDocument />, onClick: () => setActiveStep(0) },
    {
      step: 1,
      title: 'installments',
      ResourcePage: 'GeneralField',
      icon: <IconBenefits />,
      onClick: () => !isInstallmentsDisabled && setActiveStep(1),
      disabled: isInstallmentsDisabled,
    },
    { step: 2, title: 'attachments', icon: <IconAttachments />, onClick: () => setActiveStep(2), disabled: true },
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
                validationSchema={benefitEnrollmentRequestTransactionSchema}
                initialValues={initialValuesStepOne}
                enableReinitialize={true}
              >
                {({ setFieldValue, values, errors, touched, setFieldTouched }) => {
                  const shouldShowPaySlipFields =
                    values?.benefitPlane?.showInPaySlip == 2 && [0, 3, undefined].includes(values?.benefitCategory?.value);

                  return (
                    <>
                      <FormChangeTracker
                        values={values}
                        initialValues={initialValuesStepOne}
                        id={id}
                        setIsEdited={setIsStepOneEdited}
                      />
                      <SectionContainer ResourcePage={ResourcePage} title="transactionInformation">
                      <CustomSelect
                        label="title"
                        titleGenerallist
                        options={categoryList}
                        ResourcePage="BenefitCategory"
                        isDisabled={isDisabled}
                        value={values.benefitCategory}
                        isClearable={false}
                        placeholder="pleaseSelect"
                        onBlur={() => setFieldTouched('benefitCategory', true)}
                        onChange={(option) => {
                          setFieldValue('benefitCategory', option);
                          setFieldValue('benefitPlane', null);
                          handleBenefitCategoryChange(option?.value);
                        }}
                      />

                      <CustomSelect
                        label="title"
                        options={benefitsList}
                        Required
                        ResourcePage="BenefitPlan"
                        isLoading={isLoadingBenefit}
                        isDisabled={isDisabled}
                        value={values.benefitPlane}
                        errors={errors.benefitPlane}
                        touched={touched.benefitPlane}
                        isClearable={false}
                        placeholder="pleaseSelect"
                        onBlur={() => setFieldTouched('benefitPlane', true)}
                        onChange={(option) => {
                          setFieldValue('benefitPlane', option);
                          setFieldValue('numberOfInstallments', option?.numberOfInstallments ?? '');
                          setFieldValue('maxLimit', option?.maxLimit ?? '');
                        }}
                      />

                      {values?.benefitCategory?.value !== 2 && (
                        <CustomInput
                          label="numberOfInstallments"
                          ResourcePage="GeneralField"
                          Required
                          isNumber
                          disabled={isDisabled}
                          value={toText(values.numberOfInstallments)}
                          placeholder="pleaseEnterNumberOfInstallments"
                          onChange={(value) => setFieldValue('numberOfInstallments', value)}
                          errors={errors.numberOfInstallments}
                          touched={touched.numberOfInstallments}
                          onBlur={() => setFieldTouched('numberOfInstallments', true)}
                        />
                      )}

                      <CustomInput
                        label="amount"
                        ResourcePage="GeneralField"
                        isNumber
                        Required
                        disabled={isDisabled}
                        value={toText(values.maxLimit)}
                        placeholder="pleaseEnterAmount"
                        onChange={(value) => setFieldValue('maxLimit', value)}
                        errors={errors.maxLimit}
                        touched={touched.maxLimit}
                        onBlur={() => setFieldTouched('maxLimit', true)}
                      />

                      {shouldShowPaySlipFields && (
                        <>
                          <CustomSelect
                            label="paySlipMonth"
                            titleGenerallist
                            options={monthsList}
                            Required
                            ResourcePage="Months"
                            isDisabled={isDisabled}
                            value={values.paySlipMonth}
                            errors={errors.paySlipMonth}
                            touched={touched.paySlipMonth}
                            isClearable={false}
                            placeholder="pleaseSelect"
                            onBlur={() => setFieldTouched('paySlipMonth', true)}
                            onChange={(option) => setFieldValue('paySlipMonth', option)}
                          />
                          <CustomInput
                            label="paySlipYear"
                            ResourcePage="GeneralField"
                            Required
                            isNumber
                            disabled={isDisabled}
                            value={toText(values.paySlipYear)}
                            errors={errors.paySlipYear}
                            touched={touched.paySlipYear}
                            placeholder="pleaseEnterPaySlipYear"
                            onBlur={() => setFieldTouched('paySlipYear', true)}
                            onChange={(value) => setFieldValue('paySlipYear', value)}
                          />
                        </>
                      )}

                      {shouldShowPaySlipFields && (
                        <CustomSelect
                          label="DefaultDisbursementPaymentTemplate"
                          options={paymentTemplateList}
                          ResourcePage="BenefitEnrollmentRequest"
                          isDisabled={isDisabled}
                          value={values.defaultDisbursementPaymentTemplate}
                          isClearable
                          placeholder="pleaseSelectDefaultDisbursementPaymentTemplate"
                          onChange={(option) => setFieldValue('defaultDisbursementPaymentTemplate', option)}
                          onBlur={() => setFieldTouched('defaultDisbursementPaymentTemplate', true)}
                          errors={errors.defaultDisbursementPaymentTemplate}
                          touched={touched.defaultDisbursementPaymentTemplate}
                        />
                      )}

                      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                        <CustomSelect
                          label="title"
                          titleGenerallist
                          options={monthsList}
                          Required
                          ResourcePage="Months"
                          isDisabled={isDisabled}
                          value={values.month}
                          errors={errors.month}
                          touched={touched.month}
                          isClearable={false}
                          placeholder="pleaseSelect"
                          style={{ flex: 1 }}
                          onBlur={() => setFieldTouched('month', true)}
                          onChange={(option) => setFieldValue('month', option)}
                        />
                        <CustomInput
                          label="year"
                          ResourcePage="GeneralField"
                          isNumber
                          Required
                          disabled={isDisabled}
                          value={toText(values.year)}
                          errors={errors.year}
                          touched={touched.year}
                          placeholder="pleaseEnterYear"
                          style={{ flex: 1 }}
                          onBlur={() => setFieldTouched('year', true)}
                          onChange={(value) => setFieldValue('year', value)}
                        />
                      </View>

                      {values?.benefitCategory?.value > 0 && (
                        <CustomSelect
                          label="title"
                          options={paymentTemplateList}
                          ResourcePage="PaymentTemplate"
                          isDisabled={isDisabled}
                          value={values.paymentTemplate}
                          isClearable
                          placeholder="pleaseSelect"
                          onBlur={() => setFieldTouched('paymentTemplate', true)}
                          onChange={(option) => setFieldValue('paymentTemplate', option)}
                          errors={errors.paymentTemplate}
                          touched={touched.paymentTemplate}
                        />
                      )}

                      <CustomDatePicker
                        label="enrollmentDate"
                        ResourcePage="GeneralField"
                        Required
                        disabled={isDisabled}
                        value={values.enrollmentDate}
                        errors={errors.enrollmentDate}
                        touched={touched.enrollmentDate}
                        onChange={(date) => setFieldValue('enrollmentDate', date)}
                      />


                    </SectionContainer>
                  </>
                  );
                }}
              </Formik>
              <TransactionSection
                formikRef={formikRefTransaction}
                initialValues={initialValuesTransaction}
                ResourcePage={ResourcePage}
                isDisabled={isDisabled}
                data={data}
                setIsEdited={setIsTransactionEdited}
                id={id}
              />
              <WorkFlowTransactionLog
                id={id}
                ResourcePage={ResourcePage}
                setIsLoading={setIsLoading}
                isLoading={isLoading}
                workFlowTransaction={workFlowTransaction}
              />
              <AuditTransaction data={data} ResourcePage={ResourcePage} id={id} />
            </Step>
            <Step step={1} >
              <InstallmentsLIne employeeId={employeeId} data={data} />
            </Step>
          </Stepper>
        </ScrollView>
        {activeStep == 0 &&
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
        }

      </View>
    </>
  );
}