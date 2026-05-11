import { Mic, Paperclip, Send, Siren } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { SectionCard } from '@/components/section-card';
import { GrievanceCaseCard, Timeline } from '@/features/worker-portal/components';
import { useSubmitWorkerGrievance, useWorkerGrievances, useConfirmResolutionMutation } from '@/services/worker-service';
import { workerGrievanceDraftSchema } from '@/validation/mobile-forms';
import { directionalText, rowDirection, textAlign, writingDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import type { GrievanceCategory, GrievanceDraft } from '@/types/domain';

const categories: GrievanceCategory[] = ['wages', 'termination', 'safety', 'harassment', 'union_rights', 'eobi_social_security'];

export default function GrievancesScreen() {
  const { t } = useTranslation();
  const { data = [], isLoading, isError } = useWorkerGrievances();
  const submitGrievance = useSubmitWorkerGrievance();
  const confirmResolution = useConfirmResolutionMutation();
  const [draft, setDraft] = useState<GrievanceDraft>({
    category: 'wages',
    priority: 'urgent',
    employer_name: 'LWMC',
    establishment_name: 'Zone V Workshop',
    description: '',
    voice_note_attached: false,
    attachment_count: 0,
  });
  const [error, setError] = useState('');

  function submit() {
    const result = workerGrievanceDraftSchema.safeParse(draft);
    if (!result.success) {
      setError(t(result.error.issues[0]?.message ?? 'grievance.validation.description'));
      return;
    }
    setError('');
    submitGrievance.mutate(draft);
  }

  return (
    <AppShell>
      <HeaderBar title={t('worker.grievances')} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <SectionCard title={t('grievance.new')}>
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, ...directionalText('800') }}>{t('workerPortal.grievance.chooseCategory')}</Text>
          <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
            {categories.map((category) => (
              <Pressable key={category} accessibilityRole="button" accessibilityLabel={t(`grievance.categories.${category}`)} onPress={() => setDraft((value) => ({ ...value, category }))} style={{ minHeight: 44, borderRadius: 999, paddingHorizontal: 12, justifyContent: 'center', backgroundColor: draft.category === category ? tokens.secondary : tokens.card, borderWidth: 1, borderColor: draft.category === category ? tokens.portalWorker : tokens.border }}>
                <Text style={{ color: draft.category === category ? tokens.portalWorker : tokens.mutedForeground, ...directionalText('900') }}>{t(`grievance.categories.${category}`)}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            multiline
            accessibilityLabel={t('grievance.placeholder')}
            placeholder={t('grievance.placeholder')}
            placeholderTextColor={tokens.mutedForeground}
            value={draft.description}
            onChangeText={(description) => setDraft((value) => ({ ...value, description }))}
            style={{ minHeight: 98, borderWidth: 1, borderColor: error ? tokens.statusError : tokens.border, borderRadius: 12, padding: 12, color: tokens.foreground, textAlignVertical: 'top', textAlign: textAlign(), writingDirection: writingDirection(), backgroundColor: tokens.card }}
          />
          {error ? <Text style={{ color: tokens.statusError, ...directionalText('800') }}>{error}</Text> : null}
          <View style={{ flexDirection: rowDirection(), gap: 8 }}>
            <AttachmentButton icon={Mic} label={t('grievance.voice')} active={draft.voice_note_attached} onPress={() => setDraft((value) => ({ ...value, voice_note_attached: !value.voice_note_attached }))} />
            <AttachmentButton icon={Paperclip} label={t('grievance.attach')} active={draft.attachment_count > 0} onPress={() => setDraft((value) => ({ ...value, attachment_count: value.attachment_count ? 0 : 1 }))} />
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={t('grievance.submit')} onPress={submit} style={{ minHeight: 50, backgroundColor: tokens.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: rowDirection(), gap: 8 }}>
            <Send size={18} color={tokens.primaryForeground} />
            <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{submitGrievance.isPending ? t('workerPortal.grievance.submitting') : t('grievance.submit')}</Text>
          </Pressable>
          {submitGrievance.data ? <Text style={{ color: tokens.statusSuccess, ...directionalText('900') }}>{t('workerPortal.grievance.submitted', { ref: submitGrievance.data.reference_no })}</Text> : null}
        </SectionCard>

        <DataState loading={isLoading} error={isError} empty={data.length === 0} loadingLabel={t('states.loading')} errorLabel={t('states.error')} emptyLabel={t('workerPortal.grievance.empty')}>
          <SectionCard title={t('workerPortal.grievance.activeCases')}>
            <View style={{ gap: 10 }}>
              {data.map((item) => (
                <GrievanceCaseCard 
                  key={item.id} 
                  grievance={item} 
                  onConfirmResolution={(id, satisfied) => confirmResolution.mutate({ grievanceId: id, satisfied })}
                  isConfirming={confirmResolution.isPending}
                />
              ))}
            </View>
          </SectionCard>
        </DataState>
      </ScrollView>
    </AppShell>
  );
}

function AttachmentButton({ icon: Icon, label, active, onPress }: { icon: typeof Siren; label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={{ minHeight: 48, flex: 1, borderWidth: 1, borderColor: active ? tokens.portalWorker : tokens.border, borderRadius: 12, padding: 12, alignItems: 'center', flexDirection: rowDirection(), justifyContent: 'center', gap: 8, backgroundColor: active ? tokens.statusInfoBg : tokens.card }}>
      <Icon size={18} color={tokens.primary} />
      <Text style={{ color: tokens.primary, ...directionalText('900') }}>{label}</Text>
    </Pressable>
  );
}
