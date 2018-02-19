const {remote} = require('electron');

const appData = remote.app.getPath("appData"); //C:\Users\<Username>\AppData\Roaming
const path = require('path');
const fs = require('fs');
const jsonStorage = path.join(appData, 'Real-Time-Services');
// console.log(jsonStorage);

document.getElementById("min-btn").addEventListener("click", (e) => {
    const window = remote.getCurrentWindow();
    window.minimize();
});

// Close app
document.getElementById("close-btn").addEventListener("click", (e) => {
    const window = remote.getCurrentWindow();
    window.close();
});

let default_server_list = ["DESKTOP-G5NC17C","BMSIHCMVMDEV5","BMSIHCMVMDEV2"];

const server_list = {"list": default_server_list};
const dataList = document.getElementById("server-list");
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

// console.log(default_server_list);

default_server_list.forEach(function(item) {
    const option = document.createElement("option");
    option.value = item;
    option.innerText = item;
    dataList.appendChild(option);
});

document.getElementById("add_button").addEventListener("click",addServerToList);
document.getElementById("fetch_button").addEventListener("click",getServicesList);
// document.getElementById("start").addEventListener("click",tryStartingService);

function getServicesList(e) {
    e.preventDefault();
    const host = document.querySelector(".active.selected");
    if (host != null && host != "") {
        const hostName = host.children[0].innerText;
        let gave_proper_host_name = true;
        // After Fetch Click Remove the Error Message if any, add Loader symbol and remove table and clean the table
        document.getElementById('error').innerHTML = '';
        document.getElementById('error').style.display = "none";
        document.getElementById('data_loader').style.display = "";
        document.getElementById('table').style.display = "none";
        $("#tablebody tr").remove();
        // Cleaning of table is done

        const { spawn } = require('child_process');
        // const ps = spawn('powershell.exe', ['-ExecutionPolicy', 'ByPass', '-File', 'services.ps1', '-hostName', host, '-outputPath', 'C:\\Real-Time-Services']);
        // powershell.exe -ExecutionPolicy ByPass -File services.ps1 -hostName "DESKTOP-G5NC17C" -outputPath "C:\Users\Pawan\AppData\Roaming\Real-Time-Services"
        const ps = spawn('powershell.exe', ['-ExecutionPolicy', 'ByPass', '-File', 'services.ps1', '-hostName', hostName, '-outputPath', jsonStorage]);
        ps.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        ps.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
            gave_proper_host_name = false;
            document.getElementById('table').style.display = "none";
            document.getElementById('data_loader').style.display = "none";
            document.getElementById('error').innerHTML = 'Please Provide Valid Server Details';
            document.getElementById('error').style.display = "";
        });

        ps.on('close', (code) => {
            if(gave_proper_host_name) {
                document.getElementById('data_loader').style.display = "none";
                document.getElementById('error').innerHTML = "";
                document.getElementById('table').style.display = "";
                loadServicesToUI();
            }
            console.log(`child process exited with code ${code}`);
        });
    }
}

function loadServicesToUI(){
    const fileURL = path.join(jsonStorage, "services_list.json");
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
        // td_status.innerHTML = status == 4 ? "Running" : "Stopped";
        tr.appendChild(td_displayname);
        tr.appendChild(td_name);


        if(status == 4) {
            td_status.innerHTML = "Running";
        } else {
            const a = document.createElement("a");
            a.setAttribute("class", "waves-effect waves-light modal-trigger");
            a.setAttribute("href", "#modal");
            a.setAttribute("data-display-name",displayName);
            a.setAttribute("data-name",name);
            a.addEventListener("click",openModalStartService);
            a.style.color = "Red";
            a.innerHTML = "Stopped";

            td_status.appendChild(a);
        }
        tr.appendChild(td_status);
        body.appendChild(tr);
    });
}

let global_status_clicked = "";

