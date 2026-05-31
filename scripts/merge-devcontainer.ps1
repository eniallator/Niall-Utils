$SCRIPT_DIR = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "..\.devcontainer"

$BASE   = Join-Path $SCRIPT_DIR "devcontainer.base.json"
$LOCAL  = Join-Path $SCRIPT_DIR "devcontainer.local.json"
$OUTPUT = Join-Path $SCRIPT_DIR "devcontainer.json"

if (-not (Test-Path $LOCAL)) {
    throw "Missing local config: $LOCAL"
}

jq -s '.[0] * .[1]' $BASE $LOCAL | Set-Content $OUTPUT

Write-Host "Generated: $OUTPUT"