import { useCallback, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, I18nManager, ScrollView, RefreshControl } from 'react-native';
import { useDispatch } from 'react-redux';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { useDesignSystem } from '../../../../hooks/useDesignSystem';
import { useUserData } from '../../../../hooks/useUserData';
import { useFormatDate as formatDateValue } from '../../../../hooks/useFormatDate';
import TranslationText from '../../../../components/TranslationText';
import AutoFontText from '../../../../components/AutoFontText';
import InfoItem from '../../../../components/InfoItem';
import DropdownActions from '../../../../components/DropdownActions';
import ConfirmationModal from '../../../../components/ConfirmationModal';
import CustomSwitch from '../../../../components/Form/CustomSwitch';
import ProfileSkeleton from '../../../../components/Skeleton/ProfileSkeleton';
import { IconLogout, IconMoon, IconMoonOutline, IconBuilding, IconBriefcase, IconFingerprint, IconCalendar, IconIdCard, IconLanguage, IconChevronDown, IconMale, IconFemale, IconReligion, IconDisability, IconHealthInsurance, IconMaritalStatus, IconLocation, IconEdit, IconBank, IconArrow, IconChangePass } from '../../../../assets/IconsSvg';
import { setCurrentLanguage, setTheme } from '../../../../store/themeSlice';
import * as SecureStore from 'expo-secure-store';
import useGetData from '../../../../hooks/useGetData';
import useGetGenerallist from '../../../../hooks/useGetGenerallist';
import { createStyles } from '../../../../components/ProfileStyles';
import useImage from '../../../../hooks/useImage';

