param(
    [string]$ServerHost = "",
    [string]$ServerPort = "5000"
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ServerHost) -or $ServerHost -eq "10.226.176.89") {
    $detectedIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*" } | Where-Object { $_.IPAddress -notlike "169.254*" -and $_.IPAddress -notlike "192.168.56*" } | Select-Object -ExpandProperty IPAddress -First 1)
    if ($detectedIp) {
        $ServerHost = $detectedIp
    } else {
        $ServerHost = "10.178.151.89"
    }
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   DiaFit AI - Android APK Builder       " -ForegroundColor Cyan
Write-Host "   Server Host: ${ServerHost}:${ServerPort}   " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$SdkDir = "C:\Users\M ASHOKA\AppData\Local\Android\Sdk"
$BuildToolsDir = "$SdkDir\build-tools\36.1.0"
$PlatformDir = "$SdkDir\platforms\android-36.1"
$AndroidJar = "$PlatformDir\android.jar"
$JbrBin = "C:\Program Files\Android\Android Studio1\jbr\bin"
$JavaExe = "$JbrBin\java.exe"
$JavacExe = "$JbrBin\javac.exe"
$JarExe = "$JbrBin\jar.exe"
$KeytoolExe = "$JbrBin\keytool.exe"
$Aapt2Exe = "$BuildToolsDir\aapt2.exe"
$ZipAlignExe = "$BuildToolsDir\zipalign.exe"
$D8Jar = "$BuildToolsDir\lib\d8.jar"
$ApkSignerJar = "$BuildToolsDir\lib\apksigner.jar"

$RootDir = "C:\Users\M ASHOKA\OneDrive\Desktop\major"
$BuildDir = "$RootDir\mobile_apk_build"

Write-Host "[1/7] Cleaning and setting up build directory..." -ForegroundColor Yellow
if (Test-Path $BuildDir) { Remove-Item -Recurse -Force $BuildDir }
New-Item -ItemType Directory -Path "$BuildDir\src\com\diafit\ai" -Force | Out-Null
New-Item -ItemType Directory -Path "$BuildDir\res\values" -Force | Out-Null
New-Item -ItemType Directory -Path "$BuildDir\res\drawable" -Force | Out-Null
New-Item -ItemType Directory -Path "$BuildDir\res\mipmap-xxhdpi" -Force | Out-Null
New-Item -ItemType Directory -Path "$BuildDir\assets\dist" -Force | Out-Null
New-Item -ItemType Directory -Path "$BuildDir\obj" -Force | Out-Null
New-Item -ItemType Directory -Path "$BuildDir\bin" -Force | Out-Null

# Copy App Icons
Copy-Item "$RootDir\frontend\public\icon-192.png" "$BuildDir\res\mipmap-xxhdpi\ic_launcher.png"
Copy-Item "$RootDir\frontend\public\icon-192.png" "$BuildDir\res\drawable\ic_launcher.png"

# Copy built frontend assets
Copy-Item -Recurse "$RootDir\frontend\dist\*" "$BuildDir\assets\dist\"

# Strings & Styles
@"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">DiaFit AI</string>
</resources>
"@ | Set-Content -Path "$BuildDir\res\values\strings.xml" -Encoding UTF8

@"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="android:Theme.NoTitleBar">
        <item name="android:windowBackground">@android:color/black</item>
        <item name="android:colorBackground">@android:color/black</item>
    </style>
</resources>
"@ | Set-Content -Path "$BuildDir\res\values\styles.xml" -Encoding UTF8

# AndroidManifest.xml
@"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.diafit.ai"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <uses-feature android:name="android.hardware.camera" android:required="true" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
    <uses-feature android:name="android.hardware.camera.front" android:required="false" />

    <application
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true"
        android:hardwareAccelerated="true"
        android:largeHeap="true"
        android:supportsRtl="true">

        <activity
            android:name="com.diafit.ai.MainActivity"
            android:label="@string/app_name"
            android:configChanges="orientation|keyboardHidden|screenSize|screenLayout|smallestScreenSize"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"@ | Set-Content -Path "$BuildDir\AndroidManifest.xml" -Encoding UTF8

# MainActivity.java
$MainActivityCode = @"
package com.diafit.ai;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.PermissionRequest;
import android.webkit.GeolocationPermissions;
import android.content.pm.PackageManager;
import android.Manifest;
import android.view.KeyEvent;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Toast;

public class MainActivity extends Activity {
    private WebView webView;
    private static final String DEFAULT_SERVER_URL = "http://${ServerHost}:${ServerPort}";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // Explicitly request Camera and Location permissions
        if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED ||
            checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{
                Manifest.permission.CAMERA,
                Manifest.permission.RECORD_AUDIO,
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            }, 1001);
        }

        webView = new WebView(this);
        setContentView(webView);

        WebSettings ws = webView.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setDatabaseEnabled(true);
        ws.setMediaPlaybackRequiresUserGesture(false);
        ws.setAllowFileAccess(true);
        ws.setAllowContentAccess(true);
        ws.setAllowFileAccessFromFileURLs(true);
        ws.setAllowUniversalAccessFromFileURLs(true);
        ws.setUseWideViewPort(true);
        ws.setLoadWithOverviewMode(true);
        ws.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        ws.setGeolocationEnabled(true);
        ws.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                // Fallback to offline bundled assets if live dev server is unreachable
                if (!failingUrl.startsWith("file:///android_asset/")) {
                    Toast.makeText(MainActivity.this, "Connecting to offline bundled DiaFit...", Toast.LENGTH_SHORT).show();
                    view.loadUrl("file:///android_asset/dist/index.html");
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        // Grant all requested WebRTC hardware permissions (camera, audio)
                        request.grant(request.getResources());
                    }
                });
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }
        });

        // Load the live LAN server (with automatic fallback to packaged dist)
        webView.loadUrl(DEFAULT_SERVER_URL);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
