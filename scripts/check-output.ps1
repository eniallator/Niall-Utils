#Requires -Version 7.3

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true

$cwd = (Resolve-Path "$PSScriptRoot/..").Path

function Try-Pack($cmd) {
    Push-Location $cwd

    try {
        @(Invoke-Expression $cmd | ConvertFrom-Json)[0]
    }
    catch {
        $null
    }
    finally {
        Pop-Location
    }
}

Write-Host 'Packing package for inspection...'

$pack =
    (Try-Pack 'npm pack --json') ??
    (Try-Pack 'yarn npm pack --json') ??
    (Try-Pack 'corepack npm pack --json')

if (-not $pack) {
    throw 'Failed to run npm pack.'
}

$tarball = Join-Path $cwd $pack.filename

Write-Host "Created tarball: $($pack.filename)"

try {
    $files = tar -tf $tarball

    @(
        'package/dist/index.js'
        'package/dist/index.d.ts'
        'package/package.json'
    ).ForEach{
        if ($_ -notin $files) {
            throw "Missing expected file: $_"
        }
    }

    $pkg = tar -xOf $tarball package/package.json | ConvertFrom-Json

    if (
        'dist' -notin $pkg.files -or
        $pkg.main  -ne 'dist/index.js' -or
        $pkg.types -ne 'dist/index.d.ts'
    ) {
        throw 'package.json contains invalid package entry fields.'
    }

    Write-Host 'Package output inspection passed.'
}
finally {
    Remove-Item $tarball -Force -ErrorAction Ignore
}