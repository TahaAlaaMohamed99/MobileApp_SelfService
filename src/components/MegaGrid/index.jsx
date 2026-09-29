import React, { useContext, useState, useRef, useCallback, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MegaGridContext, MegaGridProvider } from './MegaGridContext';
import FilterGrid from './FilterGrid';
import MegaGridCard from './MegaGridCard';
import MegaGridCardSkeleton from '../Skeleton/MegaGridCardSkeleton';
import { useDesignSystem } from '../../hooks/useDesignSystem';
import { useRefreshControlProps } from '../../hooks/useRefreshControlProps';
import TranslationText from '../TranslationText';
import { IconSearch, IconFilter, IconAdd, IconNotData } from '../../assets/IconsSvg';

function MegaGridInner() {
  const {
    getData,
    keyId = 'recId',
    isSearch,
    isFilterGrid,
    filterFields,
    handleSearch,
    onLoadMore,
    hasMore = false,
    onAddPress,
    refreshing,
    onRefresh,
    loading,
    columnState,
    rowActionList,
  } = useContext(MegaGridContext);

  const {
    colors, spacing, radius, currentShadow,
    stylesText, rowDirection, fonts, iconSize, rf,
  } = useDesignSystem();
  const refreshControlProps = useRefreshControlProps();

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const filterBadge = filterFields?.length ?? 0;

  useEffect(() => { setIsLoadingMore(false); }, [getData]);

  const handleEndReached = useCallback(() => {
    if (!hasMore || isLoadingMore || !onLoadMore) return;
    setIsLoadingMore(true);
    onLoadMore();
  }, [hasMore, isLoadingMore, onLoadMore]);

  const renderCard = useCallback(({ item }) => <MegaGridCard row={item} />, []);

  const keyExtractor = useCallback((item, idx) => String(item[keyId] ?? idx), [keyId]);

  return (
    <View style={{ flex: 1 }}>
      {/* Toolbar */}
      {(isSearch || isFilterGrid || onAddPress) && (
        <View
          style={{
            flexDirection: rowDirection,
            gap: spacing.sm,
            marginBottom: spacing.lg,
            alignItems: 'center',
          }}
        >
          {isSearch && (
            <View
              style={{
                flex: 1,
                flexDirection: rowDirection,
                alignItems: 'center',
                borderWidth: 1.2,
                borderColor: colors.border,
                borderRadius: radius.md,
                backgroundColor: colors.surface,
                paddingHorizontal: spacing.sm,
                gap: spacing.xs,
                height: rf(44),
                ...currentShadow,
              }}
            >
              <IconSearch color={colors.placeholder} size={iconSize.md} />
              <TextInput
                style={{
                  flex: 1,
                  color: colors.title,
                  fontFamily: fonts.regular,
                  fontSize: 14,
                  height: '100%',
                }}
                placeholderTextColor={colors.placeholder}
                onChangeText={handleSearch}
              />
            </View>
          )}

          {isFilterGrid && (
            <TouchableOpacity
              onPress={() => setIsFilterVisible(true)}
              style={{
                width: rf(44),
                height: rf(44),
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                borderWidth: 1.2,
                borderColor: filterBadge > 0 ? colors.primary : colors.border,
                ...currentShadow,
              }}
            >
              <IconFilter color={filterBadge > 0 ? colors.primary : colors.text} size={iconSize.md} />
              {filterBadge > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    minWidth: rf(18),
                    height: rf(18),
                    borderRadius: rf(9),
                    backgroundColor: colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 2,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: rf(10), fontFamily: fonts.bold }}>
                    {filterBadge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {onAddPress && (
            <TouchableOpacity
              onPress={onAddPress}
              style={{
                width: rf(40),
                height: rf(40),
                alignItems: 'center',
                justifyContent: 'center',
                 borderRadius: radius.md,
                borderWidth: 2,
                borderColor: colors.primary,
                ...currentShadow,
              }}
            >
              <IconAdd color={colors.primary} size={iconSize.lg} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Card list */}
      {loading && getData.length === 0 ? (
        <View>
          {[0, 1, 2].map((i) => (
            <MegaGridCardSkeleton
              key={i}
              columnState={columnState}
              hasMenu={!!rowActionList?.length}
            />
          ))}
        </View>
      ) : (
        <FlashList
          data={getData}
          keyExtractor={keyExtractor}
          renderItem={renderCard}
          estimatedItemSize={120}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.25}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} {...refreshControlProps} />
            ) : undefined
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={{ paddingVertical: spacing.md, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: spacing.xl * 2, gap: spacing.sm }}>
              <IconNotData color={colors.primary} />
              <TranslationText
                title="noData"
                page="Grid"
                style={stylesText({ color: 'text', size: 'md' })}
              />
            </View>
          }
        />
      )}

      {/* Filter side panel */}
      {isFilterGrid && (
        <FilterGrid isVisible={isFilterVisible} setIsVisible={setIsFilterVisible} />
      )}
    </View>
  );
}

export default function MegaGrid(props) {
  return (
    <MegaGridProvider {...props}>
      <MegaGridInner />
    </MegaGridProvider>
  );
}
