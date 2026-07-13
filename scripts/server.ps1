param(
    [int]$Port = 5501,
    [string]$Root = (Resolve-Path "$PSScriptRoot\..").Path
)

Add-Type -AssemblyName System.Web

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Output "Serving $Root on http://localhost:$Port/"

$mimeMap = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "text/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".webmanifest" = "application/manifest+json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $response = $context.Response
        try {
            $request = $context.Request
            $response.KeepAlive = $false

            $localPath = [System.Uri]::UnescapeDataString($request.Url.LocalPath)
            if ($localPath -eq "/") { $localPath = "/index.html" }
            $filePath = Join-Path $Root ($localPath.TrimStart("/"))

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = $mimeMap[$ext]
                if (-not $contentType) { $contentType = "application/octet-stream" }
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentType = $contentType
                if ($request.HttpMethod -eq "HEAD") {
                    $response.ContentLength64 = $bytes.Length
                    $response.OutputStream.Close()
                } else {
                    # Close(byte[], bool) sets Content-Length and writes the body atomically,
                    # which avoids ProtocolViolationException races that manual
                    # ContentLength64 + OutputStream.Write can hit under HttpListener.
                    $response.Close($bytes, $false)
                }
            } else {
                $response.StatusCode = 404
                $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $localPath")
                $response.Close($notFound, $false)
            }
        } catch {
            try { $response.Abort() } catch {}
        }
    }
} finally {
    $listener.Stop()
}
