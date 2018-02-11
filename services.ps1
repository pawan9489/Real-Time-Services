# powershell.exe -File services.ps1
# powershell -ExecutionPolicy ByPass -File services.ps1
# powershell.exe -ExecutionPolicy ByPass -File services.ps1 -hostName "DESKTOP-G5NC17C" -outputPath "C:\Users\Pawan\AppData\Roaming\Real-Time-Services"
param(
    [string]$hostName = "DESKTOP-G5NC17C",
    [string]$serviceLike = "*",
    [string]$outputPath = "S:\Learnings\Electron\services"
)

If(!(test-path $outputPath))
{
      New-Item -ItemType Directory -Force -Path $outputPath
}
$fullyQualifiedPath = $outputPath + "/services_list.json"
Write-Host $fullyQualifiedPath

$hostName | ForEach-Object { (Get-Service -Name $serviceLike -computername $_) |
 Select-Object DisplayName, Name, Status  | 
ConvertTo-Json | Out-File $fullyQualifiedPath}

# (Get-Content $fullyQualifiedPath) | 
# Foreach-Object {$_ -replace "\[",'{' }  |  Foreach-Object {$_ -replace "\]",'}'} |
# Out-File $fullyQualifiedPath
