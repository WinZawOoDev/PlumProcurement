# Executes every step line by line, in order — a failing step does not skip the rest.
# The script lives in scripts/, so the project root is one level up from it.
$ErrorActionPreference = 'Continue'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Apk = Join-Path $Root 'android\app\build\outputs\apk\release\app-release.apk'
$Failures = 0

function Step {
    param([string]$Name)
    Write-Host ""
    Write-Host "==> $Name"
}

function Report {
    param([string]$Name, [int]$Code)
    if ($Code -eq 0) {
        Write-Host "$Name exit code: 0"
    } else {
        Write-Host "$Name FAILED with exit code: $Code"
        $script:Failures++
    }
}

# Step 1/4: Clean old release APK
Step 'Step 1/4: Cleaning old release APK'
try {
    if (Test-Path $Apk) {
        Remove-Item $Apk -Force
        Write-Host "rm exit code: 0"
    } else {
        Write-Host "No old APK to clean"
    }
} catch {
    Write-Host "rm FAILED: $_"
    $script:Failures++
}

# Step 2/4: Build release APK
Step 'Step 2/4: Building release APK (Gradle assembleRelease)'
Push-Location (Join-Path $Root 'android')
& .\gradlew.bat assembleRelease
$GradleCode = $LASTEXITCODE
Pop-Location
Report 'gradle' $GradleCode

# Step 3/4: Verify build output
Step 'Step 3/4: Verifying APK exists'
if (Test-Path $Apk) {
    Write-Host "APK found: $Apk"
} else {
    Write-Host "APK NOT found: $Apk"
}

# Step 4/4: Install APK on connected device
Step 'Step 4/4: Installing APK on connected device'
adb install -r $Apk
Report 'adb' $LASTEXITCODE

Write-Host ""
if ($Failures -eq 0) {
    Write-Host 'All steps completed successfully.'
} else {
    Write-Host "Completed with $Failures failing step(s) — see details above."
}
exit $Failures
