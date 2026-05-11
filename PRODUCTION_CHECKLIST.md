# PUWF Mobile - Production Configuration Checklist

## ✅ Pre-Release Checklist

### Code Quality
- [ ] `npm run typecheck` passes with no errors
- [ ] No console.log() statements in production code
- [ ] Error boundaries implemented
- [ ] Network retry logic implemented
- [ ] Loading states on all API calls

### Configuration
- [ ] app.json version incremented (SemVer)
- [ ] eas.json build profile selected correctly
- [ ] .env.production configured with production API URL
- [ ] No secrets in code (API keys, tokens)
- [ ] No hardcoded URLs (use environment variables)

### Testing
- [ ] App tested on physical Android device (minimum 5 devices with different specs)
- [ ] Tested on low-end device (2GB RAM, older Android)
- [ ] Tested on high-end device (8GB+ RAM, latest Android)
- [ ] Biometric authentication tested on device with fingerprint/face
- [ ] Locale switching (Urdu ↔ English) works correctly
- [ ] Permissions requests tested (biometric, location, etc.)
- [ ] Network resilience tested (offline mode, slow network)
- [ ] App installation and uninstallation works

### Performance
- [ ] App launches in < 3 seconds
- [ ] Navigation transitions smooth (60 FPS)
- [ ] No memory leaks (test with 30+ min continuous use)
- [ ] APK size < 100MB (check: `adb shell pm get-max-users`)
- [ ] Battery impact acceptable (no excessive wake locks)

### Security
- [ ] API calls use HTTPS only
- [ ] Credentials stored in secure storage (expo-secure-store)
- [ ] No sensitive data logged
- [ ] Biometric authentication properly implemented
- [ ] No API keys in app bundle
- [ ] ProGuard/R8 obfuscation enabled for release

### Functionality
- [ ] All worker features work (login, profile, dashboard)
- [ ] All union admin features work (records, analytics, workers)
- [ ] Form submissions successful
- [ ] Data persistence works across app restarts
- [ ] File downloads/uploads working
- [ ] Print functionality working (for forms/reports)

### Compliance
- [ ] Privacy policy accessible in app
- [ ] Terms of service agreed during onboarding
- [ ] Data retention policies documented
- [ ] GDPR compliance (if applicable)
- [ ] Local laws compliance verified

### Release Notes
- [ ] Changelog prepared
- [ ] Known issues documented
- [ ] Breaking changes noted
- [ ] Migration guide prepared (if needed)

## 🏗️ Build Process

### Step 1: Pre-Build
```bash
# Type checking
npm run typecheck

# Version bumping in app.json
# Update: version, runtimeVersion, android.versionCode
```

### Step 2: Build
```bash
# For Preview/Testing
npm run build:preview

# For Staging (production-like)
npm run build:staging

# For Production APK (direct distribution)
npm run build:production-apk

# For Play Store (app bundle)
npm run build:production-aab
```

### Step 3: Test Build
- Download APK from EAS dashboard
- Install on devices: `adb install app.apk`
- Run full test suite (see Testing section above)
- Verify no errors in: `adb logcat | grep -i puwf`

### Step 4: Deploy
```bash
# For Play Store
npm run submit:production

# For direct distribution
# Upload APK to your distribution channel
```

## 📊 Monitoring Template

### First 24 Hours
- [ ] No crash spikes
- [ ] Session duration normal
- [ ] No API error patterns
- [ ] User feedback check

### First Week
- [ ] Crash rate < 0.1%
- [ ] Session stability
- [ ] Performance metrics acceptable
- [ ] Network reliability stable

### Ongoing
- [ ] Daily crash monitoring
- [ ] Weekly analytics review
- [ ] Monthly performance audit
- [ ] User feedback integration

## 🔧 Quick Reference

### Essential Commands
```bash
# Check current versionCode
grep -A 2 '"android"' app.json

# Clear cache for clean build
eas build --platform android --profile production --clear-cache

# View build logs
eas build:list
eas build:view <build-id>

# Install APK on device
adb install -r app-release.apk

# View real-time logs
adb logcat | grep PUWF

# Get APK size
adb shell pm get-max-users pk.puwf.mobile
```

### Environment Variables
```bash
# Production
ENVIRONMENT=production
API_URL=https://api.puwf.app
LOG_LEVEL=warn

# Staging
ENVIRONMENT=staging
API_URL=https://staging-api.puwf.app
LOG_LEVEL=info
```

### Build Profiles
| Profile | Purpose | Output | Distribution |
|---------|---------|--------|--------------|
| development | Local dev | Debug APK | Dev only |
| preview | Internal testing | APK | Internal |
| staging | Pre-production | APK | Internal |
| production | Play Store | AAB | Store |
| production-apk | Direct APK release | APK | Direct |

## ❌ Common Issues & Solutions

### Build Fails with Gradle Error
```bash
eas build --platform android --profile production --clear-cache
```

### Version Code Already Exists
- Increment versionCode in app.json (must be > previous)
- Example: versionCode 5 → 6

### APK Won't Install
```bash
# Clear old installation
adb shell pm clear pk.puwf.mobile
# Then reinstall
adb install -r app.apk
```

### App Crashes on Startup
```bash
# Check logs
adb logcat | grep "AndroidRuntime\|PUWF"
# Verify .env file exists and has correct API_URL
```

### Biometric Not Working
- Test on device with fingerprint/face sensor
- Verify permission: `android.permission.USE_BIOMETRIC`
- Check app is enrolled in device security settings

## 📝 Sign-off Template

```
Production Release v[VERSION]
Date: [YYYY-MM-DD]
Builder: [NAME]

✅ All checks passed
✅ Testing completed on [DEVICES]
✅ Performance acceptable
✅ Security review passed
✅ No critical issues

versionCode: [N]
APK Size: [XMB]
Build Time: [Xm Xs]

Approved by: [NAME]
```
