import { useCallback, useState } from 'react';
import { ScrollView, TouchableOpacity, View, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useDesignSystem } from '../../../../hooks/useDesignSystem';
import { Pages } from '../../../../ConfigData/Pages';
import TranslationText from '../../../../components/TranslationText';
import CheckInCard from '../../../../components/CheckInCard';
import * as Location from 'expo-location';
import useToast from '../../../../hooks/useToast';
import { getApi } from '../../../../services/Api';
import { getCurrentDate } from '../../../../hooks/useFormatDate';
import dayjs from 'dayjs';
import { FlashList } from "@shopify/flash-list";
import { WidgetsDashboard } from '../../../../ConfigData/WidgetsDashboard';
import CardQuickTransaction from '../../../../components/CardQuickTransaction';
import CardWidget from '../../../../components/CardWidget';
export default function DashboardScreen() {
  const [status, requestPermission] = Location.useForegroundPermissions();
  const { colors, spacing, radius, shadows, globalStyles, getGridColumns, getCardWidth } = useDesignSystem();
  const toast = useToast();
   const api = getApi();
  
  const [fingPrintData, setFingPrintData] = useState({});
  const [isLoadingCheckInCard, setIsLoadingCheckInCard] = useState(false);
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);

  const resolveLocation = async () => {
    if (!status?.granted) {
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      return null;
    }
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      return null;
    }
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    if (Platform.OS === 'android' && loc.mocked === true) {
      toast.warning('mockedLocation', null, 'Dashboard');
      return null;
    }
    const { latitude, longitude } = loc.coords;
    return { latitude, longitude };
  };

  const getDataFingPrint = () => {
    setIsLoadingCheckInCard(true)
    api.get('DailyAttendance/GetMyTodayAttendanceSummary').then((res) => {
       setFingPrintData(res)
    }).catch((error) => {
      console.log(error, 'error');
    }).finally(() => {
      setIsLoadingCheckInCard(false);
    });
  };
  useFocusEffect(
    useCallback(() => {
      getDataFingPrint();
    }, [])
  );
  const handleCheckFingPrint = async () => {
    setIsLoadingBtn(true);

    if (!status?.granted) {
      requestPermission();
    }

    if (isLoadingCheckInCard) return;
    const location = await resolveLocation();
    if (!location) {
      setIsLoadingBtn(false);
      return;
    }
    api.post('DailyAttendance/MobileAttendanceCheck', {
      latitude: location.latitude,
      longitude: location.longitude,
    }).then((res) => {
      const data = res?.data;
      if (data?.message == 200) {
        setIsLoadingBtn(false);
        getDataFingPrint();
        toast.success('SuccessFingPrint', null, 'GeneralMessages')
      } else {
        toast.error(data?.messageText);
        setIsLoadingBtn(false);
      }
    }).catch((e) => {
      toast.error('checkInFailed');

    }).finally(() => {
      setIsLoadingBtn(false);
    });
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}

      style={globalStyles.container} contentContainerStyle={{ paddingVertical: spacing.lg }}>
      <CheckInCard
        FingPrintData={fingPrintData}
        handleCheckFingPrint={handleCheckFingPrint}
        isLoadingBtn={isLoadingBtn}
        isLoading={isLoadingCheckInCard}
        style={globalStyles.Sections}
      />
      <View style={globalStyles.Sections} >
        <FlashList
          data={WidgetsDashboard?.summary}
          numColumns={2}

          overrideItemLayout={(layout, item) => {
            layout.span = item.fullWidth ? 2 : 1;
          }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          renderItem={({ item, index }) => (
            <View
              style={{
                paddingInlineStart: item.fullWidth ? 0 : index % 2 === 0 ? 0 : 6,
                paddingInlineEnd: item.fullWidth ? 0 : index % 2 === 0 ? 6 : 0,
              }}
            >
              <CardWidget card={item} />
            </View>
          )}
        />

      </View>
      <View style={globalStyles.Sections} >
        <TranslationText style={globalStyles.titleSections} page="Dashboard"
          title={'requestTransactions'} />
        <FlashList
          horizontal
          data={WidgetsDashboard?.RequestTransactions}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => (
            <View style={{ width: spacing.base }} />
          )}
          renderItem={({ item }) => (
            <CardQuickTransaction transaction={item} />
          )}
        />
      </View>

    </ScrollView>
  );
}