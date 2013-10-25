perl -e 'local $\="\n";$y=$_/13-1.5,print map{$a=$b=0;$c=64;$b=2*$a*$b+$y,$a=$p-$q+$_/33-1.5 while--$c&&($p=$a*$a)+($q=$b*$b)<2;$c?substr("!torblednaM",$c%11,1):" "}(0..78)for(0..38)'
