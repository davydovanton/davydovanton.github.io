## Stub time in rspec

``` ruby
allow(Time).to receive(:now).and_return(Time.parse("2015-10-31"))
```

## How to text `exit(code)` in minitest
``` ruby
-> { task.invoke }.must_raise SystemExit
```

## how to test cuncurency problem
see sidekiq-stat plugin

