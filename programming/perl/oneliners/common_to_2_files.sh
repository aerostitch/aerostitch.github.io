perl -ne 'print if ($seen{$_} .= @ARGV) =~ /10$/' file_1.txt file_2.txt
