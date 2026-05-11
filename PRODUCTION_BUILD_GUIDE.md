# PUWF Mobile - Production Build & APK Testing Guide

## Overview

This guide covers production-grade APK testing and deployment for the PUWF Mobile application using EAS Build.

## Build Profiles

### 1. **Preview Profile** (Internal Testing)
- **Purpose**: QA and internal team testing
- **Distribution**: Internal (via EAS dashboard)
- **Command**: `npm run build:preview`
- **Output**: APK file
- **Use Case**: Daily testing, feature validation before staging

### 2. **Staging Profile** (Pre-Production Testing)
- **Purpose**: Production-like environment testing
- **Distribution**: Internal testers
- **Command**: `npm run build:staging`
- **Output**: APK file
- **Use Case**: Load testing, performance validation, user acceptance testing

### 3. **Production Profile** (Store Release)
- **Purpose**: Google Play Store submission
- **Distribution**: Store
- **Command**: `npm run build:production-aab`
- **Output**: Android App Bundle (.aab)
- **Use Case**: Public release to Play Store

### 4. **Production-APK Profile** (Direct APK Release)
- **Purpose**: Direct APK distribution/testing (bypass Play Store)
- **Distribution**: Store
- **Command**: `npm run build:production-apk`
- **Output**: APK file
- **Use Case**: Enterprise distribution, beta testing

## Quick Start

### Prerequisites

```bash
# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Login to EAS (if not already logged in)
eas login

# 3. Link project to EAS (already done - projectId: 7c889de6-a954-40ca-86d0-2eca14558568)
eas project:info
```

### Build APK for Testing

```bash
# Preview/Internal Testing
npm run build:preview

# Staging Testing (Production-like)
npm run build:staging

# Production APK
npm run build:production-apk
```

## APK Testing Checklist

### Pre-Build Validation
- [ ] Run type checking: `npm run typecheck`
- [ ] Verify environment variables are set correctly
- [ ] Check version number in app.json (increment for each build)
- [ ] Test on emulator first: `npm run android`

### Post-Build Testing
- [ ] Download APK from EAS dashboard
- [ ] Install on physical Android device: `adb install app.apk`
- [ ] Test core workflows (login, data sync, permissions)
- [ ] Verify biometric authentication works
- [ ] Check localization (Urdu/English switching)
- [ ] Monitor logs: `adb logcat | grep PUWF`

### Performance Testing
- [ ] Check app size (should be <100MB)
- [ ] Monitor memory usage on low-end devices
- [ ] Test network resilience (airplane mode, connectivity loss)
- [ ] Verify no memory leaks (extended use)

### Security Testing
- [ ] Verify secure storage (biometrics, credentials)
- [ ] Check API calls are HTTPS only
- [ ] Validate no sensitive data in logs
- [ ] Test permission handling

## Environment Configuration

### Setup Environment Files

```bash
# Copy examples
cp .env.production.example .env.production
cp .env.staging.example .env.staging
```

### Environment Variables

| Variable | Purpose | Production | Staging |
|----------|---------|-----------|---------|
| ENVIRONMENT | Runtime environment | production | staging |
| API_URL | Backend API endpoint | api.puwf.app | staging-api.puwf.app |
| LOG_LEVEL | Console logging level | warn | info |
| ENABLE_CRASHES_REPORTING | Crash reporting (Sentry) | true | true |
| SENTRY_DSN | Sentry error tracking | [prod-dsn] | [staging-dsn] |

## Versioning Strategy

### Version Bumping

Update `app.json` for each release:

```json
{
  "expo": {
    "version": "1.0.0",  // SemVer: MAJOR.MINOR.PATCH
    "runtimeVersion": "1.0.0"
  },
  "android": {
    "versionCode": 1  // Increment by 1 for each build
  }
}
```

- **Version**: Human-readable SemVer
- **versionCode**: Integer, must increment (Play Store requirement)

**Example progression**:
```
v0.1.0 (versionCode: 1) → Preview
v0.1.0 (versionCode: 2) → Staging  
v1.0.0 (versionCode: 3) → Production
v1.0.1 (versionCode: 4) → Patch release
```

## Google Play Store Submission

### Prerequisites

1. Create Google Play Console account
2. Create service account for Play Store API
3. Download service account key JSON
4. Place key file in project directory

### Configuration

Update `eas.json` submit section:

```json
"submit": {
  "production": {
    "android": {
      "serviceAccount": "path/to/service-account-key.json",
      "track": "internal",  // or "beta", "production"
      "releaseStatus": "draft"  // or "completed"
    }
  }
}
```

### Submission Command

```bash
npm run submit:production
```

## Troubleshooting

### Build Failures

**Gradle Error**: Clear cache and rebuild
```bash
eas build --platform android --profile production --clear-cache
```

**Version Code Issues**: Ensure versionCode increments
```bash
# Check current versionCode
grep -A 2 '"android"' app.json
```

### APK Installation Issues

```bash
# Clear app data before reinstalling
adb shell pm clear pk.puwf.mobile

# Reinstall APK
adb install -r app.apk

# View logs
adb logcat | grep -i puwf
```

### Runtime Issues

Check logs for environment-specific errors:
```bash
adb logcat | grep "ENVIRONMENT\|API_URL\|LOG_LEVEL"
```

## Release Checklist

- [ ] Version number incremented in app.json
- [ ] versionCode incremented
- [ ] All features tested on physical device
- [ ] Performance benchmarks acceptable
- [ ] Security review completed
- [ ] Changelog prepared
- [ ] Screenshots/previews ready for Play Store
- [ ] Legal/terms of service compliant
- [ ] Privacy policy updated
- [ ] Build generated and tested
- [ ] Analytics configured correctly
- [ ] Error reporting (Sentry) enabled

## Monitoring Post-Release

### Crash Reporting
- Configure Sentry DSN in .env.production
- Monitor crashes in Sentry dashboard

### Analytics
- Track user engagement, session duration
- Monitor error patterns
- A/B test features

### Performance
- Monitor app size growth
- Track startup time
- Monitor memory/battery impact

## Build Artifacts

### Where to Find Builds

All builds available at: https://expo.dev/projects/7c889de6-a954-40ca-86d0-2eca14558568/builds

### File Types

- **APK**: Direct installation on Android devices (Preview, Staging, Production-APK)
- **AAB** (App Bundle): Google Play Store submission (Production)

## Additional Resources

- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Android Versioning](https://developer.android.com/studio/publish/versioning)
- [Google Play Console](https://play.google.com/console)
- [EAS Build Configuration Reference](https://docs.expo.dev/build-reference/eas-json/)

## Support

For issues with:
- **EAS Build**: Check EAS dashboard logs
- **App Code**: Check `adb logcat`
- **API Integration**: Verify API_URL in environment
- **Biometrics**: Test on device with fingerprint/face sensors
