import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Image, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { AnswerOptionCard } from '@/features/worker-onboarding/components/answer-option-card';
import { OnboardingTextInput } from '@/features/worker-onboarding/components/onboarding-text-input';
import { PrivacyNote } from '@/features/worker-onboarding/components/privacy-note';
import { ProgressHeader } from '@/features/worker-onboarding/components/progress-header';
import { QuestionCard } from '@/features/worker-onboarding/components/question-card';
import { StickyNavigationActions } from '@/features/worker-onboarding/components/sticky-navigation-actions';
import { workerOnboardingQuestions } from '@/features/worker-onboarding/questions';
import { workerOnboardingStepSchemas } from '@/features/worker-onboarding/schemas/worker-onboarding-schema';
import type { WorkerOnboardingAnswerValue, WorkerOnboardingDraft, WorkerOnboardingField } from '@/features/worker-onboarding/types';
import { getWorkerOnboardingNextRoute } from '@/features/worker-onboarding/utils/route-decision';
import { useLocaleStore, type AppLocale } from '@/stores/locale-store';
import { useSessionStore } from '@/stores/session-store';
import { textAlign } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

function getFieldValue(draft: WorkerOnboardingDraft, field: WorkerOnboardingField): WorkerOnboardingAnswerValue {
  return draft[field];
}

export default function WorkerOnboardingScreen() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const { setLocale } = useLocaleStore();
  const { workerOnboardingDraft, updateWorkerOnboardingDraft, completeWorkerOnboarding } = useSessionStore();
  const form = useForm<WorkerOnboardingDraft>({ defaultValues: workerOnboardingDraft });

  const question = workerOnboardingQuestions[step];
  const total = workerOnboardingQuestions.length;
  const isLast = step === total - 1;
  const watchedDraft = form.watch();
  const currentValue = getFieldValue(watchedDraft, question.field);
  const fieldError = form.formState.errors[question.field]?.message;

  const completionDraft = useMemo(() => ({ ...workerOnboardingDraft, ...watchedDraft }), [watchedDraft, workerOnboardingDraft]);

  function setAnswer(field: WorkerOnboardingField, value: WorkerOnboardingAnswerValue) {
    form.setValue(field, value as never, { shouldDirty: true, shouldValidate: false });
    form.clearErrors(field);
    updateWorkerOnboardingDraft({ [field]: value });

    if (field === 'preferred_language' && (value === 'ur' || value === 'en')) {
      setLocale(value as AppLocale);
    }
  }

  function validateCurrentStep() {
    const schema = workerOnboardingStepSchemas[question.field];
    const value = getFieldValue(form.getValues(), question.field);
    const result = schema?.safeParse(value);

    if (!result?.success) {
      const issueMessage = result?.error.issues[0]?.message;
      const messageKey = issueMessage?.startsWith('onboarding.validation.') ? issueMessage : 'onboarding.validation.required';
      form.setError(question.field, { type: 'validate', message: t(messageKey) });
      return false;
    }

    form.clearErrors(question.field);
    return true;
  }

  function goBack() {
    updateWorkerOnboardingDraft(form.getValues());
    setStep((value) => Math.max(0, value - 1));
  }

  function goNext() {
    if (!validateCurrentStep()) return;

    const nextDraft = { ...workerOnboardingDraft, ...form.getValues() };
    updateWorkerOnboardingDraft(nextDraft);

    if (isLast) {
      completeWorkerOnboarding(nextDraft);
      router.replace(getWorkerOnboardingNextRoute(nextDraft));
      return;
    }

    setStep((value) => value + 1);
  }

  return (
    <AppShell>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, gap: 16, flexGrow: 1 }}
        >
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Image source={require('../../assets/images/puwf_logo.png')} resizeMode="contain" style={{ width: 58, height: 58 }} />
          </View>

          <ProgressHeader
            current={step + 1}
            total={total}
            eyebrow={t('onboarding.eyebrow')}
            title={t('onboarding.flowTitle')}
          />

          <QuestionCard
            title={t(question.titleKey)}
            description={t(question.descriptionKey)}
            source={t(question.sourceKey)}
          />

          <View style={{ gap: 10 }}>
            {question.kind === 'select'
              ? question.options?.map((option) => (
                  <AnswerOptionCard
                    key={String(option.value)}
                    title={t(option.labelKey)}
                    description={t(option.descriptionKey)}
                    selected={currentValue === option.value}
                    onPress={() => setAnswer(question.field, option.value)}
                  />
                ))
              : (
                  <OnboardingTextInput
                    value={typeof currentValue === 'string' ? currentValue : ''}
                    placeholder={question.placeholderKey ? t(question.placeholderKey) : ''}
                    keyboardType={question.keyboardType}
                    error={fieldError}
                    onChangeText={(value) => setAnswer(question.field, value)}
                  />
                )}
          </View>


          <View style={{ marginTop: 'auto', gap: 12 }}>
            <PrivacyNote text={t(getWorkerOnboardingNextRoute(completionDraft) === '/(worker)/grievances' ? 'onboarding.routeHints.grievance' : 'onboarding.routeHints.standard')} />
            <StickyNavigationActions
              backLabel={t('common.back')}
              nextLabel={isLast ? t('common.finish') : t('common.next')}
              finish={isLast}
              disableBack={step === 0}
              onBack={goBack}
              onNext={goNext}
            />
            <View style={{ minHeight: 18 }}>
              {fieldError ? null : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppShell>
  );
}
