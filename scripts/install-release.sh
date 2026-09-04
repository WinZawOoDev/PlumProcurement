#!/usr/bin/env bash
set -euo pipefail

rm -f android/app/build/outputs/apk/release/app-release.apk

cd android && ./gradlew assembleRelease
cd ..

adb install android/app/build/outputs/apk/release/app-release.apk
