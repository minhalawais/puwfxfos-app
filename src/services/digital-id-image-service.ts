import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';
import type { View } from 'react-native';

type ExportDigitalIdImageOptions = {
  captureRefTarget: RefObject<View | null>;
  workerId: string;
  workerName: string;
};

let activeExport: Promise<void> | null = null;

function sanitizeFilePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'worker';
}

async function captureCardImage({ captureRefTarget, workerId, workerName }: ExportDigitalIdImageOptions) {
  if (!captureRefTarget.current) {
    throw new Error('CAPTURE_TARGET_MISSING');
  }

  const capturedUri = await captureRef(captureRefTarget, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
  });

  const fileName = `puwf-digital-id-${sanitizeFilePart(workerName)}-${sanitizeFilePart(workerId)}.png`;
  const outputUri = `${FileSystem.cacheDirectory ?? ''}${fileName}`;

  if (!FileSystem.cacheDirectory) {
    throw new Error('CACHE_DIRECTORY_UNAVAILABLE');
  }

  const existingFile = await FileSystem.getInfoAsync(outputUri);
  if (existingFile.exists) {
    await FileSystem.deleteAsync(outputUri, { idempotent: true });
  }

  await FileSystem.copyAsync({ from: capturedUri, to: outputUri });
  return { uri: outputUri, fileName };
}

async function runExclusive(task: () => Promise<void>) {
  if (activeExport) {
    return activeExport;
  }

  activeExport = task().finally(() => {
    activeExport = null;
  });

  return activeExport;
}

export async function saveDigitalIdImage(options: ExportDigitalIdImageOptions) {
  return runExclusive(async () => {
    if (Constants.appOwnership === 'expo') {
      throw new Error('EXPO_GO_MEDIA_LIMITATION');
    }

    const permission = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
    if (!permission.granted) {
      throw new Error('MEDIA_PERMISSION_DENIED');
    }

    const { uri } = await captureCardImage(options);
    await MediaLibrary.createAssetAsync(uri);
  });
}

export async function shareDigitalIdImage(options: ExportDigitalIdImageOptions) {
  return runExclusive(async () => {
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error('SHARING_UNAVAILABLE');
    }

    const { uri, fileName } = await captureCardImage(options);
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: fileName,
      UTI: 'public.png',
    });
  });
}
