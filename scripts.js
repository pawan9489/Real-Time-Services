const {remote} = require('electron');

const appData = remote.app.getPath("appData"); //C:\Users\<Username>\AppData\Roaming
const path = require('path');
const fs = require('fs');
const jsonStorage = path.join(appData, 'Real-Time-Services');
// console.log(jsonStorage);

let default_server_list = ["DESKTOP-G5NC17C","BMSIHCMVMDEV5","BMSIHCMVMDEV2"];

const server_list = {"list": default_server_list};
const dataList = document.getElementById('server-list');
// console.log(fs.existsSync(path.join(jsonStorage, 'server_list.json')));
if(!fs.existsSync(path.join(jsonStorage, 'server_list.json'))){
    // fs.writeFile(path.join(jsonStorage, "server_list.json"), server_list, (err) => {
    //     if (err) throw err;
    //     console.log('The file has been saved!');
    // });
    if(!fs.existsSync(jsonStorage)) {
        fs.mkdirSync(jsonStorage);
    }
    fs.writeFileSync(path.join(jsonStorage, "server_list.json"), JSON.stringify(server_list));
    // fs.writeFileSync("S:/Learnings/Electron/test.json", server_list);
} else {
    const fileData = fs.readFileSync(path.join(jsonStorage, "server_list.json"));
    // const list = fs.readFileSync("S:/Learnings/Electron/test.json");
    default_server_list = JSON.parse(fileData)["list"];
}

default_server_list.forEach(function(item) {
    const option = document.createElement('option');
    option.value = item;
    dataList.appendChild(option);
});

function getServicesList() {
    const host = document.getElementById('server').value;
    if (host != null && host != "") {
        console.log(host);
        // Update the Server List
        const fileData = fs.readFileSync(path.join(jsonStorage, "server_list.json"));
        let existing_lsit = JSON.parse(fileData)["list"];
        if(!existing_lsit.includes(host)){ // Dont contain the Host then only
            existing_lsit.push(host);
            const option = document.createElement('option');
            option.value = host;
            dataList.appendChild(option);
            fs.writeFileSync(path.join(jsonStorage, "server_list.json"), JSON.stringify({"list": existing_lsit}));
        }
        // 
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