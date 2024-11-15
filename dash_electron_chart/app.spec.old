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