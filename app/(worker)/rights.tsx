import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { DataState } from '@/components/data-state';
import { HeaderBar } from '@/components/header-bar';
import { RightsTopicCard } from '@/features/worker-portal/components';
import { useWorkerRights } from '@/services/worker-service';
import { directionalText, rowDirection, textAlign, writingDirection } from '@/theme/layout';
import { tokens } from '@/theme/tokens';
import type { RightTopic } from '@/types/domain';

const categories: Array<RightTopic['category'] | 'all'> = ['all', 'wages', 'safety', 'union_rights', 'benefits', 'termination', 'cba_cod', 'grievance'];

export default function RightsScreen() {
  const { t } = useTranslation();
  const { data = [], isLoading, isError } = useWorkerRights();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<RightTopic['category'] | 'all'>('all');
  const filtered = useMemo(() => data.filter((topic) => {
    const matchesCategory = category === 'all' || topic.category === category;
    const haystack = `${t(topic.title_key)} ${t(topic.description_key)}`.toLowerCase();
    return matchesCategory && haystack.includes(query.toLowerCase());
  }), [category, data, query, t]);

  return (
    <AppShell>
      <HeaderBar title={t('worker.rights')} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8, borderWidth: 1, borderColor: tokens.border, borderRadius: 12, paddingHorizontal: 12, backgroundColor: tokens.card }}>
          <Search size={18} color={tokens.mutedForeground} />
          <TextInput accessibilityLabel={t('rights.search')} value={query} onChangeText={setQuery} placeholder={t('rights.search')} placeholderTextColor={tokens.mutedForeground} style={{ flex: 1, minHeight: 46, color: tokens.foreground, textAlign: textAlign(), writingDirection: writingDirection() }} />
        </View>
        <View style={{ flexDirection: rowDirection(), gap: 8, flexWrap: 'wrap' }}>
          {categories.map((item) => (
            <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: item === category }} accessibilityLabel={t(item === 'all' ? 'workerPortal.rights.categories.all' : `workerPortal.rights.categories.${item}`)} onPress={() => setCategory(item)} style={{ minHeight: 44, borderRadius: 999, paddingHorizontal: 12, justifyContent: 'center', backgroundColor: item === category ? tokens.statusSuccessBg : tokens.statusNeutralBg }}>
              <Text style={{ color: item === category ? tokens.statusSuccess : tokens.statusNeutral, fontSize: 11, ...directionalText('900') }}>{t(item === 'all' ? 'workerPortal.rights.categories.all' : `workerPortal.rights.categories.${item}`)}</Text>
            </Pressable>
          ))}
        </View>
        <DataState loading={isLoading} error={isError} empty={filtered.length === 0} loadingLabel={t('states.loading')} errorLabel={t('states.error')} emptyLabel={t('workerPortal.rights.empty')}>
          <View style={{ gap: 10 }}>
            {filtered.map((topic) => (
              <RightsTopicCard key={topic.id} topic={topic} onPress={() => router.push(topic.action_key.includes('viewUnion') ? '/(worker)/my-union' : '/(worker)/grievances')} />
            ))}
          </View>
        </DataState>
      </ScrollView>
    </AppShell>
  );
}
