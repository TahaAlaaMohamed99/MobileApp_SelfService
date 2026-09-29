import React, { cloneElement, forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from "react";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { useDesignSystem } from "../hooks/useDesignSystem";

const BottomSheetModalViwer = forwardRef(function BottomSheetModalViwer(
  { btn, data = [], renderItem, keyExtractor, ListHeaderComponent, snapPoints, onDismiss },
  ref
) {
  const { colors, spacing } = useDesignSystem();
  const sheetRef = useRef(null);

  useImperativeHandle(ref, () => ({
    present: () => sheetRef.current?.present(),
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );
   const snapPointsModal = useMemo(
    () => (snapPoints ? snapPoints : data.length > 3 ? ["32%", "45%"] : ["32%"]),
    [data, snapPoints]
  );
   return (
    <>
      {btn &&
        cloneElement(btn, {
          onPress: (...args) => {
            btn.props.onPress?.(...args);
            sheetRef.current?.present();
          },
        })}

      <BottomSheetModal
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints ?? ["15%"]}
        enableDynamicSizing={false}
        handleIndicatorStyle={{ backgroundColor: colors.disabled }}
        backgroundStyle={{ backgroundColor: colors.surface }}
        backdropComponent={renderBackdrop}
        onDismiss={onDismiss}
      >
        <BottomSheetFlatList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={ListHeaderComponent}
          contentContainerStyle={{
            paddingHorizontal: spacing.base,
            paddingBottom: spacing.lg,
            gap: spacing.xs,
          }}
        />
      </BottomSheetModal>
    </>
  );
});

export default BottomSheetModalViwer;
