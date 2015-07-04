# Tips about licensing and the size of a Vertica DB


## Current DB size details

```
SELECT audit_license_size();
```

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


## Get raw size of a table

Example for the MySchema.MyTable table.
Note: It can take a long time to return the result as it scans all the ROS

```
select audit('MySchema.MyTable', 0, 1);
```


## Tables and projections compressed size

Projections size:

```
SELECT ANCHOR_TABLE_NAME
  , PROJECTION_SCHEMA
  , ((SUM(USED_BYTES))/1024/1024/1024)  AS TOTAL_SIZE
FROM PROJECTION_STORAGE 
GROUP BY PROJECTION_SCHEMA, ANCHOR_TABLE_NAME
ORDER BY TOTAL_SIZE desc;
```

Tables size (compressed):

```
SELECT anchor_table_schema
  , anchor_table_name
  , sum(used_bytes)/1024/1024/1024::FLOAT as size_in_Gbytes
  , sum(ros_used_bytes)/1024/1024/1024::FLOAT as ros_size_in_Gbytes
  , sum(ros_count) as ros_count
FROM column_storage
GROUP BY anchor_table_schema, anchor_table_name
ORDER BY size_in_Gbytes DESC;
```

Same but by nodes:

```
SELECT anchor_table_schema
  , anchor_table_name
  , node_name
  , sum(used_bytes)/1024/1024/1024::FLOAT as size_in_Gbytes
  , sum(ros_used_bytes)/1024/1024/1024::FLOAT as ros_size_in_Gbytes
  , sum(ros_count) as ros_count
FROM column_storage
GROUP BY anchor_table_schema, anchor_table_name, node_name
ORDER BY size_in_Gbytes DESC;
```

Or by columns:

```
SELECT anchor_table_schema
  , anchor_table_name
  , anchor_table_column_name
  , sum(used_bytes)/1024/1024/1024::FLOAT as size_in_Gbytes
  , sum(ros_used_bytes)/1024/1024/1024::FLOAT as ros_size_in_Gbytes
  , sum(ros_count) as ros_count
FROM column_storage
GROUP BY anchor_table_schema, anchor_table_name, anchor_table_column_name
ORDER BY size_in_Gbytes DESC;
```
