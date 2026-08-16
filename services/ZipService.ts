
import JSZip from 'jszip';

export class ZipService {
    static async generatePortableProject(): Promise<Blob> {
        const zip = new JSZip();
        
        // Use the absolute origin to ensure we grab the real files from the server
        const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);

        const files = [
            'index.html',
            'index.tsx',
            'App.tsx',
            'types.ts',
            'constants.ts',
            'manifest.json',
            'sw.js',
            'metadata.json',
            'neuromax_data_export.json',
            'synsync_data_export.json',
            'services/AudioEngine.ts',
            'services/ProtocolVault.ts',
            'services/ZipService.ts',
            'services/SensorFusion.ts',
            'services/MuseEEGService.ts',
            'services/validateProtocols.ts',
            'services/ProtocolSafety.ts',
            'services/SecureDownload.ts',
            'components/Visualizer.tsx',
            'components/ProtocolList.tsx',
            'components/GuidanceOverlay.tsx',
            'components/SessionProgress.tsx',
            'components/SourcesModal.tsx',
            'components/LegalModal.tsx',
            'components/DownloadPortal.tsx',
            'components/ManualTuningPanel.tsx',
            'components/WavExporter.tsx',
            'components/BiofeedbackPanel.tsx',
            'components/WearableConnect.tsx',
            'components/ComparisonChart.tsx',
            'components/CymaticsVisualizer.tsx',
            'components/LandingPage.tsx',
            'components/LegalDisclaimer.tsx',
            'components/SafetyGateModal.tsx',
            'components/UpsellModal.tsx',
            'src/audio/constants.ts',
            'src/audio/types.ts',
            'src/audio/spec-neural-autonomic.ts',
            'src/audio/spec-performance-v5.ts',
            'src/audio/spec-sleep-consciousness.ts'
        ];

        
        for (const path of files) {
            try {
                const response = await fetch(baseUrl + path);
                if (response.ok) {
                    const content = await response.text();
                    zip.file(path, content);
                }
            } catch (e) {
                console.warn(`Kernel: Failed to clone [${path}]`);
            }
        }

        // --- THE "PROVISIONING" BOOTLOADER ---
        const mobileBootloader = `
<!DOCTYPE html>
<html>
<head>
    <title>SynSync Provisioning</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <style>
        body { background: #0B0C15; color: white; font-family: sans-serif; text-align: center; margin: 0; padding: 40px 20px; }
        .card { background: #151621; border: 1px solid #FFB000; padding: 30px; border-radius: 20px; max-width: 400px; margin: 0 auto; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
        h1 { color: #FFB000; font-size: 24px; margin-bottom: 10px; font-weight: 900; }
        .warning-box { background: rgba(255, 61, 0, 0.2); border: 2px solid #FF3D00; padding: 20px; border-radius: 12px; margin-bottom: 25px; display: none; text-align: left; }
        .warning-box b { color: #FF3D00; display: block; margin-bottom: 10px; }
        .btn { display: block; background: #FFB000; color: black; padding: 18px; border-radius: 12px; text-decoration: none; font-weight: 900; margin-top: 25px; text-transform: uppercase; }
        .btn-secondary { background: #232433; color: #FFB000; margin-top: 10px; border: 1px solid #FFB00033; }
        .steps { text-align: left; margin-top: 35px; font-size: 13px; color: #888; border-top: 1px solid #333; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="card">
        <h1>PROVISIONING KERNEL</h1>
        
        <div id="gsa-warning" class="warning-box">
            <b>INCOMPATIBLE APP DETECTED</b>
            You are in the "Google Search App" or a "File Previewer". This will cause a "Bad Object" error.
            <br><br>
            <b>FIX:</b> Tap the 3 dots (⋮) and select <b>"Open in Chrome"</b>.
        </div>

        <p id="main-text">Extract the archive and initialize the core system:</p>
        
        <a href="index.html" class="btn">INITIALIZE SYSTEM</a>
        <button onclick="copyPath()" class="btn btn-secondary">COPY PATH FOR CHROME</button>

        <div class="steps">
            <p>1. Open this file in <b>Chrome</b>.</p>
            <p>2. Tap <b>Initialize</b>.</p>
            <p>3. Use <b>"Add to Home Screen"</b> for permanent offline access.</p>
        </div>
    </div>

    <script>
        const isGSA = /GSA\/\d/.test(navigator.userAgent);
        if (isGSA) {
            document.getElementById('gsa-warning').style.display = 'block';
            document.getElementById('main-text').style.opacity = '0.3';
        }

        function copyPath() {
            const path = window.location.href.replace('MOBILE_BOOTLOADER.html', 'index.html');
            navigator.clipboard.writeText(path).then(() => alert('Path copied! Paste into Chrome.'));
        }
    </script>
</body>
</html>
        `;
        zip.file('MOBILE_BOOTLOADER.html', mobileBootloader);

        // --- WINDOWS "HOME BASE" SERVER ---
        const windowsLauncher = `@echo off
title SynSync Professional - Home Base Server
echo --------------------------------------------------
echo SYNSYNC PROFESSIONAL PORTABLE SYSTEM
echo --------------------------------------------------
echo Initializing Local Provisioning Server...
echo.

powershell -ExecutionPolicy Bypass -Command "$p=8080; $ip=(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.IPAddress -notlike '169.*' } | Select-Object -First 1).IPAddress; $s=[System.Net.HttpListener]::new(); $s.Prefixes.Add('http://localhost:'+$p+'/'); $s.Prefixes.Add('http://'+$ip+':'+$p+'/'); $s.Start(); Write-Host '--- SERVER ONLINE ---' -ForegroundColor Green; Write-Host 'PC ACCESS: http://localhost:'+$p; Write-Host 'MOBILE SYNC URL: http://'+$ip+':'+$p -ForegroundColor Cyan; Write-Host ''; Write-Host '1. On your phone, open Chrome and go to the MOBILE SYNC URL above.'; Write-Host '2. Once loaded, tap Add to Home Screen.'; Write-Host '3. The system is now flashed to your phone.'; Write-Host ''; Start-Process 'http://localhost:'+$p; while($s.IsListening){ $ctx=$s.GetContext(); $f=$ctx.Request.Url.LocalPath.TrimStart('/'); if(!$f){$f='index.html'}; if(Test-Path $f){ $ext=[System.IO.Path]::GetExtension($f); switch($ext){'.html'{$ctx.Response.ContentType='text/html'} '.js'{$ctx.Response.ContentType='application/javascript'} '.json'{$ctx.Response.ContentType='application/json'} '.css'{$ctx.Response.ContentType='text/css'} default{$ctx.Response.ContentType='application/octet-stream'}}; $b=[System.IO.File]::ReadAllBytes($f); $ctx.Response.OutputStream.Write($b,0,$b.Length); } else { $ctx.Response.StatusCode=404; }; $ctx.Response.Close(); }"
pause
`;
        zip.file('START_SERVER.bat', windowsLauncher);

        return await zip.generateAsync({ type: 'blob' });
    }

    static downloadBlob(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
