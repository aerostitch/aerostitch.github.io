# Informations about how DynamoDB works

## Partition sizes limitations

A partition in DynamoDB cannot get over 10GB. This does not limit your ability
to use the partitions or add items keyed at hashes in those partitions; when the
partition limit is reached, DynamoDB will split the partition behind the scenes
while your table, including those partitions are still able to serve traffic.

There's a FAQ (http://aws.amazon.com/dynamodb/faqs/) question that says "If a
particular item collection exceeds the 10GB limit, then you will not be able
to write new items, or increase the size of existing items, for that
particular hash key.". But it only applies when you have Local Secondary
Indexes in your table.

## What happens when increasing the throughput?

When you increase the DynamoDB throughput, it automatically splits the table
into more partitions.

BUT:
If you increase writes from 40k to 60k, then back down to 40k and back up to
60k, if there is ever going to be a split for IOPS on your table, it will
happen the first time you provision up to 60k. The subsequent times you
provision up to 60k will not cause splits.

WARNING: The more partitions you have on your table, the more you will be
sensitive to hotkeys as the throughput is divided EQUALY between the
partitions.

## Partitions capacity limitations

Each partition can have a maximum of 3000 reads per second or 1000 writes per
second. If any provisioning operation would cause any partition in your table
to exceed 3000r/1000w per second, then that partition will be split. Even if
there is excess capacity on the hosts storing the three replicas of each of
your partitions, we do not allow partitions to exceed 3000/1000 ever.

## Pruning DynamoDB datas

DynamoDB, unlike Kinesis, does not allow you to merge partitions, and DynamoDB
will not merge partitions for you automatically.

In the case when a partition has no items (after a pruning for example), that
partition will not go away. It will just be empty.

The recommended (by Amazon) way to prune data is to create a new table, load
the data we want to keep in it and use this new table!
