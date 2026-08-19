#requires -Version 5.1
# Menu interativo para a suite E2E (Playwright) de Frosted Motion Folio.
# Roda de qualquer diretorio: resolve o repo via $PSScriptRoot, nunca via cwd.
#
# GERADO A PARTIR de assets/launcher-template.ps1 (skill playwright-e2e-suite).
#
# Este site nao tem login/auth nem dados criados por teste (portfolio estatico,
# sem backend) -- por isso este launcher nao tem os itens de sessao/auth nem o
# escape hatch KEEP_TEST_DATA do template original; nao ha nada pra recriar ou
# preservar entre execucoes.

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent $PSScriptRoot

# --- Porta: lida do playwright.config.ts (use.baseURL), nao chutada. ----------
function Get-WebPort {
    $configFile = Join-Path $RepoRoot 'playwright.config.ts'
    $fallback = 8080
    if (-not (Test-Path -LiteralPath $configFile)) { return $fallback }
    $content = Get-Content -LiteralPath $configFile -Raw -ErrorAction SilentlyContinue
    if ($content -match 'baseURL:\s*[''"]https?://[^:''"]+:(\d+)') { return [int]$Matches[1] }
    return $fallback
}
$WebPort = Get-WebPort

$ColorBrand = 'DarkCyan'
$ColorAccent = 'Green'
$ColorDanger = 'Red'
$ColorWarn = 'Yellow'
$ColorMuted = 'DarkGray'

$script:LastResult = $null

function Assert-RepoRoot {
    $marker = Join-Path $RepoRoot 'playwright.config.ts'
    if (-not (Test-Path -LiteralPath $marker)) {
        Write-Host "Erro: nao encontrei playwright.config.ts em '$RepoRoot'." -ForegroundColor $ColorDanger
        Write-Host 'Este script espera viver em <repo>\scripts\fmf-e2e.ps1.' -ForegroundColor $ColorMuted
        exit 1
    }
}

function Read-HostSafe {
    param([string]$Prompt)
    $value = Read-Host $Prompt
    if ($null -eq $value) { return $null }
    return $value.Trim()
}

function Get-SpecFiles {
    param([string]$Under = '')
    $root = Join-Path $RepoRoot 'tests'
    $searchRoot = if ($Under) { Join-Path $root $Under } else { $root }
    if (-not (Test-Path -LiteralPath $searchRoot)) { return @() }
    Get-ChildItem -LiteralPath $searchRoot -Filter '*.spec.ts' -File -Recurse -ErrorAction SilentlyContinue |
        Sort-Object FullName |
        ForEach-Object {
            [PSCustomObject]@{
                RelPath = ($_.FullName.Substring($root.Length + 1) -replace '\\', '/')
                Name    = $_.Name
            }
        }
}

function Test-PortListening {
    param([string]$HostName, [int]$Port, [int]$TimeoutMs = 300)
    if ($Port -le 0) { return $true }
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $ar = $tcp.BeginConnect($HostName, $Port, $null, $null)
        $ok = $ar.AsyncWaitHandle.WaitOne($TimeoutMs, $false)
        if ($ok -and $tcp.Connected) { $tcp.Close(); return $true }
        $tcp.Close()
    } catch { }
    return $false
}

function Test-Prereqs {
    $missing = @()
    foreach ($bin in 'node', 'npm', 'npx') {
        if (-not (Get-Command $bin -ErrorAction SilentlyContinue)) { $missing += $bin }
    }
    if ($missing.Count -gt 0) {
        Write-Host "Erro: nao encontrei no PATH: $($missing -join ', ')." -ForegroundColor $ColorDanger
        Write-Host 'Instale o Node.js (inclui npm/npx) e rode de novo.' -ForegroundColor $ColorMuted
        exit 1
    }

    $pwPkg = Join-Path $RepoRoot 'node_modules\@playwright\test'
    if (-not (Test-Path -LiteralPath $pwPkg)) {
        Write-Host 'Erro: @playwright/test nao esta instalado (node_modules ausente/incompleto).' -ForegroundColor $ColorDanger
        Write-Host "Rode:  cd '$RepoRoot' && npm install" -ForegroundColor $ColorMuted
        exit 1
    }
}

function Show-Menu {
    Clear-Host

    $webOk = Test-PortListening -HostName '127.0.0.1' -Port $WebPort
    $webTxt = if ($webOk) { 'OK' } else { "FORA (porta $WebPort)" }
    $webColor = if ($webOk) { $ColorAccent } else { $ColorDanger }

    $allSpecs = @(Get-SpecFiles)
    $homeSpecs = @(Get-SpecFiles -Under 'home')

    Write-Host '========================================' -ForegroundColor $ColorMuted
    Write-Host '  Frosted Motion Folio :: Playwright E2E' -ForegroundColor $ColorBrand
    Write-Host -NoNewline '  Dev server: ' -ForegroundColor $ColorMuted
    Write-Host $webTxt -ForegroundColor $webColor
    Write-Host "  Specs: $($allSpecs.Count) total ($($homeSpecs.Count) em home/)" -ForegroundColor $ColorMuted

    if ($script:LastResult) {
        $r = $script:LastResult
        $rColor = if ($r.Ok) { $ColorAccent } else { $ColorDanger }
        $rTag = if ($r.Ok) { 'OK' } else { "FALHOU (exit $($r.ExitCode))" }
        Write-Host -NoNewline '  Ultimo: ' -ForegroundColor $ColorMuted
        Write-Host -NoNewline "$($r.Label) " -ForegroundColor White
        Write-Host "$rTag ($($r.Elapsed))" -ForegroundColor $rColor
    }

    Write-Host '========================================' -ForegroundColor $ColorMuted
    Write-Host ''
    Write-Host '  EXECUCAO' -ForegroundColor $ColorMuted
    Write-Host '   [1] Rodar todos os testes'
    Write-Host '   [2] Rodar smoke'
    Write-Host '   [3] Rodar Home (nav, tema, hero, projetos)'
    Write-Host '   [4] Rodar teste especifico'
    Write-Host '   [5] Rodar so os que falharam (--last-failed)'
    Write-Host ''
    Write-Host '  DEBUG' -ForegroundColor $ColorMuted
    Write-Host '   [6] Abrir Playwright UI'
    Write-Host '   [7] Abrir ultimo relatorio HTML'
    Write-Host ''
    Write-Host '   [0] Sair'
    Write-Host ''

    if (-not $webOk) {
        Write-Host "  Aviso: dev server fora do ar -- os testes vao subir 'npm run dev' sozinhos (webServer no playwright.config.ts)," -ForegroundColor $ColorWarn
        Write-Host '  mas se ja tiver um rodando fora (porta ocupada por outra coisa), pare-o antes.' -ForegroundColor $ColorWarn
        Write-Host ''
    }
}

