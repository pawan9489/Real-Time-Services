param(
    [string]$hostName = "25.162.3.12", # 25.162.3.12 # 192.168.56.1 # HYRD5CG6303LH0 # BMSIHCMVMDEV5 # 10.97.115.33 # 10.97.115.30 DEV2
    [string]$serviceLike = "Queue",
    [string]$serviceName = "iHCMUK-Queued Task Service",
    [string]$action = "read",
    [string]$outputPath = "C:\Users\gubbalpa\Desktop\TESTING_SERVICES"
)

If(!(test-path $outputPath))
{
      New-Item -ItemType Directory -Force -Path $outputPath
}

$fullyQualifiedPath = $outputPath + "/services_list.json"
$startResults = $outputPath + "/start_results.txt"

$ipRegex = [regex] "\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b"

$PlainPassword = "Password05"
$SecurePassword = $PlainPassword | ConvertTo-SecureString -AsPlainText -Force
#$UserName = ".\admin"
$UserName = ".\Administrator"
$Credentials = New-Object System.Management.Automation.PSCredential -ArgumentList $UserName, $SecurePassword

$startReturnValue = 0

Function StartService() {
    Switch ($startReturnValue) {
    0 {"The request was accepted." | Set-Content $startResults}
    1 {"The request is not supported." | Set-Content $startResults}
    2 {"The user did not have the necessary access." | Set-Content $startResults}
    3 {"The service cannot be stopped because other services that are running are dependent on it." | Set-Content $startResults}
    4 {"The requested control code is not valid, or it is unacceptable to the service." | Set-Content $startResults}
    5 {"The requested control code cannot be sent to the service because the state of the service (Win32_BaseService.State property) is equal to 0, 1, or 2." | Set-Content $startResults}
    6 {"The service has not been started." | Set-Content $startResults}
    7 {"The service did not respond to the start request in a timely fashion." | Set-Content $startResults}
    8 {"Unknown failure when starting the service." | Set-Content $startResults}
    9 {"The directory path to the service executable file was not found." | Set-Content $startResults}
    10 {"The service is already running." | Set-Content $startResults}
    11 {"The database to add a new service is locked." | Set-Content $startResults}
    12 {"A dependency this service relies on has been removed from the system." | Set-Content $startResults}
    13 {"The service failed to find the service needed from a dependent service." | Set-Content $startResults}
    14 {"The service has been disabled from the system." | Set-Content $startResults}
    15 {"The service does not have the correct authentication to run on the system." | Set-Content $startResults}
    16 {"This service is being removed from the system." | Set-Content $startResults}
    17 {"The service has no execution thread." | Set-Content $startResults}
    18 {"The service has circular dependencies when it starts." | Set-Content $startResults}
    19 {"A service is running under the same name." | Set-Content $startResults}
    20 {"The service name has invalid characters." | Set-Content $startResults}
    21 {"Invalid parameters have been passed to the service." | Set-Content $startResults}
    22 {"The account under which this service runs is either invalid or lacks the permissions to run the service." | Set-Content $startResults}
    23 {"The service exists in the database of services available from the system." | Set-Content $startResults}
    24 {"The service is currently paused in the system." | Set-Content $startResults}
    } 
}

Function DoOnSameComputer() {
    If ($action -eq "read") {
        Write-Host "Same Computer Read"
        Get-WmiObject Win32_Service -Filter "Name LIKE '%$serviceLike%'" | Select-Object -Property DisplayName,Name,State 
    } ElseIf ($action -eq "start") { # Only one action other than Read is Start is Supported
        Write-Host "Same Computer Start"
        $startReturnValue = (Get-WmiObject Win32_Service -Filter "Name = '$serviceName'").InvokeMethod("StartService", $null)
        StartService($startReturnValue)
    }
}

Function DoOnDifferentComputer() {
    If ($action -eq "read") {
        Write-Host "Different Computer Read"
        Get-WmiObject Win32_Service -ComputerName $hostName -Credential $Credentials -Filter "Name LIKE '%$serviceLike%'" | Select-Object -Property DisplayName,Name,State 
    } ElseIf ($action -eq "start") { # Only one action other than Read is Start is Supported
        Write-Host "Different Computer Start"
        $startReturnValue = (Get-WmiObject Win32_Service -ComputerName $hostName -Credential $Credentials -Filter "Name = '$serviceName'").InvokeMethod("StartService", $null)
        StartService($startReturnValue)
    }
}

$localIpAddress=((ipconfig | findstr [0-9].\.)[0]).Split()[-1]

If($ipRegex.Matches($hostName).Success) {
    If ($localIpAddress -eq $hostName) { # Same Computers IP Address
        DoOnSameComputer($action, $serviceLike, $serviceLike)
    } Else { # Different IP address
        DoOnDifferentComputer($action, $serviceLike, $serviceLike)
    }
} Else { # ComputerName
    If (([system.net.dns]::GetHostByAddress($localIpAddress)).hostname.Split("{.}")[0] -eq $hostName) { # Same Computer Name
        DoOnSameComputer($action, $serviceLike, $serviceLike)
    } Else { # Different Computer Name
        DoOnDifferentComputer($action, $serviceLike, $serviceLike)
    }
}
