perl -ne 'print if ($seen{$_} .= @ARGV) =~ /210$/' file_1.txt file_2.txt file_3.txt
