import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/app-shell';
import { directionalText, textAlign, writingDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export default function WorkerRedirectingScreen() {
  const { t } = useTranslation();
  const { unionName } = useLocalSearchParams<{ unionName?: string }>();
  const resolvedUnionName = typeof unionName === 'string' && unionName.trim().length > 0
    ? unionName
    : t('workerLookup.redirectingFallbackUnion');

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(worker)/digital-id');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AppShell>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
          gap: 32,
          backgroundColor: '#ffffff',
        }}
      >
        {/* Success Icon / Logo Group */}
        <View style={{ alignItems: 'center', gap: 20 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#e6f7ee',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#03A64A',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Image 
              source={require('../../assets/images/puwf_logo.png')} 
              style={{ width: 64, height: 64 }} 
              resizeMode="contain" 
            />
          </View>
        </View>

        {/* Text Group */}
        <View style={{ gap: 14, alignItems: 'center' }}>
          <Text 
            style={{ 
              color: '#2E338C', 
              fontSize: 22, 
              textAlign: 'center',
              ...directionalText('900') 
            }}
          >
            {t('workerLookup.redirectingTitle')}
          </Text>
          <Text
            style={{
              color: '#6b7280',
              fontSize: 15,
              textAlign: 'center',
              lineHeight: 24,
              ...directionalText('600'),
            }}
          >
            {t('workerLookup.redirectingBody', { unionName: resolvedUnionName })}
          </Text>
        </View>

        {/* Loading Indicator Dots */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: '#03A64A',
                opacity: 0.4 + (i * 0.3),
              }}
            />
          ))}
        </View>
      </View>
    </AppShell>
  );
}
