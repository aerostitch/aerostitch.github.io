perl -MMIME::Base64=decode_base64 -e 'print decode_base64 join"",<>' encoded_input_data
