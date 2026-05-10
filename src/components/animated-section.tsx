import Animated, { FadeInUp, useReducedMotion } from 'react-native-reanimated';

export function AnimatedSection({ children, index = 0 }: { children: React.ReactNode; index?: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <Animated.View entering={reduceMotion ? undefined : FadeInUp.delay(index * 35).duration(240)}>
      {children}
    </Animated.View>
  );
}
