# Tips about projections


Vertica best practices on projections:
https://community.dev.hp.com/t5/Vertica-Blog/Best-Practices-for-Refreshing-Large-Projections/ba-p/229505

But if you're like me and you can't affort the reload/delete/rename of the
table, you also can add more TEMP location...


## Getting informations about the projections

Get total size used by projections on each nodes:

```
select node_name, sum( ros_count ) from projection_storage group by node_name; 
```

List the size taken by each chunks of the projections on a table "MyTable":

```
SELECT node_name
  , projection_schema
  , projection_name
  , (SUM(used_bytes)/1024^3)::INT size_in_GB
FROM projection_storage
WHERE anchor_table_name = 'MyTable'
GROUP BY 1,2,3
ORDER BY 4 DESC;
```

## Refreshing projections

List which projection is being refreshed on a specific table:

```
select * from projection_refreshes where anchor_table_name = 'MySchema.MyTable'; 
```

Clear the finished projections form projection_refreshes:
```
SELECT CLEAR_PROJECTION_REFRESHES();
```

Start refreshing the projections of a "MySchema.MyTable" table in a forground session (better do it in a tmux!):

```
select refresh('MySchema.MyTable');
```

Start the refresh of the projections that need one from a background session:
```
select start_refresh();
```