export default function ProfileScreen() {
  const { colors, spacing, radius, text, currentShadow, globalStyles, stylesText, rowDirection, iconSize, isDark, currentLanguage, rf } = useDesignSystem();
  const { EmployeeName } = useUserData();
  const formatDate = (value) => formatDateValue(value, currentLanguage);
  const dispatch = useDispatch();
  const logoutModalRef = useRef(null);
  const [data, setData] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [genderList, setGenderList] = useState([])
  const [religionList, setReligionList] = useState([])
  const [maritalStatusList, setMaritalStatusList] = useState([])
  const [noYesList, setNoYesList] = useState([])
  const { getMultipleGenerallists } = useGetGenerallist()

  const fetchData = useGetData(
    `Employee/GetMyProfile`,
    setIsLoading,
    setData,
    null,
  );
  useFocusEffect(
    useCallback(() => {
      fetchData();
      getMultipleGenerallists([
        { name: 'Gender', setList: setGenderList },
        { name: 'Religion', setList: setReligionList },
        { name: 'MaritalStatus', setList: setMaritalStatusList },
        { name: 'NoYes', setList: setNoYesList },
      ], setIsLoading);
    }, [])
  );
  const imageUri = useImage(data?.profileImagePath);

  const getLabel = (list, value) => {
    return list.find(item => item.value === value)?.label || '';
  };

  const handleLogout = async () => {
    logoutModalRef.current?.dismiss();
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await AsyncStorage.removeItem('user');
    router.replace('/(auth)/login')
  };

  const handleLanguageChange = async (lang) => {
    dispatch(setCurrentLanguage(lang));
    await AsyncStorage.setItem('language', lang);
    I18nManager.allowRTL(lang == "ar");
    I18nManager.forceRTL(lang == "ar");
    await Updates.reloadAsync();
  };
  const handleThemeToggle = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
    AsyncStorage.setItem('theme', newTheme);
  };

  const languageMenuItems = [
    { label: 'en', onClick: () => handleLanguageChange('en'), isActive: currentLanguage === 'en' },
    { label: 'ar', onClick: () => handleLanguageChange('ar'), isActive: currentLanguage === 'ar' },
  ];
  const styles = createStyles({ colors, spacing, radius, currentShadow, rowDirection, rf });

  if (isLoading) {
    return (
      <View style={[globalStyles.container, styles.container]}>
        <ProfileSkeleton />
      </View>
    );
  }
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}

      style={globalStyles.container} contentContainerStyle={{ paddingVertical: spacing.lg }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={fetchData} tintColor={colors.primary} colors={[colors.primary]} progressBackgroundColor={colors.background} />}
    >
      <View style={styles.profileCard}>
        {imageUri ? (
          <Image resizeMode="cover"
            source={{ uri: imageUri }} style={styles.avatar} />
        ) : (
          <Image
            source={data.gender == 1 ? require('../../../../assets/images/avatarMan.png') : require('../../../../assets/images/avatarWoman.png')}
            style={styles.avatar}
          />
        )}
        <View style={styles.identityWrapper}>
          <AutoFontText
            value={EmployeeName}
            color="title"
            size="base"
            weight="bold"
            style={{ textTransform: "capitalize" }}
          />
          {data?.positionName && (
            <AutoFontText
              value={data?.positionName}
              color="primary"
              size="sm"
              weight="medium"
              style={{ textTransform: "capitalize" }}
              numberOfLines={1}
            />
          )}
          {data?.email && (
            <Text style={[stylesText({ color: 'text', size: 'xs', weight: 'medium' }), { textTransform: "capitalize" }]} numberOfLines={1}>
              {data?.email}
            </Text>
          )}
        </View>
      </View>
      <View style={[styles.section]}>
        <View style={styles.idCardsRow}>
          {data?.personalNumber && (
            <View style={styles.idCard}>
              <IconIdCard color={colors.text} size={iconSize.md} />
              <View style={styles.idCardHeader}>
                <TranslationText page="GeneralField" title="personalNumber" style={stylesText({ color: 'text', size: 'sm', weight: 'medium' })} />
                <Text style={stylesText({ color: 'primary', size: 'lg', weight: 'semiBold' })}>{data?.personalNumber}</Text>
              </View>
            </View>
          )}
          {data?.employeeFingerprint && (
            <View style={styles.idCard}>
              <IconFingerprint color={colors.text} size={iconSize.md} />

              <View style={styles.idCardHeader}>
                <TranslationText page="Profile" title="fingerprintId" style={stylesText({ color: 'text', size: 'sm', weight: 'medium' })} />
                <Text style={stylesText({ color: 'primary', size: 'lg', weight: 'semiBold' })}>{data?.employeeFingerprint}</Text>

              </View>
            </View>
          )}
        </View>
        <View style={styles.infoCard}>
          <InfoItem page="Department" Icon={IconBuilding} label="title" value={data?.departmentName} titleCase />
          <InfoItem page="Job" Icon={IconBriefcase} label="title" value={data?.positionJobName} titleCase />
          <InfoItem page="Profile" Icon={IconCalendar} label="dateOfAppointment" value={data?.startDate ? formatDate(data.startDate) : ''} last />
        </View>
      </View>
      <View style={[styles.section]}>
        <TranslationText page="Profile" title="personalInfo" style={[stylesText({ color: 'title', size: 'md', weight: 'semiBold' }), { marginBottom: spacing.xs }]} />
        <View style={styles.infoCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm }}>
            {data?.gender && (
              <View style={{ width: '50%' }}>
                <InfoItem page="Generallist?.Gender" Icon={data?.gender == 1 ? IconMale : IconFemale} label="title" value={getLabel(genderList, data.gender)} />
              </View>
            )}
            {data?.religion && (
              <View style={{ width: '50%' }}>
                <InfoItem page="Generallist?.Religion" Icon={IconReligion} label="title" value={getLabel(religionList, data.religion)} />
              </View>
            )}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm }}>
            <View style={{ width: '50%' }}>
              <InfoItem page="Generallist?.MaritalStatus" Icon={IconMaritalStatus} label="title" value={getLabel(maritalStatusList, data.maritalStatus)} />
            </View>
            <View style={{ width: '50%' }}>
              <InfoItem page="Generallist?.NoYes" Icon={IconDisability} label="withDisability" value={getLabel(noYesList, data?.withDisability || 1)} />
            </View>
          </View>
          {data?.hasInclusiveMedicalInsurance !== undefined && (
            <InfoItem page="Generallist?.NoYes" Icon={IconHealthInsurance} label="hasInclusiveMedicalInsurance" value={getLabel(noYesList, data.hasInclusiveMedicalInsurance)} last />
          )}
        </View>
        <TouchableOpacity style={[styles.actionRow]} onPress={() => router.push('/Profile/EmployeeAddress')}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <IconLocation size={iconSize.md} color={colors.text} />
            <View>
              <TranslationText
                page="Profile"
                title="address"
                style={stylesText({ color: 'title', size: 'base', weight: 'semiBold' })}
              />
              {data?.address && (
                <AutoFontText
                  value={data?.address}
                  color="title"
                  size="xs"
                  weight="medium"
                  style={{ textTransform: "capitalize" }}
                  numberOfLines={1}
                />)}
            </View>
          </View>
          <IconEdit size={iconSize.sm} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionRow]} onPress={() => router.push('/Profile/EmployeeBank')}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <IconBank size={iconSize.md} color={colors.text} />
            <View >
              <TranslationText
                page="Profile"
                title="bank"
                style={stylesText({ color: 'title', size: 'base', weight: 'semiBold' })}
              />
              {data?.bank && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <AutoFontText
                    value={data?.bank?.bankName}
                    color="title"
                    size="xs"
                    weight="medium"
                    style={{ textTransform: "capitalize" }}
                    numberOfLines={1}
                  />
                  {data?.bank?.bankAccount && (
                    <Text style={stylesText({ color: 'primary', size: 'sm', weight: 'bold' })}>
                      ({data.bank.bankAccount.slice(0, 4) + '*'.repeat(Math.max(0, data.bank.bankAccount.length - 4))})
                    </Text>
                  )}
                </View>
              )}

            </View>
          </View>
          <IconEdit size={iconSize.sm} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={[styles.section]}>
        <TranslationText page="Profile" title="preferences" style={[stylesText({ color: 'title', size: 'md', weight: 'semiBold' }), { marginBottom: spacing.xs }]} />
        <View style={styles.actionsList}>
          <DropdownActions
            style={styles.actionRow}
            activeStyle={{ backgroundColor: colors.background }}
            isArrow={true}
            btn={
              <View style={styles.actionLabel}>
                <IconLanguage size={iconSize.md} color={colors.text} />
                <TranslationText
                  page="GeneralActions"
                  title="language"
                  style={stylesText({ color: 'title', size: 'base', weight: 'semiBold' })}
                />
                <Text style={stylesText({ color: 'text', size: 'sm' })}>({currentLanguage})</Text>
              </View>

            }
            icon={<IconChevronDown size={iconSize.sm} color={colors.text} />}
            menuItems={languageMenuItems}
          />
          <View style={styles.actionRow}>
            <View style={styles.actionLabel}>
              {isDark ? (
                <IconMoon color={colors.text} size={iconSize.md} />
              ) : (
                <IconMoonOutline color={colors.text} size={iconSize.md} />
              )}
              <TranslationText
                page="GeneralActions"
                title="dark"
                style={stylesText({ color: 'title', size: 'md', weight: 'semiBold' })}
              />
            </View>
            <CustomSwitch value={isDark} onValueChange={handleThemeToggle} />
          </View>
          <TouchableOpacity style={[styles.actionRow]} onPress={() => router.push('/Profile/ResetPassword')}>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <IconChangePass size={iconSize.md} color={colors.text} />
              <View >
                <TranslationText
                  page="registration"
                  title="resetPassword"
                  style={stylesText({ color: 'title', size: 'base', weight: 'semiBold' })}
                />


              </View>
            </View>
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <IconArrow size={iconSize.sm} color={colors.text} />
            </View>
          </TouchableOpacity>
          <ConfirmationModal
            ref={logoutModalRef}
            type="delete"
            icon={IconLogout}
            title="logout"
            des="confirmLogout"
            ResourcePage="GeneralActions"
            confirmText="logout"
            onConfirm={handleLogout}
            btn={
              <TouchableOpacity style={[styles.actionRow, { marginTop: spacing.md }]} onPress={() => logoutModalRef.current?.present()}>
                <View style={styles.actionLabel}>
                  <IconLogout color={colors.error} size={iconSize.md} />
                  <TranslationText
                    page="GeneralActions"
                    title="logout"
                    style={stylesText({ color: 'error', size: 'md', weight: 'semiBold' })}
                  />
                </View>
              </TouchableOpacity>
            }
          />
        </View>
      </View>

    </ScrollView>
  );
}
