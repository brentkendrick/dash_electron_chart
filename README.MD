# Building the app

## Part 1. Create the app file in the project directory (e.g. dash_electron_graph):

```py
# app.py

from dash import Dash, html, dcc
import plotly.express as px
import pandas as pd


# Sample data
df = pd.DataFrame(
    {
        "Fruit": ["Apples", "Oranges", "Bananas", "Grapes"],
        "Amount": [4, 1, 2, 5],
        "City": ["SF", "SF", "NYC", "NYC"],
    }
)

fig = px.bar(df, x="Fruit", y="Amount", color="City", barmode="group")

app = Dash(__name__)
app.layout = html.Div(
    children=[
        html.H1(children="Hello Dash"),
        html.Div(children="A simple web app with Dash."),
        dcc.Graph(id="example-graph", figure=fig),
    ]
)


if __name__ == "__main__":
    app.run_server(debug=False)

```

Install the dependencies in requirements.txt, then run the app with

```bash
python app.py
```

If there is a port conflict, find the offending PID with `lsof -i :8050` and stop it with `kill -9 <<PID>>` (replace <<PID>> with the PID number)

## Part 2. Create a local executable file with pyinstaller

Before creating a standalone app that doesn't require a browser, we need to bundle python and all the applicable python libraries into a local executable file.

To ensure that the Dash app works correctly when bundled with PyInstaller, it's better to create a spec file that handles how PyInstaller will package the app.

```python
# app.spec
from PyInstaller.utils.hooks import collect_all

datas, binaries, hiddenimports = collect_all('dash')

block_cipher = None

a = Analysis(['app.py'],
             binaries=binaries,
             datas=datas,
             hiddenimports=hiddenimports,
             pathex=[],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher,
             noarchive=False)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(pyz,
          a.scripts,
          [],
          exclude_binaries=True,
          name='DashApp',
          debug=False,
          bootloader_ignore_signals=False,
          strip=False,
          upx=True,
          console=True)

coll = COLLECT(exe, a.binaries, a.zipfiles, a.datas, strip=False, upx=True, name='DashApp')
```

After modifying the spec file, build the app again using:

```bash
pyinstaller app.spec
```

### Step 2. Test the Standalone Executable

After PyInstaller finishes packaging your app, the resulting executable file will be located in the dist/ folder. You can run it directly:

```bash
./dist/DashApp/DashApp
```

This should launch your Dash app (it may take a minute or so to launch), but it will now be a standalone executable without needing to install Python or any dependencies. After you see a message in the terminal that Dash is running, open a browser at localhost:8050 to verify it is working.

## Part 3. Package the Executable into an Electron App

To wrap your Dash app in Electron, you'll need to create an Electron wrapper around the executable. Electron is a framework for building desktop apps using web technologies, and in this case, you can use it to serve the Dash app without launching a separate browser.

### Step 1. Install Electron

You will need to install Node.js and Electron:

Install [Node.js](https://nodejs.org) if you haven't already.

### Step 2: Create an Electron App

Create a simple Electron wrapper for your Dash app.

In your project folder, create a new directory called electron-app/ and navigate into it:

```bash
mkdir electron-app
cd electron-app
```

Initialize a new Node.js project (creates a basic package.json file):

```bash
npm init -y
```

Create a main.js file in the electron-app directory to launch the Dash app executable in an Electron window:

```javascript
const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");

let mainWindow;
let dashAppProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  // Start polling for the Dash app to be ready
  pollForDashApp();

  mainWindow.on("closed", function () {
    mainWindow = null;
    if (dashAppProcess) dashAppProcess.kill(); // Ensure Dash app shuts down
  });
}

function pollForDashApp() {
  const DASH_APP_URL = "http://127.0.0.1:8050";

  const checkServer = () => {
    http
      .get(DASH_APP_URL, (res) => {
        if (res.statusCode === 200) {
          // Server is ready, load the URL
          mainWindow.loadURL(DASH_APP_URL);
        } else {
          // Try again in a moment if server not yet ready
          setTimeout(checkServer, 500);
        }
      })
      .on("error", () => {
        // Server not ready yet, try again
        setTimeout(checkServer, 500);
      });
  };

  checkServer();
}

function startDashApp() {
  // Reference the DashApp binary in the unpacked `extraResources` directory
  const dashAppPath = path.join(process.resourcesPath, "DashApp", "DashApp"); // Ensure binary name matches exactly
  dashAppProcess = spawn(dashAppPath, [], { detached: true });

  dashAppProcess.on("error", (err) => {
    console.error("Failed to start Dash app:", err);
  });

  dashAppProcess.on("exit", (code) => {
    console.log("Dash app exited with code:", code);
  });
}

app.on("ready", () => {
  startDashApp();
  createWindow();
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  if (mainWindow === null) createWindow();
});
```

### Step 3: Package the Electron App

Install dependencies

```bash
npm install
```

Now, install Electron and Electron Builder to allow packaging the app into a standalone executable:

```bash

npm install electron electron-builder --save-dev
```

Modify your package.json to:

```json
{
  "name": "electron-app",
  "version": "1.0.0",
  "description": "",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "dist": "electron-builder"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "electron": "^33.2.0",
    "electron-builder": "^25.1.8"
  },
  "build": {
    "appId": "com.example.dashappelectron",
    "mac": {
      "target": "dmg"
    },
    "extraResources": [
      {
        "from": "../dist/DashApp",
        "to": "DashApp",
        "filter": ["**/*"]
      }
    ]
  }
}
```

To run the Electron app, open 2 consoles. In the first, navigate to the electron-app subdirectory, start the Dash app binary executable:

```bash
../dist/DashApp/DashApp
```

In the second console, in the electron-app subdirectory, run:

```bash
npm start
```

This will launch the Electron app, which will start the Dash app in a browser window.

### Step 4: Package the Electron App

Install Dependencies: Ensure that all required dependencies for Electron are installed:

Create an App Icon: The build option includes "icon". You can create an .icns file and place it in the build/ directory. This is optional, but it’s a good practice to have an icon for your app.

You can use tools like Icon Slate or [Image2Icon](https://img2icnsapp.com/) to convert an image to the .icns format.

Build the Standalone App: Now, you're ready to package your app. Run the following command to build the Electron app:

```bash
npm run dist
```

This will use electron-builder to:

Package your Electron app.
Include the Dash executable (dist/Dashapp/Dashapp.app from PyInstaller).
Build a DMG or ZIP file for macOS (depending on your configuration).
The resulting output will be in a dist/ folder within your project directory. For example, you should see a DashElectronApp.dmg file, which is your standalone macOS app.
