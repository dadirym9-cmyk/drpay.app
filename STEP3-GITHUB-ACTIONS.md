# Step 3 — GitHub Actions APK

This project includes a GitHub Actions workflow named **Build DRPay APK**.
It installs dependencies, creates the Android platform with Capacitor, syncs it, builds a debug APK, and uploads the APK as an artifact.

After uploading these files to the repository:
1. Open GitHub → Actions.
2. Select **Build DRPay APK**.
3. You can use **Run workflow** or let it run after a push to `main`.
4. When it finishes, download the **DRPay-debug-apk** artifact.

This is a testing APK, not a Play Store signed release.
