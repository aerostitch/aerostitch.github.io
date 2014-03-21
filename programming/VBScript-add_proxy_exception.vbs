' This script adds one or more proxy exception(s) for IE
' at the begining of the ProxyOverride registery key if
' it does not already exists. IE must be restarted for the
' changes to be taken in account.

exceptions=Array("*.domain1","*.domain2")

for each sException in exceptions
	' Creating the regex to check if the exception to add
	' already exists in the key
	set oRe=New RegExp: oRe.IgnoreCase=True
	oRe.Pattern="(^|;)" & _
		Replace(Replace(sException,".","\."),"*","\*") & _
		"(;|$)"
		
	' Reading the registry
	set oSh=CreateObject("WScript.Shell")
	sRegKey= "HKCU\Software\Microsoft\Windows\" & _
		"CurrentVersion\Internet Settings\ProxyOverride"
	sProxy=oSh.RegRead(sRegKey)

	' Adding the exception if it does not already exists
	if not oRe.Test(sProxy) then
		oSh.RegWrite sRegKey, sException & ";" & sProxy
		WScript.Echo "Exception [" & sException & "] added"
	end if
next
