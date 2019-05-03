!macro customInstall
  DetailPrint "Register bilbeo URI Handler"
  DeleteRegKey HKCR "bilbeo"
  WriteRegStr HKCR "bilbeo" "" "URL:bilbeo"
  WriteRegStr HKCR "bilbeo" "URL Protocol" ""
  WriteRegStr HKCR "bilbeo\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCR "bilbeo\shell" "" ""
  WriteRegStr HKCR "bilbeo\shell\Open" "" ""
  WriteRegStr HKCR "bilbeo\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
!macroend