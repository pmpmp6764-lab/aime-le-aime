Set fso = CreateObject("Scripting.FileSystemObject")
folder = fso.GetParentFolderName(WScript.ScriptFullName)
html = folder & "\index.html"
If Not fso.FileExists(html) Then
  MsgBox "找不到 index.html，請先把壓縮檔完整解壓到資料夾。", 16, "曖了曖了LIVE"
  WScript.Quit 1
End If
CreateObject("WScript.Shell").Run "cmd /c start """" """ & html & """", 0, False
