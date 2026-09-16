# Packaging AI Live Teacher as an Android App 🤖📱

The **AI Live Teacher** application is fully configured with Firebase Authentication, Firestore cloud sync, and low-latency multimodal Gemini AI integration. You can easily package and publish this application as a native Android app using either **Trusted Web Activity (TWA)** or **Capacitor**.

---

## Method 1: Trusted Web Activity (TWA) using Bubblewrap (Recommended)
Trusted Web Activities wrap your deployed Progressive Web App (PWA) inside a native Android container with full screen, microphone, camera, and Firebase Google Sign-In support.

### Prerequisites
1. **Node.js** (v18+) and **Java Development Kit (JDK 17+)** installed on your machine.
2. Install Bubblewrap CLI globally:
   ```bash
   npm i -g @bubblewrap/cli
   ```

### Steps
1. **Deploy your app** to a secure HTTPS URL (e.g., your Cloud Run production URL or Firebase Hosting).
2. **Initialize Bubblewrap**:
   ```bash
   bubblewrap init --manifest=https://your-app-domain.com/manifest.json
   ```
3. **Build the Android APK / App Bundle (.aab)**:
   ```bash
   bubblewrap build
   ```
4. Find the generated `app-release-signed.apk` in your project folder and install it on your Android device!

---

## Method 2: Capacitor (Native Hybrid Android App)

If you prefer packaging the web assets directly inside an Android Studio project:

### Steps
1. **Install Capacitor CLI and Android core**:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init "AI Live Teacher" com.example.ailiveteacher --web-dir dist
   ```
2. **Build the web app**:
   ```bash
   npm run build
   ```
3. **Add the Android platform**:
   ```bash
   npx cap add android
   ```
4. **Open Android Studio**:
   ```bash
   npx cap open android
   ```
5. In Android Studio, click **Run** to launch the app on your Android emulator or connected Android phone.

---

## 🔒 Android Manifest Permissions Required (`AndroidManifest.xml`)

When packaging for Android, ensure your app requests microphone and camera permissions for the interactive teacher sessions:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```
