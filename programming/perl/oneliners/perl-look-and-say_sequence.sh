perl -le '$_=1;print&&s/((\d)\2*)/length($1).$2/ge while length()<64'
