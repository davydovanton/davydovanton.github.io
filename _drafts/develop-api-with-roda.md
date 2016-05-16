```ruby
# Gemfile
gem 'roda'
```

```ruby
# config/routes.rb
require './lib/api/base'
mount API::Base => '/api'
```

```ruby
# lib/api/base.rb
require 'roda'
require 'json'
require 'users'

module API
  class Base < Roda
    plugin :json
    plugin :all_verbs

    route do |r|
      r.on "v1" do
        r.run API::Users
      end
    end
  end
end
```

```ruby
# lib/api/users.rb
module API
  class Users < Roda
    plugin :json
    plugin :all_verbs

    route do |r|
      r.is 'users' do
        r.get do
          { users: User.last(10) }
        end

        r.post do
          { user: User.new }
        end
      end

      r.is 'users/:id' do |id|
        user = User.find(id)

        r.get do
          { user: user}
        end

        r.patch do
          { user: 'updated' }
        end

        r.delete do
          { user: 'deleted' }
        end
      end
    end
  end
end
```
