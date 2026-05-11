import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '@/theme/tokens';
import { getFontFamily } from '@/theme/layout';

const URDU_NAME = 'پاکستان یونائیٹڈ ورکرز فیڈریشن';
const ENGLISH_NAME = 'Pakistan United Workers Federation';

export default function SplashScreen() {
  const insets = useSafeAreaInsets();

  // Animation values
  const logoProgress = useSharedValue(0);
  const textProgress = useSharedValue(0);
  const footerProgress = useSharedValue(0);
  const exitProgress = useSharedValue(0);

  useEffect(() => {
    // 1. Initial Logo Reveal (Scale & Fade)
    logoProgress.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) });

    // 2. Majestic Text Reveal (Slide & Fade) slightly delayed
    textProgress.value = withDelay(
      400,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.back(1.5)) })
    );

    // 3. Footer Tech Partner Branding Reveal
    footerProgress.value = withDelay(
      800,
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) })
    );

    // 4. Orchestrate the Exit after a readable hold
    exitProgress.value = withDelay(
      2800,
      withTiming(1, { duration: 500, easing: Easing.in(Easing.exp) }, (finished) => {
        if (finished) {
          runOnJS(router.replace)('/(role-select)');
        }
      })
    );
  }, [logoProgress, textProgress, footerProgress, exitProgress]);

  // Interpolated Styles
  const logoStyle = useAnimatedStyle(() => {
    const scale = interpolate(logoProgress.value, [0, 1], [0.8, 1]);
    const opacity = interpolate(logoProgress.value, [0, 1], [0, 1]);
    const exitScale = interpolate(exitProgress.value, [0, 1], [1, 1.2]);
    const exitOpacity = interpolate(exitProgress.value, [0, 1], [1, 0]);

    return {
      opacity: exitProgress.value > 0 ? exitOpacity : opacity,
      transform: [{ scale: exitProgress.value > 0 ? exitScale : scale }],
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const translateY = interpolate(textProgress.value, [0, 1], [20, 0]);
    const opacity = interpolate(textProgress.value, [0, 1], [0, 1]);
    const exitOpacity = interpolate(exitProgress.value, [0, 1], [1, 0], Extrapolation.CLAMP);

    return {
      opacity: exitProgress.value > 0 ? exitOpacity : opacity,
      transform: [{ translateY }],
    };
  });

  const footerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(footerProgress.value, [0, 1], [0, 0.7]);
    const exitOpacity = interpolate(exitProgress.value, [0, 1], [0.7, 0], Extrapolation.CLAMP);

    return {
      opacity: exitProgress.value > 0 ? exitOpacity : opacity,
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: tokens.background }}>
      <StatusBar style="dark" />
      
      {/* Main Content Centered */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 24 }}>
        
        {/* Animated Badge & Logo */}
        <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, logoStyle]}>
          <View
            style={{
              padding: 24,
              backgroundColor: tokens.card,
              borderRadius: 36,
              shadowColor: tokens.primary,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
              elevation: 10,
              borderWidth: 1,
              borderColor: tokens.border,
            }}
          >
            <Image
              source={require('../assets/images/puwf_logo.png')}
              style={{ width: 110, height: 110 }}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Animated Majestic Typography */}
        <Animated.View style={[{ alignItems: 'center', gap: 12 }, textStyle]}>
          <Text
            style={{
              color: tokens.primary,
              fontSize: 32,
              fontFamily: getFontFamily('700', 'document'), // NotoNastaliqUrdu_700Bold
              textAlign: 'center',
              paddingVertical: 20, // Critical to give room for tall Nastaliq ascenders/descenders
            }}
          >
            {URDU_NAME}
          </Text>
          <Text
            style={{
              color: tokens.mutedForeground,
              fontSize: 14,
              fontFamily: getFontFamily('600', 'ui'), // Lexend/Noto
              letterSpacing: 0.5,
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          >
            {ENGLISH_NAME}
          </Text>
        </Animated.View>
      </View>

      {/* Powered By Footer */}
      <Animated.View
        style={[
          {
            paddingBottom: Math.max(insets.bottom, 24),
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          },
          footerStyle,
        ]}
      >
        <Image
          source={require('../assets/images/fos_tree.png')}
          style={{ width: 24, height: 24, opacity: 0.8 }}
          resizeMode="contain"
        />
        <Text
          style={{
            color: tokens.mutedForeground,
            fontSize: 10,
            fontFamily: getFontFamily('700', 'ui'),
            letterSpacing: 1,
          }}
        >
          POWERED BY FOS
        </Text>
      </Animated.View>
    </View>
  );
}