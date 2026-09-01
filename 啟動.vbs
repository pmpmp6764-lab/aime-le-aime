Option Explicit
Dim fso, sh, dir, html, i, opened, browsers
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
html = dir & "\index.html"
If Not fso.FileExists(html) Then
  MsgBox "找不到 index.html" & vbCrLf & "請把「啟動.vbs」和 index.html 放在同一個資料夾。", 16, "曖了曖了LIVE (獨享版)"
  WScript.Quit 1
End If
browsers = Array( _
  sh.ExpandEnvironmentStrings("%LocalAppData%\Google\Chrome\Application\chrome.exe"), _
  sh.ExpandEnvironmentStrings("%ProgramFiles%\Google\Chrome\Application\chrome.exe"), _
  sh.ExpandEnvironmentStrings("%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"), _
  sh.ExpandEnvironmentStrings("%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"), _
  sh.ExpandEnvironmentStrings("%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe") _
)
opened = False
For i = 0 To UBound(browsers)
  If fso.FileExists(browsers(i)) Then
    sh.Run """" & browsers(i) & """ --new-window --app=""" & html & """", 1, False
    opened = True
    Exit For
  End If
Next
If Not opened Then sh.Run """" & html & """", 1, False
