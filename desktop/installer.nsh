!macro customUnInstall
  ${ifNot} ${isUpdated}
    ${GetParent} "$LOCALAPPDATA\${APP_INSTALLER_STORE_FILE}" $R0
    RMDir /r "$R0"
  ${endIf}
!macroend