"@
[System.IO.File]::WriteAllText("$BuildDir\src\com\diafit\ai\MainActivity.java", $MainActivityCode, [System.Text.UTF8Encoding]::new($false))

Write-Host "[2/7] Compiling Android resources with AAPT2..." -ForegroundColor Yellow
& $Aapt2Exe compile --dir "$BuildDir\res" -o "$BuildDir\compiled_res.zip"
if ($LASTEXITCODE -ne 0) { throw "AAPT2 compile failed" }

Write-Host "[3/7] Linking Android package with AAPT2..." -ForegroundColor Yellow
& $Aapt2Exe link -I $AndroidJar `
    --manifest "$BuildDir\AndroidManifest.xml" `
    -o "$BuildDir\bin\unaligned.apk" `
    -A "$BuildDir\assets" `
    "$BuildDir\compiled_res.zip" `
    --java "$BuildDir\src" `
    --auto-add-overlay
if ($LASTEXITCODE -ne 0) { throw "AAPT2 link failed" }

Write-Host "[4/7] Compiling Java code with javac..." -ForegroundColor Yellow
$JavaSources = Get-ChildItem "$BuildDir\src" -Recurse -Filter "*.java" | ForEach-Object { $_.FullName }
& $JavacExe -cp $AndroidJar -d "$BuildDir\obj" -source 17 -target 17 $JavaSources
if ($LASTEXITCODE -ne 0) { throw "Javac failed" }

Write-Host "[5/7] Converting bytecode to DEX with D8..." -ForegroundColor Yellow
$ClassFiles = Get-ChildItem "$BuildDir\obj" -Recurse -Filter "*.class" | ForEach-Object { $_.FullName }
& $JavaExe -cp $D8Jar com.android.tools.r8.D8 --output "$BuildDir\bin" --min-api 24 --lib $AndroidJar $ClassFiles
if ($LASTEXITCODE -ne 0) { throw "D8 dexing failed" }

Write-Host "[6/7] Packaging DEX into APK..." -ForegroundColor Yellow
Push-Location "$BuildDir\bin"
& $JarExe -uf "unaligned.apk" "classes.dex"
Pop-Location
if ($LASTEXITCODE -ne 0) { throw "Jar update failed" }

# Align APK
& $ZipAlignExe -p -f 4 "$BuildDir\bin\unaligned.apk" "$BuildDir\bin\aligned.apk"
if ($LASTEXITCODE -ne 0) { throw "Zipalign failed" }

Write-Host "[7/7] Signing APK with debug keystore..." -ForegroundColor Yellow
$KeystorePath = "$BuildDir\debug.keystore"
& $KeytoolExe -genkeypair -v -keystore $KeystorePath -alias androiddebugkey -storepass android -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=DiaFit AI,O=DiaFit,C=US"

& $JavaExe -jar $ApkSignerJar sign `
    --ks $KeystorePath `
    --ks-pass pass:android `
    --ks-key-alias androiddebugkey `
    --key-pass pass:android `
    --out "$RootDir\DiaFit-AI.apk" `
    "$BuildDir\bin\aligned.apk"
if ($LASTEXITCODE -ne 0) { throw "Apksigner failed" }

# Copy to public and dist for direct browser downloads
Copy-Item "$RootDir\DiaFit-AI.apk" "$RootDir\frontend\public\diafit-ai.apk" -Force
Copy-Item "$RootDir\DiaFit-AI.apk" "$RootDir\frontend\dist\diafit-ai.apk" -Force

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Green
Write-Host " SUCCESS: DiaFit-AI.apk generated successfully!         " -ForegroundColor Green
Write-Host " Output file: $RootDir\DiaFit-AI.apk" -ForegroundColor Green
Write-Host " Download URL on mobile: http://${ServerHost}:${ServerPort}/diafit-ai.apk" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Green
