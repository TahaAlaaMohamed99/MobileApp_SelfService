import { useSelector } from 'react-redux';
import { Toast } from 'toastify-react-native';
import { useDesignSystem } from './useDesignSystem';
import useTranslationText from './useTranslationText';

const useToast = () => {
  const { currentLanguage } = useDesignSystem();
  const ReduxResources = useSelector((state) => state.resourcesSlice.ReduxResources);

  const translate = (title, page) =>
    title
      ? useTranslationText({ page, title, lang: currentLanguage, Resources: ReduxResources })
      : undefined;

  const showToast = (type) => (text1, text2, resourcePage) => {
     Toast.show({
      type,
      text1: translate(text1, resourcePage),
      text2: translate(text2, resourcePage),
    });
  };

  return {
    success: showToast('success'),
    error: showToast('error'),
    warning: showToast('warning'),
    info: showToast('info'),
    notification: (notif, onPress) =>
      Toast.show({
        type: 'notification',
        props: { notif },
        onPress,
        duration: 10000,
      }),
  };
};

export default useToast;
