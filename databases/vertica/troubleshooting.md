# Little troubleshooting tips on Vertica

This is a compilation of queries to run on Vertica when having performance
issues.

## User sessions

Global queries statistics by nodes:

```
SELECT * FROM QUERY_METRICS;
```

List sessions with an active query running:

```
SELECT * FROM V_MONITOR.SESSIONS where current_statement!='';
```

To close a session: ``` SELECT CLOSE_SESSION('<sessionid>');```

List the number of sessions per user and client host:

```
select user_name, split_part(client_hostname, ':', 1), count(*) as nbr_sessions
from sessions
group by user_name, split_part(client_hostname, ':', 1)
order by nbr_sessions desc;
```


## Number of ROS per node per projection

```
select node_name , table_schema, projection_id, projection_name
  , count(distinct ros_id) distinct_nbr_of_ros
from partitions
group by node_name, table_schema, projection_id, projection_name
order by distinct_nbr_of_ros desc;
```

## Tuple mover in progress

```
select * from tuple_mover_operations where is_executing != 'f';
```

Heavy data load conditions can cause the Tuple Mover to fall behind in
performing moveout or mergeout operations. The resulting large number of ROS
containers can cause some requests to exhaust all available system resources.
Vertica detects this problem and prevents load transactions until the Tuple
Mover has time to catch up. (From the documentation)

Vertica documentation references:

 * [Understanding the Tuple Mover](https://my.vertica.com/docs/7.1.x/HTML/index.htm#Authoring/AdministratorsGuide/TupleMover/UnderstandingTheTupleMover.htm)
 * [Mergeout operations](https://my.vertica.com/docs/7.1.x/HTML/index.htm#Authoring/AdministratorsGuide/TupleMover/Mergeout.htm)
 * [Managing Tuple Mover Operations](https://my.vertica.com/docs/7.1.x/HTML/Content/Authoring/AdministratorsGuide/TupleMover/ManagingTupleMoverOperations.htm)
 * [Tunning the Tuple Mover](https://my.vertica.com/docs/7.1.x/HTML/index.htm#Authoring/AdministratorsGuide/TupleMover/TuningTheTupleMover.htm)
 * [TUPLE_MOVER_OPERATIONS table](https://my.vertica.com/docs/7.1.x/HTML/Content/Authoring/SQLReferenceManual/SystemTables/MONITOR/TUPLE_MOVER_OPERATIONS.htm)
 * [Old but interesting doc about "Too many ROS containers exist for the following projections" error](https://my.vertica.com/docs/5.0/HTML/Master/9976.htm)
 * [Article about the deletions in Vertica](http://community.saas.hp.com/t5/Blog/Having-a-slow-day-Try-optimizing-Vertica-for-deletes/ba-p/882)

## Projection refresh in progress in background

```
select * from PROJECTION_REFRESHES;
```

## Checking node resources

```
SELECT * FROM RESOURCE_USAGE;
```

For snapshot data of the RESOURCE_USAGE table:

```
SELECT * FROM NODE_RESOURCES;
```

Fot checking the resource pools:

```
select * from resource_pool_status ;
```

## Statistics updates




## I/O performance


Vertica has a tool vioperf that measure I/O through put.

dbadmin=> select table_name from data_collector where table_name ilike '%dc_io_%' and node_name ilike '%01%';
      table_name
----------------------
 dc_io_info
 dc_io_info_by_second
 dc_io_info_by_minute
 dc_io_info_by_hour
 dc_io_info_by_day
(5 rows)

select * from dc_io_info;

## Locks

### Check the locks history

```
select dump_lock_usage();
```

Will go to the vertica.log

Check for X Locks. You can have those on several levels but the worst one is
on the global catalog as the whole cluster has to hold the lock.
Check wait statistics (wait for the xlock to be set. generally in
conflict with another xlock)
The global catalog X locks are set when placing a commit, create/drop table/role/privileges.