function tryStartingService(e) {
    e.preventDefault();
    const reg = /(.*Agree to start\s+)(.*)(\s+Service.)/;
    const startMessage = document.getElementById("startMessage").innerText;
    const serviceName = startMessage.match(reg)[2];

    // Loading Screen for starting the Service
    global_status_clicked.lastChild.setAttribute("style",""); // Spin Box
    global_status_clicked.firstChild.setAttribute("style","display:none;"); //  Anchor Tag
    // const { spawn } = require('child_process');
    // // const ps = spawn('powershell.exe', ['-ExecutionPolicy', 'ByPass', '-File', 'services.ps1', '-hostName', host, '-outputPath', 'C:\\Real-Time-Services']);
    // // powershell.exe -ExecutionPolicy ByPass -File services.ps1 -hostName "DESKTOP-G5NC17C" -outputPath "C:\Users\Pawan\AppData\Roaming\Real-Time-Services"
    // const ps = spawn('powershell.exe', ['-ExecutionPolicy', 'ByPass', '-File', 'services.ps1', '-hostName', hostName, '-outputPath', jsonStorage]);
    // ps.stdout.on('data', (data) => {
    //     console.log(`stdout: ${data}`);
    // });
    //
    // ps.stderr.on('data', (data) => {
    //     console.log(`stderr: ${data}`);
    //     gave_proper_host_name = false;
    //     document.getElementById('table').style.display = "none";
    //     document.getElementById('data_loader').style.display = "none";
    //     document.getElementById('error').innerHTML = 'Please Provide Valid Server Details';
    //     document.getElementById('error').style.display = "";
    // });
    //
    // ps.on('close', (code) => {
    //     if(gave_proper_host_name) {
    //         document.getElementById('data_loader').style.display = "none";
    //         document.getElementById('error').innerHTML = "";
    //         document.getElementById('table').style.display = "";
    //         loadServicesToUI();
    //     }
    //     console.log(`child process exited with code ${code}`);
    // });
}

function openModalStartService(e) {
    e.preventDefault();
    const displayName = $(e.srcElement.outerHTML).data("display-name");
    // console.log(e);
    document.getElementById("startMessage").innerText = "Please click Agree to start " + displayName + " Service.";
    // Add Loading Div to the Parent Element of Anchor Tag
    const td_status = e.srcElement.parentElement;
    const spinBox = document.createElement("div");
    const span1 = document.createElement("span");
    const span2 = document.createElement("span");
    const span3 = document.createElement("span");

    spinBox.setAttribute("class", "spin-box");
    spinBox.setAttribute("style","display:none;");
    span1.setAttribute("class", "s1");
    span2.setAttribute("class", "s2");
    span3.setAttribute("class", "s3");

    spinBox.appendChild(span1);
    spinBox.appendChild(span2);
    spinBox.appendChild(span3);
    td_status.appendChild(spinBox);
    global_status_clicked = td_status;
    document.getElementById("start").addEventListener("click",tryStartingService);
}

function addServerToList(e) {
    e.preventDefault();
    // Update the Server List
    const add_server_data = document.getElementById("add");
    if (add_server_data.value != null || add_server_data.value != "") {
        const server_name = add_server_data.value;
        const fileData = fs.readFileSync(path.join(jsonStorage, "server_list.json"));
        let existing_lsit = JSON.parse(fileData)["list"];
        if(!existing_lsit.includes(server_name)){ // Dont contain the Host then only
            existing_lsit.push(server_name);
            const option = document.createElement("option");
            option.value = server_name;
            option.innerText = server_name;
            dataList.appendChild(option);
            // const li = document.createElement("li");
            // const innerSpan = document.createElement("span");
            // li.appendChild(innerSpan);
            // innerSpan.innerHTML = server_name;
            // document.querySelector("ul.select-dropdown").appendChild(li);
            // $("#server-list").trigger("chosen:updated");
            // $("#server-list").selectmenu("refresh",true);
            // $("#server-list").hide().show();
            window.location.reload();
            fs.writeFileSync(path.join(jsonStorage, "server_list.json"), JSON.stringify({"list": existing_lsit}));
        }
    }
}