import { useRef, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Download, Share2, ShieldCheck } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, Text, View, type ViewStyle } from 'react-native';
import { AppShell } from '@/components/app-shell';
import { HeaderBar } from '@/components/header-bar';
import { DataState } from '@/components/data-state';
import { DigitalIdCard } from '@/features/worker-portal/components';
import { unionOfficeBearerRecords } from '@/data/mobile-mock-data';
import { saveDigitalIdImage, shareDigitalIdImage } from '@/services/digital-id-image-service';
import { useWorkerDashboard } from '@/services/worker-service';
import { directionalText, rowDirection } from '@/theme/layout';

/* ── PUWF Official Brand Palette ── */
const PUWF_NAVY    = '#2E338C';
const PUWF_GREEN   = '#03A64A';
const PUWF_CRIMSON = '#A6121F';
const PUWF_LIGHT   = '#F2F2F2';
const PUWF_RED     = '#F21D2F';

const POSITION_ORDER = [
  'President',
  'Chairman',
  'General Secretary',
  'Finance Secretary',
  'Chief Organizer',
  'Secretary Legal Affairs',
];

export default function DigitalIdScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useWorkerDashboard();
  const cardCaptureRef = useRef<View>(null);
  const [activeAction, setActiveAction] = useState<'download' | 'share' | null>(null);
  const handleDownloadPress = async () => {
    if (!data || activeAction) return;

    setActiveAction('download');
    try {
      await saveDigitalIdImage({
        captureRefTarget: cardCaptureRef,
        workerId: data.worker_identity.worker_id,
        workerName: data.worker_identity.name,
      });
      Alert.alert(t('common.complete'), t('workerPortal.digitalId.downloadSuccess'));
    } catch (error) {
      const message = error instanceof Error && error.message === 'EXPO_GO_MEDIA_LIMITATION'
        ? t('workerPortal.digitalId.devBuildRequired')
        : error instanceof Error && error.message === 'MEDIA_PERMISSION_DENIED'
          ? t('workerPortal.digitalId.mediaPermissionDenied')
          : t('workerPortal.digitalId.downloadError');
      Alert.alert(t('states.error'), message);
    } finally {
      setActiveAction(null);
    }
  };
  const handleSharePress = async () => {
    if (!data || activeAction) return;

    setActiveAction('share');
    try {
      await shareDigitalIdImage({
        captureRefTarget: cardCaptureRef,
        workerId: data.worker_identity.worker_id,
        workerName: data.worker_identity.name,
      });
    } catch (error) {
      const message = error instanceof Error && error.message === 'SHARING_UNAVAILABLE'
        ? t('workerPortal.digitalId.shareUnavailable')
        : t('workerPortal.digitalId.shareError');
      Alert.alert(t('states.error'), message);
    } finally {
      setActiveAction(null);
    }
  };
  const unionName = data?.worker_identity.union_name;
  const normalizedUnion = unionName?.trim().toLowerCase();
  const unionBearers = normalizedUnion
    ? unionOfficeBearerRecords
        .filter((bearer) => bearer.union_name?.toLowerCase() === normalizedUnion)
        .slice()
        .sort((a, b) => {
          const aIndex = POSITION_ORDER.indexOf(a.position);
          const bIndex = POSITION_ORDER.indexOf(b.position);
          if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        })
    : [];

  return (
    <AppShell>
      <HeaderBar title={t('worker.digitalId')} />
      <ScrollView
        style={{ backgroundColor: PUWF_LIGHT }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 14 }}>
          <DataState
            loading={isLoading}
            error={isError}
            empty={!data}
            loadingLabel={t('states.loading')}
            errorLabel={t('states.error')}
            emptyLabel={t('states.empty')}
          >
            {data ? (
              <>
                {/* The PUWF ID card */}
                <View ref={cardCaptureRef} collapsable={false}>
                  <DigitalIdCard summary={data} />
                </View>

                {/* Verification notice */}
                <View
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: '#e8e8e8',
                    padding: 14,
                    flexDirection: rowDirection(),
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <ShieldCheck size={17} color={PUWF_GREEN} />
                  <Text
                    style={{
                      flex: 1,
                      color: '#555',
                      fontSize: 12,
                      lineHeight: 19,
                      fontWeight: '600',
                      ...directionalText('600'),
                    }}
                  >
                    {t('workerPortal.digitalId.verificationNotice')}
                  </Text>
                </View>

                {/* ── Action buttons ── */}
                <View style={{ gap: 8 }}>
                  <Text
                    style={{
                      color: '#9aa0a6',
                      fontSize: 10,
                      fontWeight: '800',
                      letterSpacing: 0.7,
                      ...directionalText('800'),
                    }}
                  >
                    {t('workerPortal.digitalId.actions', 'CARD ACTIONS').toUpperCase()}
                  </Text>
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      gap: 12,
                      marginTop: 6,
                      alignItems: 'stretch',
                      justifyContent: 'space-between',
                    }}
                  >
                    <ActionButton
                      icon={Download}
                      label={activeAction === 'download' ? t('workerPortal.digitalId.downloadInProgress') : t('workerPortal.digitalId.downloadMock')}
                      type="download"
                      onPress={handleDownloadPress}
                      disabled={!!activeAction}
                    />
                    <ActionButton
                      icon={Share2}
                      label={activeAction === 'share' ? t('workerPortal.digitalId.shareInProgress') : t('workerPortal.digitalId.shareMock')}
                      type="share"
                      onPress={handleSharePress}
                      disabled={!!activeAction}
                    />
                  </View>
                </View>

                {unionBearers.length ? (
                  <View
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: '#e8e8e8',
                      padding: 12,
                      gap: 10,
                    }}
                  >
                    <View style={{ flexDirection: rowDirection(), alignItems: 'center', gap: 8 }}>
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: PUWF_GREEN,
                          shadowColor: PUWF_GREEN,
                          shadowOpacity: 0.25,
                          shadowRadius: 6,
                          shadowOffset: { width: 0, height: 2 },
                        }}
                      />
                      <Text style={{ color: PUWF_NAVY, fontSize: 14, ...directionalText('900') }}>
                        {t('workerPortal.digitalId.committeeTitle')}
                      </Text>
                    </View>
                    <Text style={{ color: '#6b7280', fontSize: 11, ...directionalText('600') }}>
                      {t('workerPortal.digitalId.committeeSubtitle')}
                    </Text>

                    <View style={{ gap: 6 }}>
                      {unionBearers.map((bearer, index) => (
                        <View
                          key={bearer.id}
                          style={{
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: '#eef0f2',
                            paddingVertical: 8,
                            paddingHorizontal: 10,
                            flexDirection: rowDirection(),
                            alignItems: 'center',
                            gap: 10,
                            backgroundColor: PUWF_LIGHT,
                          }}
                        >
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              backgroundColor: PUWF_NAVY,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: '900' }}>
                              {index + 1}
                            </Text>
                          </View>

                          <View
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              backgroundColor:
                                bearer.gender === 'female'
                                  ? 'rgba(242,242,242,0.18)'
                                  : bearer.gender === 'male'
                                    ? 'rgba(242,242,242,0.18)'
                                    : 'rgba(242,242,242,0.18)',
                              borderWidth: 1,
                              borderColor:
                                bearer.gender === 'female'
                                  ? 'rgba(242, 29, 47, 0.42)'
                                  : bearer.gender === 'male'
                                    ? 'rgba(3, 166, 74, 0.42)'
                                    : 'rgba(46, 51, 140, 0.24)',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <View
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 13,
                                backgroundColor:
                                  bearer.gender === 'female'
                                    ? 'rgba(242, 29, 47, 0.16)'
                                    : bearer.gender === 'male'
                                      ? 'rgba(3, 166, 74, 0.16)'
                                      : 'rgba(46, 51, 140, 0.12)',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {bearer.gender === 'female' ? (
                                <MaterialCommunityIcons name="account-tie-woman" size={20} color={PUWF_RED} />
                              ) : bearer.gender === 'male' ? (
                                <MaterialCommunityIcons name="account-tie" size={20} color={PUWF_GREEN} />
                              ) : (
                                <MaterialCommunityIcons name="account-circle-outline" size={20} color={PUWF_NAVY} />
                              )}
                            </View>
                          </View>

                          <View style={{ flex: 1 }}>
                            <Text style={{ color: PUWF_NAVY, fontSize: 12, ...directionalText('900') }}>
                              {bearer.name}
                            </Text>
                            <Text style={{ color: '#6b7280', fontSize: 10, ...directionalText('700') }}>
                              {bearer.designation_key ? t(bearer.designation_key) : bearer.position}
                            </Text>
                          </View>

                          <View
                            style={{
                              borderRadius: 999,
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              backgroundColor: bearer.status === 'active' ? 'rgba(3,166,74,0.12)' : 'rgba(242,29,47,0.12)',
                              borderWidth: 1,
                              borderColor: bearer.status === 'active' ? PUWF_GREEN : PUWF_RED,
                            }}
                          >
                            <Text
                              style={{
                                color: bearer.status === 'active' ? PUWF_GREEN : PUWF_RED,
                                fontSize: 9,
                                fontWeight: '800',
                              }}
                            >
                              {t(`unionCore.officeStatus.${bearer.status}`)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                {unionBearers.length ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('workerPortal.digitalId.accessPortal')}
                    onPress={() => router.push('/(worker)/dashboard')}
                    style={{
                      minHeight: 46,
                      borderRadius: 12,
                      backgroundColor: PUWF_NAVY,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 14,
                    }}
                  >
                    <Text style={{ color: '#ffffff', fontSize: 13, ...directionalText('900') }}>
                      {t('workerPortal.digitalId.accessPortal')}
                    </Text>
                  </Pressable>
                ) : null}
              </>
            ) : null}
          </DataState>
        </View>
      </ScrollView>
    </AppShell>
  );
}

