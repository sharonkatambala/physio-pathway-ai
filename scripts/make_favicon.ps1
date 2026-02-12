Add-Type -AssemblyName System.Drawing
$size = 64
$bmp = New-Object System.Drawing.Bitmap $size, $size
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$bg = [System.Drawing.Color]::FromArgb(255,46,139,87)
$g.Clear($bg)
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 6)
$pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$points = @(
  [System.Drawing.PointF]::new(8,34),
  [System.Drawing.PointF]::new(20,34),
  [System.Drawing.PointF]::new(26,22),
  [System.Drawing.PointF]::new(34,44),
  [System.Drawing.PointF]::new(42,28),
  [System.Drawing.PointF]::new(56,28)
)
$g.DrawLines($pen, $points)
$icon = [System.Drawing.Icon]::FromHandle($bmp.GetHicon())
$fs = New-Object System.IO.FileStream('public\\favicon.ico',[System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()
$g.Dispose()
$bmp.Dispose()
