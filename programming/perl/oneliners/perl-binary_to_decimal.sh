perl -e 'printf("%i\n",oct("$_"=~/^0b\d/?$_:"0b".$_))for@ARGV'
