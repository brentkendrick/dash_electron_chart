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

If there is a port conflict, find the offending PID with:

Mac:
`lsof -i :8050` and stop it with `kill -9 <<PID>>` (replace <<PID>> with the PID number)

Win:
`netstat -ano | findstr :8050` and stop it with `Stop-Process -Id 12572`

## Part 2. Create a local executable file with pyinstaller

Before creating a standalone app that doesn't require a browser, we need to bundle python and all the applicable python libraries into a local executable file.

Note: bundling into a single app.exe with the flag pyinstaller --onefile causes 2 app.exe processes to run on Windows, and one of them needs to be manually shut down every time with Task Manager. Many workarounds were attempted without success. For that reason, the pyinstaller flag --onefile is not recommended. flags such as --noconsole, --windowed do not seem to be necessary.

```bash
 pyinstaller app.py
```

### Step 2. Test the Standalone Executable

After PyInstaller finishes packaging your app, the resulting executable file will be located in the dist/ folder. You can run it directly:

```bash
./dist/app/app.exe
```

This should launch your Dash app (it may take a minute or so to launch), but it will now be a standalone executable without needing to install Python or any dependencies. After you see a message in the terminal that Dash is running, open a browser at localhost:8050 to verify it is working.

## Part 3. Package the Executable and related files into an Electron App

To wrap your Dash app in Electron, you'll need to create an Electron wrapper around the executable. Electron is a framework for building desktop apps using web technologies, and in this case, you can use it to serve the Dash app without launching a separate browser.

### Step 1. Install Electron

You will need to install Node.js and Electron:

Install [Node.js](https://nodejs.org) if you haven't already.

### Step 2: Create an Electron App

Create a simple Electron wrapper for your Dash app. Key files for creation of the app included in this repository include:

- package.json (includes a reference in extraResources to the path for the Dash app.exe file and associated files that get bundled during creation of the electron app, along with some paths for icon files)
- main.js (includes a path to launch the bundled Dash app.exe file referenced above)
- some icon files

Initialize a new Node.js project (creates a basic package.json file if one doesn't exist, but one will exist already in this repo, and it shouldn't be overwritten by the initialization):

```bash
npm init -y
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

To run the Electron app, open 2 consoles. In the first, navigate to the electron-app subdirectory, start the Dash app binary executable:

```bash
../dist/app/app.exe
```

In the second console, in the electron-app subdirectory, run:

```bash
npm start
```

This will launch the Electron app, which will start the Dash app in a browser window.

### Step 4: Package the Electron App

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
