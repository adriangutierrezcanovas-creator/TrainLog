Add-Type -AssemblyName System.Drawing

# Icono: emoji de levantador de pesas (Segoe UI Emoji, sale en outline negro vía
# GDI+, no a color -- pero encaja con el resto de la app, negro sobre lima) +
# wordmark "LOG" debajo. Proporciones ajustadas a ojo sobre un lienzo de 512 y
# expresadas como fracción de $Size para que escalen igual a cualquier tamaño.

function New-ComboIcon {
    param([int]$Size, [string]$OutPath, [double]$Scale)

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.Clear([System.Drawing.Color]::FromArgb(255, 214, 250, 30))
    $brush = [System.Drawing.Brushes]::Black

    $emoji = [char]::ConvertFromUtf32(0x1F3CB)
    $emojiSize = $Size * 0.5078 * $Scale
    $emojiY = $Size * (0.1172 + (1 - $Scale) * 0.35)
    $labelSize = $Size * 0.1758 * $Scale
    $labelY = $Size * (0.6641 - (1 - $Scale) * 0.10)

    $emojiFont = New-Object System.Drawing.Font("Segoe UI Emoji", $emojiSize, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
    $esz = $g.MeasureString($emoji, $emojiFont, 9999, [System.Drawing.StringFormat]::GenericTypographic)
    $g.DrawString($emoji, $emojiFont, $brush, [single](($Size - $esz.Width) / 2), [single]$emojiY, [System.Drawing.StringFormat]::GenericTypographic)

    $labelFont = New-Object System.Drawing.Font("Segoe UI", $labelSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $lsz = $g.MeasureString("LOG", $labelFont, 9999, [System.Drawing.StringFormat]::GenericTypographic)
    $g.DrawString("LOG", $labelFont, $brush, [single](($Size - $lsz.Width) / 2), [single]$labelY, [System.Drawing.StringFormat]::GenericTypographic)

    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $emojiFont.Dispose(); $labelFont.Dispose(); $g.Dispose(); $bmp.Dispose()
}

function New-FaviconIcon {
    param([int]$Size, [string]$OutPath)

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.Clear([System.Drawing.Color]::FromArgb(255, 214, 250, 30))
    $brush = [System.Drawing.Brushes]::Black

    $emoji = [char]::ConvertFromUtf32(0x1F3CB)
    $emojiSize = $Size * 0.8
    $font = New-Object System.Drawing.Font("Segoe UI Emoji", $emojiSize, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
    $sz = $g.MeasureString($emoji, $font, 9999, [System.Drawing.StringFormat]::GenericTypographic)
    $g.DrawString($emoji, $font, $brush, [single](($Size - $sz.Width) / 2), [single](($Size - $sz.Height) / 2), [System.Drawing.StringFormat]::GenericTypographic)

    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $font.Dispose(); $g.Dispose(); $bmp.Dispose()
}

$iconDir = "E:\APP ENTRENO\TrainLog\assets\icons"
New-ComboIcon -Size 192 -OutPath "$iconDir\icon-192.png" -Scale 1.0
New-ComboIcon -Size 512 -OutPath "$iconDir\icon-512.png" -Scale 1.0
New-ComboIcon -Size 192 -OutPath "$iconDir\icon-192-maskable.png" -Scale 0.72
New-ComboIcon -Size 512 -OutPath "$iconDir\icon-512-maskable.png" -Scale 0.72
New-FaviconIcon -Size 32 -OutPath "$iconDir\favicon-32.png"

Write-Output "Icons generated in $iconDir"
