!macro customInstallMode
  StrCpy $isForceCurrentInstall "1"
!macroend

!macro customPageAfterChangeDir
  Var desktopShortcut
  Var desktopShortcutBox

  Page custom desktopShortcutShow desktopShortcutLeave

  Function desktopShortcutShow
    ${if} ${isUpdated}
      Abort
    ${endIf}
    !insertmacro MUI_HEADER_TEXT "Shortcuts" "Choose where to open Onkko's Archive from."
    nsDialogs::Create 1018
    Pop $0
    ${NSD_CreateLabel} 0 0 100% 24u "Onkko's Archive is added to the Start menu. It can also have a shortcut on your desktop."
    Pop $0
    ${NSD_CreateCheckbox} 0 32u 100% 12u "Create a desktop shortcut"
    Pop $desktopShortcutBox
    ${if} $desktopShortcut == ${BST_CHECKED}
      ${NSD_Check} $desktopShortcutBox
    ${endIf}
    nsDialogs::Show
  FunctionEnd

  Function desktopShortcutLeave
    ${NSD_GetState} $desktopShortcutBox $desktopShortcut
  FunctionEnd
!macroend

!macro customInstall
  ${ifNot} ${isUpdated}
  ${andIf} $desktopShortcut != ${BST_CHECKED}
    WinShell::UninstShortcut "$newDesktopLink"
    Delete "$newDesktopLink"
    System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
  ${endIf}
!macroend

!macro customUnInstall
  ${ifNot} ${isUpdated}
    ${GetParent} "$LOCALAPPDATA\${APP_INSTALLER_STORE_FILE}" $R0
    RMDir /r "$R0"
  ${endIf}
!macroend
