const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let dashAppProcess;

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

    // Start polling for the Dash app to be ready
    pollForDashApp();
    
    mainWindow.on('closed', function () {
        mainWindow = null;
        if (dashAppProcess) dashAppProcess.kill();  // Ensure Dash app shuts down
    });
}

function pollForDashApp() {
    const DASH_APP_URL = 'http://127.0.0.1:8050';

    const checkServer = () => {
        http.get(DASH_APP_URL, (res) => {
            if (res.statusCode === 200) {
                // Server is ready, load the URL
                mainWindow.loadURL(DASH_APP_URL);
            } else {
                // Try again in a moment if server not yet ready
                setTimeout(checkServer, 500);
            }
        }).on('error', () => {
            // Server not ready yet, try again
            setTimeout(checkServer, 500);
        });
    };

    checkServer();
}

function startDashApp() {
    // Reference the DashApp binary in the unpacked `extraResources` directory
    const dashAppPath = path.join(process.resourcesPath, 'DashApp', 'DashApp'); // Ensure binary name matches exactly
    dashAppProcess = spawn(dashAppPath, [], { detached: true });

    dashAppProcess.on('error', (err) => {
        console.error("Failed to start Dash app:", err);
    });

    dashAppProcess.on('exit', (code) => {
        console.log("Dash app exited with code:", code);
    });
}

app.on('ready', () => {
    startDashApp();
    createWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});