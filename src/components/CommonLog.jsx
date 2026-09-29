import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import MegaGrid from './MegaGrid';
import ConfirmationModal from './ConfirmationModal';
import { useDesignSystem } from '../hooks/useDesignSystem';
import useToast from '../hooks/useToast';
import useGridData from '../hooks/useGridData';
import useGridFilters from '../hooks/useGridFilters';
import useApiAction from '../hooks/useApiAction';
import useDeleteActions from '../hooks/useDeleteActions';
import Generallist from '../ConfigData/Generallist.json';
import { IconTrash, IconReCall, IconSubmitted, IconActivate } from '../assets/IconsSvg';

const DEFAULT_PAGE_SIZE = 10;

export default function CommonLog({
  DataPage,
  ResourcePage,
  onRowPress,
  onAddPress,
  rowActions = [],
  isEdit = true,
  isDelete = true,
  isAdd = true,
}) {
  const toast = useToast();
  const { globalStyles, spacing } = useDesignSystem();
  const { callApi } = useApiAction();
  const { singleDelete } = useDeleteActions();
  const transactionName = Generallist.TransactionName?.find((t) => t.label === DataPage.Api);

  const pageSize = DataPage?.defaultPageSize ?? DEFAULT_PAGE_SIZE;
  const GridKey = `${DataPage.Api}_${DataPage.keyId}`;
  const columns = DataPage.columns;

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filterFields, setFilterFields] = useState([]);
  const [filterValues, setFilterValues] = useState(null);
  const [itemToAction, setItemToAction] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingReCall, setIsLoadingReCall] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoadingIsPrimary, setIsLoadingIsPrimary] = useState(false);

  const deleteModalRef = useRef(null);
  const reCallModalRef = useRef(null);
  const submitModalRef = useRef(null);
  const isPrimaryModalRef = useRef(null);
  const appendModeRef = useRef(false);
  const didInitFiltersRef = useRef(false);

  // useGridData appends when loading more, replaces otherwise
  const handleSetDataGrid = useCallback((updatedData) => {
    setData((prev) =>
      appendModeRef.current ? [...prev, ...(updatedData || [])] : updatedData || [],
    );
  }, []);

  const { totalRow, fetchGridData } = useGridData(
    `${DataPage.Api}/${DataPage.keyApiGetAll || 'GetAll'}?`,
    DataPage?.gridList,
    handleSetDataGrid,
    setIsLoading,
    DataPage?.isTree,
    DataPage?.treeKeys,
    DataPage?.keyEnum,
  );
  const { getInitialValues, sendData } = useGridFilters(
    columns,
    GridKey,
    DataPage?.keyEnum,
  );
  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchWithFilters = useCallback(
    (pageNum = 1, values = filterValues, cols = filterFields) => {
      const valuesFilters = cols?.length > 0 ? sendData(values) : null;
      fetchGridData(pageNum, pageSize, valuesFilters);
    },
    [filterValues, filterFields, sendData, fetchGridData, pageSize],
  );

  // Re-fetch whenever the screen gains focus; restore persisted filters on first load
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const run = async () => {
        appendModeRef.current = false;

        if (!didInitFiltersRef.current) {
          didInitFiltersRef.current = true;
          const { initialValues, filterFields: ff, valuesFilter } = await getInitialValues();
          if (cancelled) return;
          const initFields = ff?.length > 0 ? ff : [];
          const initValues = ff?.length > 0 ? valuesFilter : initialValues;
          setFilterFields(initFields);
          setFilterValues(initValues);
          setPage(1);
          fetchWithFilters(1, initValues, initFields);
        } else {
          setPage(1);
          fetchWithFilters(1);
        }
      };

      run();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  // ── Pagination ────────────────────────────────────────────────────────────

  const hasMore = data.length < totalRow;

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoading) return;
    appendModeRef.current = true;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchWithFilters(nextPage);
  }, [hasMore, isLoading, page, fetchWithFilters]);

  // ── Filter ────────────────────────────────────────────────────────────────

  const handleFilterGrid = useCallback(
    (values, cols) => {
      appendModeRef.current = false;
      setFilterFields(cols);
      setFilterValues(values);
      setPage(1);
      fetchWithFilters(1, values, cols);
    },
    [fetchWithFilters],
  );

  const handleClearFilter = useCallback(() => {
    appendModeRef.current = false;
    setFilterFields([]);
    setFilterValues(null);
    setPage(1);
    fetchWithFilters(1, null, []);
  }, [fetchWithFilters]);

  const handleRefresh = useCallback(() => {
    appendModeRef.current = false;
    setPage(1);
    fetchWithFilters(1);
  }, [fetchWithFilters]);


  const handleApiAction = useCallback(async (actionType) => {
    if (!actionType || !itemToAction) return;
    if (actionType === 'delete') {
      await singleDelete({
        apiPage: DataPage.Api,
        id: itemToAction[DataPage.keyId],
        setIsLoading: setIsDeleting,
        onSuccess: () => {
          deleteModalRef.current?.dismiss();
          appendModeRef.current = false;
          fetchWithFilters(page);
        },
      });
    } else if (actionType === 'reCall') {
      await callApi({
        method: 'post',
        url: `${DataPage.Api}/ReCall`,
        payload: { transactionName: transactionName?.value, transcationRecId: Number(itemToAction[DataPage.keyId]) },
        setIsLoading: setIsLoadingReCall,
        onSuccess: () => {
          toast.success('reCalledSuccessfully', null, 'GeneralMessages');
          reCallModalRef.current?.dismiss();
          appendModeRef.current = false;
          fetchWithFilters(page);
        },
        onError: () => {
          toast.error('reCalledFailed', null, 'GeneralMessages')
         },
        onFinally: () => {
          reCallModalRef.current?.dismiss();
        },
      });
    } else if (actionType === 'submit') {
      await callApi({
        method: 'post',
        url: `${DataPage.Api}/Submit`,
        payload: { transactionName: transactionName?.value, transcationRecId: Number(itemToAction[DataPage.keyId]) },
        setIsLoading: setIsLoadingSubmit,
        onSuccess: () => {
          toast.success('submittedSuccessfully', null, 'GeneralMessages');
          submitModalRef.current?.dismiss();
          appendModeRef.current = false;
          fetchWithFilters(page);
        },
        onError: () => {
          toast.error('submittedFailed', null, 'GeneralMessages')
         },
        onFinally: () => {
          submitModalRef.current?.dismiss();
        },
        
      });
    } else if (actionType === 'isPrimary') {
      await callApi({
        method: 'post',
        url: `${DataPage.Api}/TogglePrimary?id=${itemToAction[DataPage.keyId]}`,
        setIsLoading: setIsLoadingIsPrimary,
        onSuccess: () => {
          toast.success('updatedSuccessfully', null, 'GeneralMessages');
          isPrimaryModalRef.current?.dismiss();
          appendModeRef.current = false;
          fetchWithFilters(page);
        },
        onError: () => {
          toast.error('updateFailed', null, 'GeneralMessages')
         },
         onFinally: () => {
          isPrimaryModalRef.current?.dismiss();
         }
      });
    }

    setItemToAction(null);
  }, [itemToAction, DataPage, callApi, singleDelete, toast, fetchWithFilters, page]);

  // ── Row actions ───────────────────────────────────────────────────────────

  // Memoized: MegaGridContext's value depends on rowActionList's identity, so
  // rebuilding this array on every render would keep every mounted card
  // re-rendering regardless of the useFormatCell/context stabilization above.
  const builtRowActions = useMemo(() => [
    {
      label: 'call',
      icon: IconReCall,
      checkedShow: [{
        status: [4, 3, 2],
      }],
      onClick: (row) => {
        setItemToAction(row);
        reCallModalRef.current?.present();
      },
    },
    {
      label: 'submit',
      icon: IconSubmitted,
      checkedShow: [{
        status: 1,
      }],
      onClick: (row) => {
        setItemToAction(row);
        submitModalRef.current?.present();
      },
    },
    ...(isDelete ? [{
      label: 'delete',
      icon: IconTrash,
      checkedShow: [{
        status: 1,
      }],
      color: "error",
      onClick: (row) => {
        setItemToAction(row);
        deleteModalRef.current?.present();
      },
    }] : []),
    ...(DataPage?.isPrimaryActive ? [{
      label: 'isPrimary',
      icon: IconActivate,
      checkedShow: [{
        isPrimary: 1,
      }],
      onClick: (row) => {
        setItemToAction(row);
        isPrimaryModalRef.current?.present();
      },
    }] : []),
    ...rowActions,
  ], [isDelete, DataPage?.isPrimaryActive, rowActions]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={[globalStyles.container, styles.root, { paddingTop: spacing.md }]}>
      <MegaGrid
        GridKey={GridKey}
        columns={columns}
        data={data}
        ResourcePage={ResourcePage}
        keyId={DataPage.keyId}
        isSearch={DataPage.isSearch !== false}
        isFilterGrid={DataPage.isFilterGrid}
        filterFields={filterFields}
        valuesFilter={filterValues}
        handleFilterGrid={handleFilterGrid}
        handleClearFilter={handleClearFilter}
        onClickRow={isEdit ? onRowPress : undefined}
        rowActionList={builtRowActions.length > 0 ? builtRowActions : undefined}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        onAddPress={isAdd ? onAddPress : undefined}
        refreshing={isLoading}
        loading={isLoading}
        onRefresh={handleRefresh}
      />

      {/* Delete confirmation */}
      <ConfirmationModal
        ref={deleteModalRef}
        type="delete"
        icon={IconTrash}
        title="messageRemove"
        des="confirmDelete"
        ResourcePage="GeneralActions"
        confirmText="delete"
        isLoadingConfirm={isDeleting}
        onConfirm={() => handleApiAction('delete')}
        onDismiss={() => setItemToAction(null)}
      />

      {/* ReCall confirmation */}
      <ConfirmationModal
        ref={reCallModalRef}
        icon={IconReCall}
        title="manageReCall"
        des="confirmReCall"
        type="default"
        confirmText="reCall"
        ResourcePage="GeneralTransaction"
        isLoadingConfirm={isLoadingReCall}
        onConfirm={() => handleApiAction('reCall')}
        onDismiss={() => setItemToAction(null)}
      />

      {/* Submit confirmation */}
      <ConfirmationModal
        ref={submitModalRef}
        icon={IconSubmitted}
        title="messageSubmitted"
        des="confirmSubmitted"
        type="primary"
        confirmText="submitted"
        ResourcePage="GeneralTransaction"
        isLoadingConfirm={isLoadingSubmit}
        onConfirm={() => handleApiAction('submit')}
        onDismiss={() => setItemToAction(null)}
      />
      {/* IsPrimary confirmation */}
      <ConfirmationModal
        ref={isPrimaryModalRef}
        icon={IconActivate}
        title="isPrimary"
        des="isPrimaryDesc"
        type="default"
        confirmText="isPrimary"
        ResourcePage="GeneralActions"
        isLoadingConfirm={isLoadingIsPrimary}
        onConfirm={() => handleApiAction('isPrimary')}
        onDismiss={() => setItemToAction(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
