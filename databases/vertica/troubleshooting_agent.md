---
layout: page
categories: [databases, vertica]
tags: [databases, vertica, Vertica agent]
title: Troubleshooting Vertica agent
---

## agent.key not found

Symptoms:
 * the management console tells you that it cannot connect to the agent
 * `vertica_agent` service is up
 * agent port (`5444`) is not binded to anything (check with a `netstat -ntlup | grep 5444`)

Relevant error message in `/opt/vertica/log/agentStdMsg.log`:
```
Traceback (most recent call last):
  File "./simply_fast.py", line 434, in <module>
    ctx.use_privatekey_file( '/opt/vertica/config/share/agent.key' )
  File "/opt/vertica/oss/python/lib/python2.7/site-packages/pyOpenSSL-0.15.1-py2.7.egg/OpenSSL/SSL.py", line 665, in use_privatekey_file
    self._raise_passphrase_exception()
  File "/opt/vertica/oss/python/lib/python2.7/site-packages/pyOpenSSL-0.15.1-py2.7.egg/OpenSSL/SSL.py", line 640, in _raise_passphrase_exception
    _raise_current_error()
  File "/opt/vertica/oss/python/lib/python2.7/site-packages/pyOpenSSL-0.15.1-py2.7.egg/OpenSSL/_util.py", line 48, in exception_from_error_queue
    raise exception_type(errors)
Error: [('system library', 'fopen', 'No such file or directory'), ('BIO routines', 'FILE_CTRL', 'system lib'), ('SSL routines', 'SSL_CTX_use_PrivateKey_file', 'system lib')]
```

Means that the openssl keys of the agent are not there obviously.
To fix that, you need to regenerate the keys:
```
openssl genrsa 1024 > /opt/vertica/config/share/agent.key
openssl req -new -x509 -nodes -sha1 -days 36500  -key /opt/vertica/config/share/agent.key -subj '/C=US/ST=Massachusetts/L=Billerica/CN=www.vertica.com' > /opt/vertica/config/share/agent.cert
cat /opt/vertica/config/share/agent.cert /opt/vertica/config/share/agent.key > /opt/vertica/config/share/agent.pem
```

You need at least that on the node the MC connects to.
