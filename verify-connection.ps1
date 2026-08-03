<#
.SYNOPSIS
    Verifies that the BioLog backend (Render) is reachable, the database
    (Aiven) is connected, and CORS is configured for the Vercel frontend.

.PARAMETER ApiUrl
    The full URL of your Render backend, e.g. https://biolog-api.onrender.com

.PARAMETER FrontendOrigin
    The Vercel frontend origin (used for the CORS check).
    Defaults to https://bio-log-virid.vercel.app

.EXAMPLE
    pwsh verify-connection.ps1 -ApiUrl https://biolog-api.onrender.com
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$ApiUrl,

    [string]$FrontendOrigin = "https://bio-log-virid.vercel.app"
)

$ApiUrl = $ApiUrl.TrimEnd('/')
$pass = 0
$fail = 0

function Test-Step {
    param([string]$Name, [bool]$Condition, [string]$Detail = "")
    if ($Condition) {
        Write-Host "  [PASS] $Name" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "  [FAIL] $Name $Detail" -ForegroundColor Red
        $script:fail++
    }
}

Write-Host "`n=== BioLog Connection Verification ===" -ForegroundColor Cyan
Write-Host "API URL:       $ApiUrl"
Write-Host "Frontend:      $FrontendOrigin`n"

# ── 1. Health check ──────────────────────────────────────────────────
Write-Host "1. Health Check" -ForegroundColor Yellow
try {
    $resp = Invoke-RestMethod -Uri "$ApiUrl/api/health" -Method Get -TimeoutSec 15
    Test-Step "API is reachable" ($null -ne $resp.status)
    Test-Step "Database connected" ($resp.database -eq "connected") "($($resp.database))"
} catch {
    Test-Step "API is reachable" $false $_.Exception.Message
    Test-Step "Database connected" $false
}

# ── 2. CORS headers ──────────────────────────────────────────────────
Write-Host "`n2. CORS Check" -ForegroundColor Yellow
try {
    $corsResp = Invoke-WebRequest -Uri "$ApiUrl/api/employees" `
        -Method Get `
        -Headers @{"Origin" = $FrontendOrigin} `
        -TimeoutSec 15 -ErrorAction SilentlyContinue
    $allowOrigin = $corsResp.Headers["Access-Control-Allow-Origin"]
    Test-Step "CORS allows frontend origin" `
        ($allowOrigin -eq $FrontendOrigin) `
        "(got: $allowOrigin)"
} catch {
    # 401 is expected (no auth) — we just need the CORS header
    if ($_.Exception.Response -and $_.Exception.Response.Headers) {
        $allowOrigin = $_.Exception.Response.Headers["Access-Control-Allow-Origin"]
        Test-Step "CORS allows frontend origin" `
            ($allowOrigin -eq $FrontendOrigin) `
            "(got: $allowOrigin)"
    } else {
        Test-Step "CORS header present" $false $_.Exception.Message
    }
}

# ── 3. API endpoints exist ───────────────────────────────────────────
Write-Host "`n3. Endpoint Check" -ForegroundColor Yellow
$endpoints = @(
    @{ Method = "POST";   Path = "/api/auth/login"         },
    @{ Method = "POST";   Path = "/api/employees/register"  },
    @{ Method = "GET";    Path = "/api/employees"           },
    @{ Method = "POST";   Path = "/api/attendance/clock-in/TEST" },
    @{ Method = "GET";    Path = "/api/reports/hr-summary"  }
)

foreach ($ep in $endpoints) {
    try {
        $params = @{ Uri = "$ApiUrl$($ep.Path)"; Method = $ep.Method; TimeoutSec = 10 }
        if ($ep.Method -eq "GET") { $params.ErrorAction = "SilentlyContinue" }
        Invoke-WebRequest @params -OutVariable _ > $null 2>&1
        $status = $_.Exception.Response.StatusCode.value__
        Test-Step "$($ep.Method) $($ep.Path)" ($status -ne 404) "(HTTP $status)"
    } catch {
        $status = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "N/A" }
        Test-Step "$($ep.Method) $($ep.Path)" ($status -ne 404) "(HTTP $status)"
    }
}

# ── Summary ──────────────────────────────────────────────────────────
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Passed: $pass" -ForegroundColor Green
Write-Host "Failed: $fail" -ForegroundColor Red
if ($fail -eq 0) {
    Write-Host "`nAll checks passed! Backend ↔ Frontend ↔ Database are connected." -ForegroundColor Green
} else {
    Write-Host "`nSome checks failed. Review the output above." -ForegroundColor Yellow
}
