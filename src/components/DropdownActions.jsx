import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import TranslationText from "./TranslationText";
import { useDesignSystem } from "../hooks/useDesignSystem";
import { AngleArrow } from "../assets/IconsSvg";

export default function DropdownActions({
  style,
  activeStyle,
  icon,
  ResourcePage = "",
  title,
  menuItems = [],
  userImg,
  description,
  userTitle,
  onOpenChange,
  btn,
  isArrow = false
}) {
  const { colors, spacing, radius, rowDirection, iconSize, stylesText } =
    useDesignSystem();
  const [isOpen, setIsOpen] = useState(false);
  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(
    () => (menuItems.length > 3 ? ["32%", "45%"] : ["32%"]),
    [menuItems.length]
  );

  const openSheet = () => {
    setIsOpen(true);
    onOpenChange?.(true);
    bottomSheetRef.current?.present();
  };

  const handleItemPress = (item) => {
    bottomSheetRef.current?.dismiss();
    item.onClick?.();
  };

  const renderBackDrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );
  const renderItem = ({ item }) => {
    const Icon = item.icon;
    const iconColor = item.color ? colors[item.color] || item.color : (item.isActive ? colors.primary : colors.text);

    return (<TouchableOpacity
      onPress={() => handleItemPress(item)}
      style={[
        {
          flexDirection: rowDirection,
          alignItems: "center",
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.md,
          borderRadius: radius.md,
          backgroundColor: item.isActive ? colors.background : "transparent",
        },
        item.style,
      ]}
    >
      {Icon && (
        <View style={{ marginEnd: spacing.sm }}>
          <Icon color={iconColor} size={iconSize.md} />
        </View>
      )}
      <TranslationText
        page={ResourcePage}
        title={item.label}
        style={[
          stylesText({ color: item.isActive ? "primary" : item.color ?? "text", size: "base", weight: "medium" }),
          { textTransform: "capitalize" },
        ]}
      />
    </TouchableOpacity>
    );

  }


  return (
    <>
      <TouchableOpacity
        style={[
          { flexDirection: rowDirection, alignItems: "center", justifyContent: "space-between", },
          style,
          isOpen && activeStyle,
        ]}
        onPress={openSheet}
      >
        {btn ?
          btn
          : (<View style={{ flexDirection: rowDirection, alignItems: "center" }}>
            {icon && <View>{icon}</View>}
            {title && <Text style={stylesText({ color: "title" })}>{title}</Text>}
          </View>)
        }
        {isArrow &&
          <View style={{ transform: [{ rotate: isOpen ? '-90deg' : '90deg' }] }} >
            <AngleArrow color={colors.text} size={iconSize.md} />
          </View>
        }

      </TouchableOpacity>

      {menuItems.length > 0 && (
        <BottomSheetModal
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          handleIndicatorStyle={{ backgroundColor: colors.disabled }}
          backgroundStyle={{ backgroundColor: colors.surface }}
          backdropComponent={renderBackDrop}
          onDismiss={() => {
            setIsOpen(false);
            onOpenChange?.(false);
          }}
        >
          <BottomSheetFlatList
            data={menuItems}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={{
              paddingHorizontal: spacing.base,
              paddingBottom: spacing.lg,
              gap: spacing.xs,
            }}
          />
        </BottomSheetModal>
      )}
    </>
  );
}
