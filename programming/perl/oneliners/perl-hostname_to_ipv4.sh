perl -MSocket -nle 'printf"%d.%d.%d.%d\n",unpack"C4",$_ for splice @{[gethostbyname$_]},4'
