import { View, StyleSheet, Linking, Text, ImageBackground } from 'react-native';
import Constants from 'expo-constants';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useDesignSystem } from '../hooks/useDesignSystem';
import TranslationText from './TranslationText';
import CustomeBtn from './CustomeBtn';
import { LogoIcon } from '../assets/IconsSvg';
import coverVersion from '../assets/images/coverVersion.png';

export function UpdateApp({ visible, latestVersion, onClose }) {
  const { colors, spacing, rf, stylesText } = useDesignSystem();
  const googlePlayUrl = Constants.expoConfig?.extra?.Google_Play_url;

  if (!visible) return null;

  const handleUpdate = () => {
    if (googlePlayUrl) {
      Linking.openURL(googlePlayUrl);
    }
  };

  const styles = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.surface,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxxl,

      gap: spacing.xl,
      zIndex: 9999,
    },

    badgeLabel: {
      ...stylesText({ size: 'base', weight: 'bold', color: 'primary' }),
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    titleContainer: {
      alignItems: 'center',
      gap: spacing.md,
      maxWidth: '90%',
    },
    title: {
      ...stylesText({ size: 'md', weight: 'medium', color: 'title' }),
      textAlign: 'center',
    },

    buttonContainer: {
      width: '100%',
      gap: spacing.md,
      textAlign: 'center',

    },
  });

  return (
    <ImageBackground
      source={coverVersion}
      style={styles.container}
      imageStyle={{ transform: [{ scale: 1.05 }] }}
    >
      <BlurView intensity={85} style={{ ...StyleSheet.absoluteFillObject }}>
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: colors.surface, opacity: 0.75 }} />
        <LinearGradient
          colors={[colors.surface + '85', colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ ...StyleSheet.absoluteFillObject }}
        />
      </BlurView>

      <View style={{ 
         justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.xl }}>
        <LogoIcon
          width={rf(100)}
          height={rf(100)}
          colors={{
            dark: colors.primary,
            darkLine: colors.primary,
            light: colors.primary,
          }}
        />

      <TranslationText
        page="GeneralMessages"
        title="newVersionAvailable"
        style={styles.badgeLabel}
      />

      <View style={styles.titleContainer}>
        <TranslationText
          page="GeneralMessages"
          title="updateAvailable"
          style={styles.title}
        />

      </View>
      <View style={{ alignItems: 'center', flexDirection: 'row' }}>
        <Text style={stylesText({ size: 'sm', weight: 'medium', color: 'text' })}>
          <TranslationText
            page="GeneralMessages"
            title="updateVersion"

          />

          :
        </Text>

        <Text style={stylesText({ size: 'md', weight: 'bold', color: 'primary' })}>
          V{latestVersion?.number}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <CustomeBtn
          title="updateNow"
          onPress={handleUpdate}
          type="primary"
          size="btn_lg"
          ResourcePage="GeneralActions"
        />
        <TranslationText
          page="GeneralMessages"
          title="cannotContinueWithoutUpdating"
          style={[stylesText({ size: 'sm', weight: 'medium', color: 'text' }), { textAlign: 'center' }]}
        />
      </View>
      </View>
    </ImageBackground>
  );
}