/* ── Branded action button ── */
function ActionButton({
  icon: Icon,
  label,
  type,
  onPress,
  disabled,
}: {
  icon: typeof Download;
  label: string;
  type: 'download' | 'share';
  onPress: () => void;
  disabled?: boolean;
}) {
  const isDownload = type === 'download';
  
  const baseStyle: ViewStyle = {
    flex: 1,
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0,
    minHeight: 52,
    borderRadius: 12,
    overflow: 'hidden',
  };

  const buttonSurfaceStyle: ViewStyle = {
    minHeight: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: rowDirection(),
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  };

  const downloadStyle: ViewStyle = {
    backgroundColor: PUWF_GREEN,
    borderWidth: 1,
    borderColor: PUWF_GREEN,
    shadowColor: PUWF_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  };

  const shareStyle: ViewStyle = {
    backgroundColor: PUWF_NAVY,
    borderWidth: 1,
    borderColor: PUWF_NAVY,
    shadowColor: PUWF_NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      android_ripple={{ color: 'rgba(255,255,255,0.14)' }}
      style={[baseStyle, disabled ? { opacity: 0.6 } : null]}
    >
      <View style={[buttonSurfaceStyle, isDownload ? downloadStyle : shareStyle]}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.16)',
          }}
        >
          <Icon size={16} color="#ffffff" />
        </View>
        <Text
          style={{
            flexShrink: 1,
            color: '#ffffff',
            fontSize: 13,
            fontWeight: '800',
            textAlign: 'center',
            ...directionalText('800'),
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
