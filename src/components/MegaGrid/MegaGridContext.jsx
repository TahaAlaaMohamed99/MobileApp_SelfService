import { createContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';

export const MegaGridContext = createContext();

// Explicit prop list (instead of `{ children, ...props }`) so the context value
// below can depend on each prop individually. A rest-spread object is a new
// reference on every render no matter what, which would make `useMemo([props])`
// recompute every time and cascade a re-render to every mounted MegaGridCard.
export function MegaGridProvider({
  children,
  GridKey,
  columns,
  data,
  ResourcePage,
  keyId,
  isSearch,
  isFilterGrid,
  filterFields,
  valuesFilter,
  handleFilterGrid,
  handleClearFilter,
  onClickRow,
  rowActionList,
  hasMore,
  onLoadMore,
  onAddPress,
  refreshing,
  loading,
  onRefresh,
  renderCell,
}) {
  const { currentLanguage } = useSelector(state => state.themeSlice);
  const ReduxResources = useSelector(state => state.resourcesSlice.ReduxResources);

  const [getData, setGetData] = useState(data || []);
  const [columnState, setColumnState] = useState({
    all: [], visible: [], titleCol: undefined, subtitleCol: undefined, avatarCol: undefined, badgeCols: [], bodyCols: [], footerCols: [], filterCols: [],
  });
  const searchTimeout = useRef(null);

  useEffect(() => {
    const all = columns || [];
    const visible = all.filter(c => !c.hidden && !c.hiddenMobile && !c.hiddenShow);
    const filterCols = all.filter(c => c.isFilter !== false && !c.hiddenShow);
    const titleCol = visible.find(c => c.isCardTitle);
    const subtitleCol = visible.find(c => c.isCardSubtitle);
    const avatarCol = visible.find(c => c.isCellAvatar);
    const badgeCols = visible.filter(c => c.isHeaderMobile);
    const footerCols = visible.filter(c => c.isFooter);
    setColumnState({
      all,
      visible,
      titleCol,
      subtitleCol,
      avatarCol,
      badgeCols,
      bodyCols: visible.filter(
        c => !c.isHeaderMobile && !c.isCardTitle && !c.isCardSubtitle && !c.isCellAvatar && !c.isFooter,
      ),
      footerCols,
      filterCols,
    });
  }, [columns]);

  useEffect(() => { setGetData(data || []); }, [data]);

  const handleSearch = useCallback((text) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      if (!text?.trim()) { setGetData(data || []); return; }
      const lower = text.toLowerCase();
      setGetData((data || []).filter(row =>
        Object.values(row).some(v => String(v ?? '').toLowerCase().includes(lower))
      ));
    }, 300);
  }, [data]);

  useEffect(() => () => clearTimeout(searchTimeout.current), []);

  const value = useMemo(() => ({
    GridKey,
    columns,
    data,
    ResourcePage,
    keyId,
    isSearch,
    isFilterGrid,
    filterFields,
    valuesFilter,
    handleFilterGrid,
    handleClearFilter,
    onClickRow,
    rowActionList,
    hasMore,
    onLoadMore,
    onAddPress,
    refreshing,
    loading,
    onRefresh,
    renderCell,
    currentLanguage,
    ReduxResources,
    columnState,
    getData,
    setGetData,
    handleSearch,
  }), [
    GridKey,
    columns,
    data,
    ResourcePage,
    keyId,
    isSearch,
    isFilterGrid,
    filterFields,
    valuesFilter,
    handleFilterGrid,
    handleClearFilter,
    onClickRow,
    rowActionList,
    hasMore,
    onLoadMore,
    onAddPress,
    refreshing,
    loading,
    onRefresh,
    renderCell,
    currentLanguage,
    ReduxResources,
    columnState,
    getData,
    handleSearch,
  ]);

  return <MegaGridContext.Provider value={value}>{children}</MegaGridContext.Provider>;
}
