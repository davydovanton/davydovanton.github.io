`repo.relation.limit(1).with(auto_struct: false).one`
pagination
joins
group
where with block
order
postgres functions (`where { title.ilike('') }`)
commad for bulk save data
```
class BookRepo
  def create_many(list)
    command(:create, books).call(list)
  end
end
```


апдейт для асоциаций
создание данных с асоциациями

