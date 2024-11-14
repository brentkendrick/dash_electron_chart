const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let dashAppProcess;
const logFilePath = path.join(app.getPath('userData'), 'electron_app_log.txt');

// Function to write logs to a file
function logToFile(message) {
    fs.appendFileSync(logFilePath, `${new Date().toISOString()} - ${message}\n`);
}
// Define path to DashApp based on build or dev environment
const dashAppPath = process.env.NODE_ENV === 'development' 
    ? path.join(__dirname, 'dist', 'DashApp.exe') 
    : path.join(process.resourcesPath, 'DashApp.exe');

// Log the path for troubleshooting
console.log(`DashApp expected at: ${dashAppPath}`);
fs.access(dashAppPath, fs.constants.F_OK, (err) => {
    if (err) {
        console.error("DashApp.exe not found at:", dashAppPath);
    } else {
        console.log("DashApp.exe is correctly found at:", dashAppPath);
    }
});
// Function to create the main application window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false
        }
    });

    mainWindow.loadURL('http://127.0.0.1:8050');
    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null;
        if (dashAppProcess) {
            dashAppProcess.kill();
            logToFile("DashApp process killed on window close.");
        }
    });
}

// Function to start the Dash app as a background process
function startDashApp() {
    const dashAppPath = path.join(process.resourcesPath, 'DashApp', 'DashApp.exe');

    logToFile(`Attempting to start DashApp from: ${dashAppPath}`);

    dashAppProcess = spawn(dashAppPath, [], { detached: true });

    dashAppProcess.on('error', (err) => {
        logToFile(`Failed to start DashApp: ${err}`);
    });

    dashAppProcess.on('exit', (code) => {
        logToFile(`DashApp exited with code: ${code}`);
    });

    logToFile("DashApp process started successfully.");
}

app.on('ready', () => {
    logToFile("Electron app is ready.");
    startDashApp();
    createWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});

logToFile("Main process started.");

// Export log file path for verification
console.log(`Logs are being saved to ${logFilePath}`);