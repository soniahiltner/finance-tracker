param(
  [string]$BaseUrl = 'https://finance-tracker-client-6p02.onrender.com',
  [string]$ChecklistPath = (Join-Path $PSScriptRoot '..\RELEASE_CHECKLIST.md'),
  [string]$CommitTag = 'post-deploy',
  [string]$Environment = 'prod',
  [ValidateSet('OK', 'FALLO', 'PENDIENTE')]
  [string]$SmokeTransactions = 'PENDIENTE',
  [string]$LCPms = '-',
  [string]$CLS = '-',
  [string]$Responsible = $env:USERNAME,
  [string]$Notes = 'Registro automático'
)

$ErrorActionPreference = 'Stop'

function Test-HeaderValue {
  param(
    [System.Collections.IDictionary]$Headers,
    [string]$Key,
    [string]$ExpectedContains
  )

  $value = $Headers[$Key]
  if ([string]::IsNullOrWhiteSpace($value)) {
    return @{ Ok = $false; Value = '(missing)' }
  }

  if ($ExpectedContains -and ($value -notlike "*$ExpectedContains*")) {
    return @{ Ok = $false; Value = $value }
  }

  return @{ Ok = $true; Value = $value }
}

function Convert-ToSafeCell {
  param([string]$Value)
  if ($null -eq $Value -or $Value -eq '') { return '-' }
  return ($Value -replace '\|', '/' -replace '[\r\n]+', ' ').Trim()
}

$response = Invoke-WebRequest -Uri "$BaseUrl/" -UseBasicParsing
$headers = $response.Headers

$headerChecks = @(
  @{ Key = 'content-security-policy'; Expected = '' },
  @{ Key = 'x-frame-options'; Expected = 'DENY' },
  @{ Key = 'referrer-policy'; Expected = 'strict-origin-when-cross-origin' },
  @{ Key = 'permissions-policy'; Expected = 'geolocation=(), microphone=(), camera=()' },
  @{ Key = 'x-content-type-options'; Expected = 'nosniff' }
)

$headerResults = @{}
$headersOk = $true

foreach ($check in $headerChecks) {
  $result = Test-HeaderValue -Headers $headers -Key $check.Key -ExpectedContains $check.Expected
  $headerResults[$check.Key] = $result
  if (-not $result.Ok) { $headersOk = $false }
}

$html = $response.Content
$jsPath = [regex]::Match($html, 'src="([^"]+\.js[^"]*)"').Groups[1].Value

$cacheOk = $false
$cacheControl = '(missing)'
$assetUrl = '(unknown)'

if (-not [string]::IsNullOrWhiteSpace($jsPath)) {
  $assetUrl = if ($jsPath.StartsWith('http')) { $jsPath } else { "$BaseUrl$jsPath" }
  $assetHead = Invoke-WebRequest -Uri $assetUrl -UseBasicParsing -Method Head
  $cacheControl = $assetHead.Headers['Cache-Control']
  $cacheOk = ($cacheControl -match 'max-age=31536000' -and $cacheControl -match 'immutable')
}

$performanceOk = $true
if ($LCPms -match '^(\d+)(ms)?$') {
  $lcpNumeric = [int]([regex]::Match($LCPms, '\d+').Value)
  if ($lcpNumeric -gt 2800) { $performanceOk = $false }
}
if ($CLS -match '^\d+(\.\d+)?$') {
  $clsNumeric = [double]$CLS
  if ($clsNumeric -gt 0.00) { $performanceOk = $false }
}

$smokeOk = $SmokeTransactions -eq 'OK'

$result = if ($headersOk -and $cacheOk -and $smokeOk -and $performanceOk) { 'OK' } else { 'FALLO' }
$headersStatus = if ($headersOk) { 'OK' } else { 'FALLO' }
$cacheStatus = if ($cacheOk) { 'OK' } else { 'FALLO' }

if (-not (Test-Path $ChecklistPath)) {
  throw "No se encontró el archivo: $ChecklistPath"
}

$content = Get-Content -Path $ChecklistPath -Raw
$date = Get-Date -Format 'yyyy-MM-dd'

$commitCell = Convert-ToSafeCell $CommitTag
$escapedCommit = [regex]::Escape($commitCell)
$duplicatePattern = [regex]"(?m)^\|\s*$date\s*\|\s*`?$escapedCommit`?\s*\|"
if ($duplicatePattern.IsMatch($content)) {
  Write-Host "Ya existe un registro para fecha y commit/tag: $date / $CommitTag"
} else {
  $row = ('| {0} | {1} | {2} | {3} | {4} | {5} | {6} | {7} | {8} | {9} | {10} |' -f $date, $commitCell, (Convert-ToSafeCell $Environment), $headersStatus, $cacheStatus, $SmokeTransactions, (Convert-ToSafeCell $LCPms), (Convert-ToSafeCell $CLS), $result, (Convert-ToSafeCell $Responsible), (Convert-ToSafeCell $Notes))

  $tableHeaderPattern = [regex]'(?m)^\| Fecha\s*\|.*$\r?\n^\|\s*-+.*$'
  $match = $tableHeaderPattern.Match($content)

  if (-not $match.Success) {
    throw 'No se encontró la tabla de registro en RELEASE_CHECKLIST.md'
  }

  $insertAt = $match.Index + $match.Length
  $newContent = $content.Insert($insertAt, "`r`n$row")
  Set-Content -Path $ChecklistPath -Value $newContent -NoNewline -Encoding utf8
  Write-Host "Registro añadido en: $ChecklistPath"
}

Write-Host ''
Write-Host '--- Resumen ---'
Write-Host ("headers: {0}" -f $headersStatus)
Write-Host ("cache:   {0}" -f $cacheStatus)
Write-Host ("smoke:   {0}" -f $SmokeTransactions)
Write-Host ("result:  {0}" -f $result)
Write-Host ("asset:   {0}" -f $assetUrl)
Write-Host ("cc:      {0}" -f $cacheControl)

Write-Host ''
Write-Host '--- Headers ---'
foreach ($check in $headerChecks) {
  $r = $headerResults[$check.Key]
  $status = if ($r.Ok) { 'OK' } else { 'FALLO' }
  Write-Host ("{0}: {1} -> {2}" -f $check.Key, $status, $r.Value)
}
