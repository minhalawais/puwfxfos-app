import { FileText, Phone, ShieldCheck, UserRound } from 'lucide-react-native';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { SectionCard } from '@/components/section-card';
import { StatusChip } from '@/components/status-chip';
import { useWorkerUnion } from '@/services/worker-service';
import { directionalText, rowDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';

export default function MyUnionScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useWorkerUnion();

  return (
    <AppShell>
      <HeaderBar title={t('worker.myUnion')} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <DataState loading={isLoading} error={isError} empty={!data} loadingLabel={t('states.loading')} errorLabel={t('states.error')} emptyLabel={t('states.empty')}>
          {data ? (
            <>
              <SectionCard title={data.union_name}>
                <View style={{ flexDirection: rowDirection(), gap: 10, flexWrap: 'wrap' }}>
                  <StatusChip tone="success" label={t(`status.affiliation.${data.affiliation_status}`)} />
                  <StatusChip tone={data.cba_status === 'active' ? 'success' : 'warning'} label={`CBA ${t(`status.cba.${data.cba_status}`)}`} />
                </View>
                <Text style={{ color: tokens.mutedForeground, ...directionalText() }}>{t('union.registration')}: <Text style={{ writingDirection: 'ltr' }}>{data.registration_no}</Text></Text>
              </SectionCard>

              <SectionCard title={t('union.officeBearers')}>
                <Bearer icon={UserRound} label={t('union.president')} value={data.president_name} />
                <Bearer icon={ShieldCheck} label={t('union.generalSecretary')} value={data.gen_sec_name} />
                <Pressable accessibilityRole="button" accessibilityLabel={t('workerPortal.union.callOffice')} style={{ minHeight: 48, marginTop: 8, flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, backgroundColor: tokens.secondary }}>
                  <Phone size={17} color={tokens.primary} />
                  <Text style={{ color: tokens.primary, fontWeight: '900', writingDirection: 'ltr' }}>{data.contact_phone}</Text>
                </Pressable>
              </SectionCard>

              <SectionCard title={t('workerPortal.union.documentsTitle')}>
                <View style={{ gap: 8 }}>
                  {data.documents.map((doc) => (
                    <View key={doc.id} style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8 }}>
                      <FileText size={17} color={tokens.primary} />
                      <Text style={{ flex: 1, color: tokens.foreground, ...directionalText('800') }}>{t(doc.title_key)}</Text>
                      <StatusChip tone={doc.status === 'current' ? 'success' : 'warning'} label={t(`status.document.${doc.status}`)} />
                    </View>
                  ))}
                </View>
              </SectionCard>

              <View style={{ flexDirection: rowDirection(), alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8 }}>
                <Image source={require('../../assets/images/fos_tree.png')} resizeMode="contain" style={{ width: 22, height: 22 }} />
                <Text style={{ color: tokens.mutedForeground, fontSize: 11, ...directionalText('800') }}>{t('role.coBrand')}</Text>
              </View>
            </>
          ) : null}
        </DataState>
      </ScrollView>
    </AppShell>
  );
}

function Bearer({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return (
    <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8, paddingVertical: 6 }}>
      <Icon size={17} color={tokens.primary} />
      <Text style={{ flex: 1, color: tokens.mutedForeground, ...directionalText('800') }}>{label}</Text>
      <Text style={{ color: tokens.foreground, ...directionalText('900') }}>{value}</Text>
    </View>
  );
}
