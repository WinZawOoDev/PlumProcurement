#!/usr/bin/env bash
set -euo pipefail

# Install the release APK on a USB-connected device via adb.
# Usage: ./scripts/install-release.sh [-s SERIAL] [--launch]

APK="android/app/build/outputs/apk/release/app-release.apk"
PACKAGE="com.plumprocurement"
LAUNCH=false
SERIAL=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -s) SERIAL="$2"; shift 2 ;;
    --launch) LAUNCH=true; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

if [[ ! -f "$APK" ]]; then
  echo "APK not found: $APK"
  echo "Build it first: cd android && ./gradlew assembleRelease"
  exit 1
fi

if ! command -v adb >/dev/null 2>&1; then
  echo "adb not found. Install android-platform-tools."
  exit 1
fi

if [[ -z "$SERIAL" ]]; then
  USB_DEVICES=$(adb devices | awk '$2 == "device" || $2 == "unauthorized" {print $1}' | grep -v '^emulator-' || true)
  if [[ -z "$USB_DEVICES" ]]; then
    echo "No USB device found. Connect a device and enable USB debugging."
    adb devices
    exit 1
  fi
  if [[ $(echo "$USB_DEVICES" | wc -l) -gt 1 ]]; then
    echo "Multiple USB devices found, pick one with -s:"
    echo "$USB_DEVICES"
    exit 1
  fi
  SERIAL="$USB_DEVICES"
fi

if [[ -n "$SERIAL" ]]; then
  echo "Installing on device $SERIAL..."
  adb -s "$SERIAL" install -r "$APK"
else
  echo "Installing..."
  adb install -r "$APK"
fi

if $LAUNCH; then
  echo "Launching $PACKAGE..."
  adb -s "$SERIAL" shell monkey -p "$PACKAGE" -c android.intent.category.LAUNCHER 1 >/dev/null
fi

echo "Done."
