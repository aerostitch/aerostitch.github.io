# Tips about licensing and the size of a Vertica DB


## DB growth history

Size of the current DB since Jan. 2014 here:

```
SELECT audit_start_timestamp
  , database_size_bytes / ( 1024^3 ) as database_size_gb
  , license_size_bytes / ( 1024^3 )  as license_size_gb
  , usage_percent * 100 as pct_use
FROM v_catalog.license_audits
where audit_start_timestamp >= '2014-01-01 00:00:00'
ORDER BY audit_start_timestamp DESC ;
```

You can use this command to export it as CSV:
```
VERTICA_HOST=myhost.example.com
VERTICA_USER=my.user
VERTICA_PWD=AVerySecuredPwd
VERTICA_DB=MyDatabase
 vsql -h ${VERTICA_HOST} -U ${VERTICA_USER} -w ${VERTICA_PWD} -d ${VERTICA_DB} -F $';' -A -o /tmp/$(date +%Y%m%d)_vertica_prod_size.csv -c "SELECT audit_start_timestamp, database_size_bytes / ( 1024^3 ) as database_size_gb, license_size_bytes / ( 1024^3 )  as license_size_gb, usage_percent * 100 as pct_use FROM v_catalog.license_audits where audit_start_timestamp >= '2014-01-01 00:00:00' ORDER BY audit_start_timestamp DESC ;"
```

TIP: add a "-t" to remove the header if you don't want it in the result!

TIP: adding a space at the begining of the vsql avoid having it added in the
bash history if you're using bash. ;)
