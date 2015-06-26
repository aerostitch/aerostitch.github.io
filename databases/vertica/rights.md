# User authorizations-related in Vertica


Duplicate the tables privileges of a role "my_role" from a "prod" schema
to a "preprod" one (Don't forget to give the USAGE privilege on the schema):
```
select 'GRANT '|| privileges_description ||' ON preprod.'|| object_name ||' TO '|| grantee ||';' as TO_EXECUTE
from grants
where grantee = 'my_role'
  and object_type = 'TABLE'
  and object_schema = 'prod';
```

Granting usage on the preprod schema:
```
GRANT USAGE ON SCHEMA ad_stats_rts TO preprod;
```
