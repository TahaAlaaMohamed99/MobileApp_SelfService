import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import MegaGrid from './MegaGrid';
import { useDesignSystem } from '../hooks/useDesignSystem';
import useGridData from '../hooks/useGridData';

const DEFAULT_PAGE_SIZE = 10;

export default function CommonLogLine({
  DataPage,
  ResourcePage,
  ApiGetAllLines,
  onRowPress,
  onAddPress,
  isEdit = true,
  isAdd = true,
}) {
  const { globalStyles, spacing } = useDesignSystem();

  const pageSize = DataPage?.defaultPageSize ?? DEFAULT_PAGE_SIZE;
  const GridKey = `${DataPage.Api}_${DataPage.keyId}`;
  const columns = DataPage.columns;

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const appendModeRef = useRef(false);


  const { totalRow, fetchGridData } = useGridData(
    `${ApiGetAllLines}&`,
    DataPage?.gridList,
    setData,
    setIsLoading,
    DataPage?.isTree,
    DataPage?.treeKeys,
    DataPage?.keyEnum,
  );
  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchWithFilters = useCallback(
    (pageNum = 1) => {
      fetchGridData(pageNum, pageSize);
    },
    [fetchGridData, pageSize],
  );

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const run = async () => {
        setPage(1);
        fetchWithFilters(1);
      };

      run();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const hasMore = data.length < totalRow;

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoading) return;
    appendModeRef.current = true;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchWithFilters(nextPage);
  }, [hasMore, isLoading, page, fetchWithFilters]);






  const handleRefresh = useCallback(() => {
    appendModeRef.current = false;
    setPage(1);
    fetchWithFilters(1);
  }, [fetchWithFilters]);





  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { paddingTop: spacing.md }]}>
      <MegaGrid
        GridKey={GridKey}
        columns={columns}
        data={data}
        ResourcePage={ResourcePage}
        keyId={DataPage.keyId}
        isSearch={DataPage.isSearch !== false}
        isFilterGrid={DataPage.isFilterGrid}
        onClickRow={isEdit ? onRowPress : undefined}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        onAddPress={isAdd ? onAddPress : undefined}
        refreshing={isLoading}
        loading={isLoading}
        onRefresh={handleRefresh}
      />


    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
