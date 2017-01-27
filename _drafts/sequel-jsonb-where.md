We have user model with jsonb data field. But we need to serch by data in this field. For this you can use this code:

```sql
SELECT * FROM "applicants" WHERE ("data" @> '{"first_name":"Anton"}'::jsonb)
```

``` ruby
User.where(Sequel.pg_jsonb(:data).contains('first_name'=>'Anton')).all.count
```