function Invoke-Playwright {
    param([Parameter(Mandatory)][string[]]$PwArgs, [string]$Label = '')

    $display = "npx playwright $($PwArgs -join ' ')"
    $label = if ($Label) { $Label } else { $display }
    Write-Host "> $display" -ForegroundColor $ColorMuted

    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        & npx playwright @PwArgs
    }
    catch {
        Write-Host ''
        Write-Host "Nao consegui executar '$display'." -ForegroundColor $ColorDanger
        Write-Host "Detalhe: $($_.Exception.Message)" -ForegroundColor $ColorMuted
        $script:LastResult = [PSCustomObject]@{ Label = $label; Ok = $false; ExitCode = -1; Elapsed = '--:--' }
        return
    }
    $sw.Stop()

    $elapsed = '{0:mm\:ss}' -f $sw.Elapsed
    $ok = ($LASTEXITCODE -eq 0)
    $script:LastResult = [PSCustomObject]@{ Label = $label; Ok = $ok; ExitCode = $LASTEXITCODE; Elapsed = $elapsed }

    if ($ok) {
        Write-Host "OK ($elapsed)" -ForegroundColor $ColorAccent
    }
    else {
        Write-Host "Falhou -- exit code $LASTEXITCODE ($elapsed)" -ForegroundColor $ColorDanger
    }
}

function Invoke-RunAll {
    Invoke-Playwright -PwArgs @('test', '--project=chromium') -Label 'suite completa'
}

function Invoke-Smoke {
    Invoke-Playwright -PwArgs @('test', 'tests/smoke.spec.ts', '--project=chromium') -Label 'smoke'
}

function Invoke-HomeGroup {
    $specs = @(Get-SpecFiles -Under 'home')
    if ($specs.Count -eq 0) {
        Write-Host 'Nenhum spec em tests/home/ ainda.' -ForegroundColor $ColorWarn
        return
    }
    Invoke-Playwright -PwArgs @('test', 'tests/home', '--project=chromium') -Label 'Home'
}

function Invoke-UiMode {
    Invoke-Playwright -PwArgs @('test', '--ui') -Label 'UI mode'
}

function Invoke-SpecificTest {
    $specs = @(Get-SpecFiles)
    if ($specs.Count -eq 0) {
        Write-Host 'Nenhum arquivo tests/**/*.spec.ts encontrado.' -ForegroundColor $ColorWarn
        return
    }

    Write-Host ''
    for ($i = 0; $i -lt $specs.Count; $i++) {
        Write-Host ("  [{0}] {1}" -f ($i + 1), $specs[$i].RelPath)
    }
    Write-Host ''

    $selection = Read-HostSafe 'Numero do teste'
    $index = 0
    if (-not [int]::TryParse($selection, [ref]$index) -or $index -lt 1 -or $index -gt $specs.Count) {
        Write-Host 'Selecao invalida.' -ForegroundColor $ColorWarn
        return
    }

    $specRelPath = "tests/$($specs[$index - 1].RelPath)"

    if (-not (Test-Path -LiteralPath (Join-Path $RepoRoot $specRelPath))) {
        Write-Host "O arquivo $specRelPath nao existe mais -- lista desatualizada, tente de novo." -ForegroundColor $ColorWarn
        return
    }

    Invoke-Playwright -PwArgs @('test', $specRelPath, '--project=chromium') -Label $specs[$index - 1].RelPath
}

function Invoke-LastFailed {
    Invoke-Playwright -PwArgs @('test', '--last-failed', '--project=chromium') -Label 'so os que falharam'
}

function Invoke-ShowReport {
    Invoke-Playwright -PwArgs @('show-report') -Label 'relatorio HTML'
}

Assert-RepoRoot
Test-Prereqs

Push-Location $RepoRoot
try {
    $exit = $false
    while (-not $exit) {
        Show-Menu
        $choice = Read-HostSafe 'Escolha uma opcao'

        if ($null -eq $choice) {
            Write-Host ''
            Write-Host 'Entrada encerrada (EOF). Saindo.' -ForegroundColor $ColorMuted
            break
        }

        switch ($choice) {
            '1' { Invoke-RunAll }
            '2' { Invoke-Smoke }
            '3' { Invoke-HomeGroup }
            '4' { Invoke-SpecificTest }
            '5' { Invoke-LastFailed }
            '6' { Invoke-UiMode }
            '7' { Invoke-ShowReport }
            '0' { $exit = $true }
            default { Write-Host 'Opcao invalida.' -ForegroundColor $ColorWarn }
        }

        if (-not $exit) {
            Write-Host ''
            Read-Host 'Pressione Enter para voltar ao menu' | Out-Null
        }
    }
}
finally {
    Pop-Location
}
