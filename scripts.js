const {remote} = require('electron');

const appData = remote.app.getPath("appData"); //C:\Users\<Username>\AppData\Roaming
const path = require('path');
const jsonStorage = path.join(appData, 'Real-Time-Services');
console.log(jsonStorage);

function getServicesList() {
    const host = document.getElementById('server').value;
    if (host != null && host != "") {
        console.log(host);
        let gave_proper_host_name = true;
        document.getElementById('error').innerHTML = '';
        document.getElementById('loader').style.display = "";
        document.getElementById('table').style.display = "none";
        const { spawn } = require('child_process');
        // const ps = spawn('powershell.exe', ['-ExecutionPolicy', 'ByPass', '-File', 'services.ps1', '-hostName', host, '-outputPath', 'C:\\Real-Time-Services']);
        // powershell.exe -ExecutionPolicy ByPass -File services.ps1 -hostName "DESKTOP-G5NC17C" -outputPath "C:\Users\Pawan\AppData\Roaming\Real-Time-Services"
        const ps = spawn('powershell.exe', ['-ExecutionPolicy', 'ByPass', '-File', 'services.ps1', '-hostName', host, '-outputPath', jsonStorage]);
        ps.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        ps.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
            gave_proper_host_name = false;
            document.getElementById('table').style.display = "none";
            document.getElementById('loader').style.display = "none";
            document.getElementById('error').innerHTML = 'Please Provide Valid Server Details';
        });

        ps.on('close', (code) => {
            if(gave_proper_host_name) {
                document.getElementById('loader').style.display = "none";
                document.getElementById('error').innerHTML = '';
                document.getElementById('table').style.display = "";
                loadServicesToUI();
            }
            console.log(`child process exited with code ${code}`);
        });
    }
}

function loadServicesToUI(){
    const fs = require('fs');
    const fileURL = path.join(jsonStorage, 'services_list.json');
    const fileData = fs.readFileSync(fileURL,"utf16le");//JSON.parse(require(path.join(jsonStorage, 'services_list.json')))
    const services_list = JSON.parse(fileData.slice(1,fileData.length));
    // FORMAT
    // {
    //     "DisplayName":  "Adobe Acrobat Update Service",
    //     "Name":  "AdobeARMservice",
    //     "Status":  4 // 4 means Running and 1 means Stopped
    // }
    services_list.forEach(element => {
        const body = document.getElementById("tablebody");
        const tr = document.createElement("tr");
        
        const td_displayname = document.createElement("td");
        const td_name = document.createElement("td");
        const td_status = document.createElement("td");
        
        const displayName = element["DisplayName"];
        const name = element["Name"];
        const status = element["Status"];

        td_displayname.innerHTML = displayName;
        td_name.innerHTML = name;
        td_status.innerHTML = status == 4 ? "Running" : "Stopped";

        tr.appendChild(td_displayname);
        tr.appendChild(td_name);
        tr.appendChild(td_status);
        body.appendChild(tr);
    });
}

// $(document).ready(function(){
//     // const availableServers = ["DESKTOP-G5NC17C","BMSIHCMVMDEV5","BMSIHCMVMDEV2"]
//     // $('input.autocomplete').autocomplete({
//     //     source: availableServers,
//     //     limit: 20, // The max amount of results that can be shown at once. Default: Infinity.
//     //     onAutocomplete: function(val) {
//     //     // Callback function when value is autcompleted.
//     //     },
//     //     minLength: 1
//     // });
// })