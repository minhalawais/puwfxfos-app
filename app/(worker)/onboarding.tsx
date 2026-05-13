import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { OnboardingTextInput } from '@/features/worker-onboarding/components/onboarding-text-input';
import { unionMembers } from '@/data/mobile-mock-data';

import { useSessionStore } from '@/stores/session-store';
import { directionalText, textAlign, writingDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import { cnicSchema } from '@/validation/mobile-forms';

type LookupStatus = 'idle' | 'not_found' | 'not_affiliated';

const puwfAffiliatedUnions = new Set([
  'Green Clean Labour Union LWMC',
]);

function normalizeCnic(value: string) {
  return value.replace(/\D/g, '');
}

function formatCnic(value: string) {
  const digits = normalizeCnic(value);
  if (digits.length !== 13) return value;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}


export default function WorkerOnboardingScreen() {
  const { t } = useTranslation();
  const { completeWorkerOnboarding } = useSessionStore();
  const [cnic, setCnic] = useState('');
  const [status, setStatus] = useState<LookupStatus>('idle');
  const [error, setError] = useState<string | undefined>();

  function handleLookup() {
    const result = cnicSchema.safeParse(cnic);
    if (!result.success) {
      setError(t('workerLookup.validationCnic'));
      setStatus('idle');
      return;
    }

    setError(undefined);
    const cleaned = result.data;
    const found = unionMembers.find((member) => normalizeCnic(member.cnic) === cleaned);

    if (!found) {
      setStatus('not_found');
      return;
    }

    const isAffiliated = puwfAffiliatedUnions.has(found.union_name);

    if (isAffiliated) {
      // PUWF-registered union worker: complete onboarding immediately and go
      // straight to the Worker ID page — no intermediate data display.
      completeWorkerOnboarding({
        cnic: normalizeCnic(cnic),
        full_name: found.name,
        father_name: found.father_name,
        employer_name: found.company_name,
        establishment_name: found.company_name,
        designation: found.job_title,
        department: found.department,
        union_membership_status: found.membership_status === 'active' ? 'active_member' : 'not_member',
        worker_status: 'factory_worker',
      });
      router.replace({
        pathname: '/(worker)/redirecting',
        params: { unionName: found.union_name },
      });
      return;
    }

    setStatus('not_affiliated');
  }

  function handleGuidance() {
    router.push('/(worker)/rights');
  }




  return (
    <AppShell>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, gap: 16, flexGrow: 1 }}
      >
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Image source={require('../../assets/images/puwf_logo.png')} resizeMode="contain" style={{ width: 58, height: 58 }} />
          <Text style={{ color: tokens.foreground, fontSize: 18, ...directionalText('900') }}>{t('workerLookup.title')}</Text>
          <Text
            style={{
              color: tokens.mutedForeground,
              fontSize: 12,
              textAlign: textAlign(),
              writingDirection: writingDirection(),
            }}
          >
            {t('workerLookup.subtitle')}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: tokens.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: tokens.border,
            padding: 16,
            gap: 12,
          }}
        >
          <Text style={{ color: tokens.foreground, fontSize: 13, ...directionalText('800') }}>
            {t('workerLookup.cnicLabel')}
          </Text>
          <OnboardingTextInput
            value={formatCnic(cnic)}
            placeholder={t('workerLookup.cnicPlaceholder')}
            keyboardType="number-pad"
            error={error}
            onChangeText={(value) => {
              setCnic(value);
              if (error) setError(undefined);
            }}
          />
          <Pressable
            accessibilityRole="button"
            onPress={handleLookup}
            style={{
              minHeight: 48,
              borderRadius: 12,
              backgroundColor: tokens.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: tokens.primaryForeground, fontSize: 14, ...directionalText('900') }}>
              {t('workerLookup.actionCheck')}
            </Text>
          </Pressable>
        </View>

        {status !== 'idle' ? (
          <View
            style={{
              backgroundColor: tokens.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: tokens.border,
              padding: 16,
              gap: 12,
            }}
          >
            <Text style={{ color: tokens.foreground, fontSize: 14, ...directionalText('900') }}>
              {t(`workerLookup.status.${status}.title`)}
            </Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText('600') }}>
              {t(`workerLookup.status.${status}.body`)}
            </Text>

            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <Pressable
                accessibilityRole="button"
                onPress={handleGuidance}
                style={{
                  minHeight: 44,
                  borderRadius: 12,
                  backgroundColor: tokens.statusInfoBg,
                  paddingHorizontal: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: tokens.statusInfo, fontSize: 12, ...directionalText('900') }}>
                  {t('workerLookup.actionGuidance')}
                </Text>
              </Pressable>

            </View>
          </View>
        ) : null}
      </ScrollView>
    </AppShell>
  );
}
