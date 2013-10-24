perl -MLWP::Simple -le'print$_,"\t=>\t",head$_?"OK":"KO"for@ARGV' http://aerostitch.github.io https://github.com/aerostitch
