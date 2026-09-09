#!/usr/bin/env bash

# Executes every step line by line, in order — a failing step does not skip the rest.
# The script lives in scripts/, so the project root is one level up from it.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
STATUS=0

step() {
    echo ""
    echo "==> $1"
}

report() {
    if [ "$2" -eq 0 ]; then
        echo "$1 exit code: 0"
    else
        echo "$1 FAILED with exit code: $2"
        STATUS=$((STATUS + 1))
    fi
}

# Step 1/4: Clean old release APK
step "Step 1/4: Cleaning old release APK"
rm -f "$APK"
report "rm" $?

# Step 2/4: Build release APK
step "Step 2/4: Building release APK (Gradle assembleRelease)"
(cd "$ROOT/android" && ./gradlew assembleRelease)
report "gradle" $?

# Step 3/4: Verify build output
step "Step 3/4: Verifying APK exists"
if [ -f "$APK" ]; then
    echo "APK found: $APK"
else
    echo "APK NOT found: $APK"
fi

# Step 4/4: Install APK on connected device
step "Step 4/4: Installing APK on connected device"
adb install -r "$APK"
report "adb" $?

echo ""
if [ "$STATUS" -eq 0 ]; then
    echo "All steps completed successfully."
else
    echo "Completed with $STATUS failing step(s) — see details above."
fi
exit "$STATUS"
