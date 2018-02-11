// const appData = require('./main').appData //C:\Users\<Username>\AppData\Roaming
const {remote} = require('electron')

const appData = remote.app.getPath("appData")
const path = require('path');
const jsonStorage = path.join(appData, 'Real-Time-Services')
console.log(jsonStorage)

function getServicesList() {
    const host = document.getElementById('server');
    const { spawn } = require('child_process');
    // const ps = spawn('powershell.exe', ['-ExecutionPolicy', 'ByPass', '-File', 'services.ps1', '-hostName', host, '-outputPath', 'C:\\Real-Time-Services']);
    const ps = spawn('powershell.exe', ['-ExecutionPolicy', 'ByPass', '-File', 'services.ps1', '-hostName', host, '-outputPath', jsonStorage]);
    ps.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    ps.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    ps.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

    // loadServicesToUI();
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
        const ul = document.getElementById("list");
        const li = document.createElement("li");
        li.appendChild(document.createTextNode(element));
        ul.appendChild(li);
    });
}
