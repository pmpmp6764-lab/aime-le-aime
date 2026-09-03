Set sh = CreateObject("Wscript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = dir
sh.Run "powershell -NoLogo -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File """ & dir & "\start.ps1""", 0, False
