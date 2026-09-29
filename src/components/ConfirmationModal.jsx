import React, { cloneElement, forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { View, TouchableOpacity } from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useDesignSystem } from "../hooks/useDesignSystem";
import TranslationText from "./TranslationText";
import CustomeBtn from "./CustomeBtn";
import { IconClose } from "../assets/IconsSvg";

const TYPE_CONFIG = {
  delete: { iconColor: "error", tinted: true, confirmBtnType: "danger" },
  primary: { iconColor: "primary", tinted: true, confirmBtnType: "primary" },
  info: { iconColor: "title", borderColor: "title", confirmBtnType: "primary" },
  default: { iconColor: "title", confirmBtnType: "primary" },
};

const ConfirmationModal = forwardRef(function ConfirmationModal(
  {
    btn,
    title,
    des,
    subDescription,
    subDescResourcePage = "General",
    icon: Icon,
    type = "default",
    confirmText = "confirm",
    cancelText = "cancel",
    onConfirm,
    onCancel,
    isLoadingConfirm = false,
    ResourcePage = "General",
    onDismiss,
  },
  ref
) {
  const { colors, spacing, radius, iconSize, stylesText, rowDirection } = useDesignSystem();
  const sheetRef = useRef(null);
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.default;
  const ModalIcon = Icon;
  const iconColor = colors[config.iconColor];
  const iconBgColor = config.borderColor ? "transparent" : config.tinted ? `${iconColor}22` : colors.background;

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

  const handleCancel = () => {
    sheetRef.current?.dismiss();
    onCancel?.();
  };

  const handleConfirm = () => {
    onConfirm?.();
  };

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
        enableDynamicSizing
        handleIndicatorStyle={{ backgroundColor: colors.disabled }}
        backgroundStyle={{ backgroundColor: colors.surface }}
        backdropComponent={renderBackdrop}
        onDismiss={onDismiss}
      >
        <BottomSheetView style={{ padding: spacing.base, gap: spacing.base }}>
          <View style={{ flexDirection: rowDirection, alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: rowDirection, alignItems: "center", gap: spacing.sm, flex: 1 }}>
              <View
                style={{

                  padding: spacing.sm,
                  borderRadius: radius.md,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: iconBgColor,
                  borderWidth: config.borderColor ? 2 : 0,
                  borderColor: config.borderColor ? colors[config.borderColor] : undefined,
                }}
              >
                <ModalIcon color={iconColor} size={iconSize.md} />
              </View>

              {title && (
                <TranslationText
                  page={ResourcePage}
                  title={title}
                  style={[stylesText({ color: "title", size: "lg", weight: "bold" })]}
                />
              )}
            </View>

          </View>

          {des && (
            <TranslationText
              page={ResourcePage}
              title={des}
              style={[stylesText({ color: "text", size: "base", weight: "medium" })]}
            />
          )}

          {subDescription && (
            <TranslationText
              page={subDescResourcePage}
              title={subDescription}
              style={[stylesText({ color: "warning", size: "md", weight: "medium" })]}
            />
          )}

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md, gap: spacing.base }}>
            <CustomeBtn
              title={cancelText}
              type="cancel"
              style={{ flex: 1 }}
              ResourcePage={"GeneralActions"}
              onPress={handleCancel}
              size="btn_md"

            />
            <CustomeBtn
              title={confirmText}
              type={config.confirmBtnType}
              size="btn_md"
              style={{ flex: 1 }}
              isLoading={isLoadingConfirm}
              ResourcePage={ResourcePage}
              onPress={handleConfirm}
            />

          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
});

export default ConfirmationModal;
