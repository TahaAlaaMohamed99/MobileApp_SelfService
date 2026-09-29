import React, { useRef, useState } from 'react';
import { View, Platform } from 'react-native';
import { router } from 'expo-router';
import { useDesignSystem } from '../hooks/useDesignSystem';
import ConfirmationModal from './ConfirmationModal';
import FooterActionButton from './FooterActionButton';
import { IconSave, IconSubmitted, IconTrash, IconReCall } from '../assets/IconsSvg';
import { useUserData } from '../hooks/useUserData';
import useApiAction from '../hooks/useApiAction';
import useDeleteActions from '../hooks/useDeleteActions';
import useToast from '../hooks/useToast';
import checkIsEdited from '../utils/checkIsEdited';
import Generallist from '../ConfigData/Generallist.json';

export default function FooterActions({
  id,
  statusId,
  apiPage,
  data,
  setData,
  fetchData,
  viewOnly = false,
  isDelete = true,
  onSave,
  isLoadingSave,
  formikRefs,
  onSubmitEdited,
  isLoadingSubmitEdited,
}) {
  const { colors, spacing, rowDirection, isDark } = useDesignSystem();
  const deleteModalRef = useRef(null);
  const submitModalRef = useRef(null);
  const reCallModalRef = useRef(null);
  const { userId } = useUserData();
  const { callApi } = useApiAction();
  const { singleDelete } = useDeleteActions();
  const toast = useToast();
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isLoadingReCall, setIsLoadingReCall] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const transactionName = Generallist.TransactionName?.find((t) => t.label === apiPage);

  const footerShadow = Platform.select({
    ios: {
      shadowColor: isDark ? '#000' : '#000BA0',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.45 : 0.18,
      shadowRadius: 12,
    },
    android: { elevation: isDark ? 12 : 8 },
    default: {},
  });

  const isPending = Number(statusId) == 1;
  const isSubmitEdited = id > 0 && checkIsEdited(formikRefs);
  const showSave = !viewOnly && !!onSave;
  const showSubmit = !viewOnly && isPending;
  const showDelete = id > 0 && isPending && isDelete;
  const showReCall =
    id > 0 &&
    Number(statusId) !== 1 &&
    Number(statusId) !== 999 &&
    Number(statusId) !== 4 &&
    data?.createdBy == userId;

  if (!showSave && !showSubmit && !showDelete && !showReCall) return null;

  const handleDelete = async () => {
    await singleDelete({
      apiPage,
      id,
      setIsLoading: setIsLoadingDelete,
      onSuccess: () => router.back(),
    });
    deleteModalRef.current?.dismiss();
  };

  const handleSubmitTransaction = async () => {
    if (checkIsEdited(formikRefs)) {
      await onSubmitEdited?.();
    } else {
      await callApi({
        method: 'post',
        url: `${apiPage}/Submit`,
        payload: { transactionName: transactionName?.value, transcationRecId: Number(id) },
        setIsLoading: setIsLoadingSubmit,
        onSuccess: (responseData) => {
          setData?.({ ...data, status: responseData });
          toast.success('submittedSuccessfully', null, 'GeneralMessages');
          fetchData?.();
        },
        onError: () => toast.error('submittedFailed', null, 'GeneralMessages'),
      });
    }
    submitModalRef.current?.dismiss();
  };

  const handleReCall = async () => {
    await callApi({
      method: 'post',
      url: `${apiPage}/ReCall`,
      payload: { transactionName: transactionName?.value, transcationRecId: Number(id) },
      setIsLoading: setIsLoadingReCall,
      onSuccess: () => {
        setData?.({ ...data, status: 1 });
        toast.success('reCalledSuccessfully', null, 'GeneralMessages');
        fetchData?.();
      },
      onError: () => toast.error('reCalledFailed', null, 'GeneralMessages'),
    });
    reCallModalRef.current?.dismiss();
  };

  return (
    <View
      style={{
        flexDirection: rowDirection,
        justifyContent: showDelete ? 'space-between' : "flex-end",
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
        backgroundColor: colors.surface,
        ...footerShadow,
      }}
    >
      {showDelete && (
        <ConfirmationModal
          ref={deleteModalRef}
          icon={IconTrash}
          btn={<FooterActionButton variant="danger" icon={IconTrash} isLoading={isLoadingDelete} />}
          title="messageOneRemove"
          des="confirmOneDelete"
          type="delete"
          confirmText="delete"
          ResourcePage="GeneralActions"
          isLoadingConfirm={isLoadingDelete}
          onConfirm={handleDelete}
        />
      )}

      <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.sm }}>
        {showSave && (
          <FooterActionButton
            variant="outline"
            icon={IconSave}
            title="save"
            ResourcePage="GeneralActions"
            isLoading={isLoadingSave}
            onPress={onSave}
          />
        )}

        {showReCall && (
          <ConfirmationModal
            ref={reCallModalRef}
            icon={IconReCall}
            btn={
              <FooterActionButton
                variant="outline"
                icon={IconReCall}
                title="reCall"
                ResourcePage="GeneralTransaction"
                isLoading={isLoadingReCall}
              />
            }
            title="manageReCall"
            des="confirmReCall"
            type="default"
            confirmText="reCall"
            ResourcePage="GeneralTransaction"
            isLoadingConfirm={isLoadingReCall}
            onConfirm={handleReCall}
          />
        )}
         {showSubmit && (
          <ConfirmationModal
            ref={submitModalRef}
            icon={IconSubmitted}
            btn={
              <FooterActionButton
                variant="primary"
                icon={IconSubmitted}
                title={'submitted'}
                ResourcePage="GeneralTransaction"
                isLoading={isLoadingSubmit || isLoadingSubmitEdited}
              />
            }
            title="messageSubmitted"
            des="confirmSubmitted"
            subDescResourcePage="GeneralActions"
            subDescription={isSubmitEdited ? 'descriptionSaveUnchanges' : ''}
            type="primary"
            confirmText={isSubmitEdited ? 'submitAndSave' : 'submitted'}
            ResourcePage="GeneralTransaction"
            isLoadingConfirm={isLoadingSubmit || isLoadingSubmitEdited}
            onConfirm={handleSubmitTransaction}
          />
        )}
      </View>
    </View>
  );
}
