import { BadgeCheck, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { SectionCard } from '@/components/section-card';
import { StatusChip } from '@/components/status-chip';
import { CandidateCard } from '@/features/worker-portal/components';
import { useConfirmWorkerVote, useWorkerElections } from '@/services/worker-service';
import { directionalText, rowDirection, textAlign, writingDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export default function VotingScreen() {
  const { t } = useTranslation();
  const { data = [], isLoading, isError } = useWorkerElections();
  const confirmVote = useConfirmWorkerVote();
  const election = data[0];
  const [candidateId, setCandidateId] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  function castVote() {
    if (!election) return;
    if (!candidateId) {
      setError(t('workerPortal.voting.validation.candidate'));
      return;
    }
    if (!/^\d{4,6}$/.test(otp)) {
      setError(t('workerPortal.voting.validation.otp'));
      return;
    }
    setError('');
    confirmVote.mutate({ electionId: election.id, candidateId, otp });
  }

  return (
    <AppShell>
      <HeaderBar title={t('worker.vote')} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <DataState loading={isLoading} error={isError} empty={!election} loadingLabel={t('states.loading')} errorLabel={t('states.error')} emptyLabel={t('workerPortal.voting.empty')}>
          {election ? (
            <>
              <SectionCard title={t(election.title_key)}>
                <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
                  <StatusChip tone={election.status === 'open' ? 'success' : 'warning'} label={t(`status.election.${election.status}`)} />
                  <StatusChip tone={election.eligible ? 'success' : 'error'} label={election.eligible ? t('workerPortal.voting.eligible') : t('workerPortal.voting.notEligible')} />
                </View>
                <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{election.start_date} - {election.end_date}</Text>
              </SectionCard>
              <SectionCard title={t('workerPortal.voting.candidates')}>
                <View style={{ gap: 10 }}>
                  {election.candidates.map((candidate) => (
                    <CandidateCard key={candidate.id} candidate={candidate} selected={candidateId === candidate.id} onPress={() => setCandidateId(candidate.id)} />
                  ))}
                </View>
              </SectionCard>
              <SectionCard title={t('workerPortal.voting.otpTitle')}>
                <TextInput accessibilityLabel={t('workerPortal.voting.otpPlaceholder')} value={otp} onChangeText={setOtp} keyboardType="number-pad" placeholder={t('workerPortal.voting.otpPlaceholder')} placeholderTextColor={tokens.mutedForeground} style={{ minHeight: 48, borderWidth: 1, borderColor: error ? tokens.statusError : tokens.border, borderRadius: 12, paddingHorizontal: 12, color: tokens.foreground, textAlign: textAlign(), writingDirection: writingDirection(), backgroundColor: tokens.card }} />
                {error ? <Text style={{ color: tokens.statusError, ...directionalText('800') }}>{error}</Text> : null}
                <Pressable disabled={election.status !== 'open' || !election.eligible || election.has_voted} accessibilityRole="button" accessibilityState={{ disabled: election.status !== 'open' || !election.eligible || election.has_voted }} accessibilityLabel={t('voting.cast')} onPress={castVote} style={{ opacity: election.status === 'open' && election.eligible && !election.has_voted ? 1 : 0.45, marginTop: 10, minHeight: 50, backgroundColor: tokens.primary, borderRadius: 12, alignItems: 'center', flexDirection: rowDirection(), justifyContent: 'center', gap: 8 }}>
                  <BadgeCheck size={18} color={tokens.primaryForeground} />
                  <Text style={{ color: tokens.primaryForeground, ...directionalText('900') }}>{confirmVote.isPending ? t('workerPortal.voting.confirming') : t('voting.cast')}</Text>
                </Pressable>
                {confirmVote.data ? <Text style={{ color: tokens.statusSuccess, ...directionalText('900') }}>{t('workerPortal.voting.confirmed', { ref: confirmVote.data.confirmationNo })}</Text> : null}
                <View style={{ marginTop: 8, flexDirection: rowDirection(), alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} color={tokens.statusSuccess} />
                  <Text style={{ color: tokens.mutedForeground, flex: 1, fontSize: 12, lineHeight: 18, ...directionalText() }}>{t('voting.auditNote')}</Text>
                </View>
              </SectionCard>
            </>
          ) : null}
        </DataState>
      </ScrollView>
    </AppShell>
  );
}
