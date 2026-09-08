#requires -Version 5.1
# Deploy do build estatico (base=/) pra VPS oracle-stage-01, via o alias SSH
# 'ostg01-ts' (ja configurado, passa pela tailnet). Publica em
# /srv/frosted-motion-folio-v2/releases/<timestamp>/ e troca o symlink
# 'current' de forma atomica -- mesmo padrao ja usado la pelo ai-ops-dashboard.
#
# So sobe arquivos estaticos: nada roda em Node/Docker na VPS pra este site.

[CmdletBinding()]
param(
    [string]$SshHost = 'ostg01-ts',
    [string]$RemoteBase = '/srv/frosted-motion-folio-v2'
)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent $PSScriptRoot
$DistDir = Join-Path $RepoRoot 'dist-vps'

Push-Location $RepoRoot
try {
    Write-Host '==> npm run build:vps' -ForegroundColor Cyan
    npm run build:vps
    if ($LASTEXITCODE -ne 0) { throw "build:vps falhou (exit $LASTEXITCODE)" }
    if (-not (Test-Path -LiteralPath (Join-Path $DistDir 'index.html'))) {
        throw "dist-vps/index.html nao apareceu depois do build."
    }

    $timestamp = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')
    $releaseDir = "$RemoteBase/releases/$timestamp"

    Write-Host "==> Enviando para $SshHost`:$releaseDir" -ForegroundColor Cyan
    ssh $SshHost "mkdir -p '$RemoteBase/releases'"
    if ($LASTEXITCODE -ne 0) { throw 'falha ao preparar o diretorio de releases na VPS' }

    scp -r $DistDir "${SshHost}:${releaseDir}"
    if ($LASTEXITCODE -ne 0) { throw "scp falhou (exit $LASTEXITCODE)" }

    Write-Host '==> Trocando o symlink current (atomico)' -ForegroundColor Cyan
    ssh $SshHost "chmod -R a+rX '$releaseDir' && ln -sfn '$releaseDir' '$RemoteBase/current'"
    if ($LASTEXITCODE -ne 0) { throw 'falha ao apontar o symlink current pro novo release' }

    Write-Host "==> OK -- release $timestamp agora e o 'current'." -ForegroundColor Green
    Write-Host '    Releases antigos ficam em releases/ ate voce limpar manualmente.' -ForegroundColor DarkGray
}
finally {
    Pop-Location
}
