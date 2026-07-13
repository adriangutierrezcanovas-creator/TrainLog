Add-Type -AssemblyName System.Drawing

function New-TrainLogIcon {
    param(
        [int]$Size,
        [string]$OutPath,
        [bool]$Maskable
    )

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $bgColor = [System.Drawing.Color]::FromArgb(255, 214, 250, 30)   # lime de la app
    $g.Clear($bgColor)

    $pad = if ($Maskable) { [double]$Size * 0.20 } else { [double]$Size * 0.14 }
    $contentW = [double]$Size - ($pad * 2)
    $contentH = [double]$Size - ($pad * 2)

    $fontFamily = "Segoe UI"
    $fontSize = $contentH * 0.62
    $font = New-Object System.Drawing.Font($fontFamily, $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 17, 17, 17))

    $text = "TL"
    $sz = $g.MeasureString($text, $font, 9999, [System.Drawing.StringFormat]::GenericTypographic)
    $x = $pad + ($contentW - $sz.Width) / 2.0
    $y = $pad + ($contentH - $sz.Height) / 2.0
    $g.DrawString($text, $font, $brush, [single]$x, [single]$y, [System.Drawing.StringFormat]::GenericTypographic)

    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $font.Dispose(); $brush.Dispose()
    $g.Dispose(); $bmp.Dispose()
}

$iconDir = "E:\APP ENTRENO\TrainLog\assets\icons"
New-TrainLogIcon -Size 192 -OutPath "$iconDir\icon-192.png" -Maskable $false
New-TrainLogIcon -Size 512 -OutPath "$iconDir\icon-512.png" -Maskable $false
New-TrainLogIcon -Size 192 -OutPath "$iconDir\icon-192-maskable.png" -Maskable $true
New-TrainLogIcon -Size 512 -OutPath "$iconDir\icon-512-maskable.png" -Maskable $true
New-TrainLogIcon -Size 32 -OutPath "$iconDir\favicon-32.png" -Maskable $false

Write-Output "Icons generated in $iconDir"
