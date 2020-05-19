---
layout: post
title: "Five common issues with services and dry-monads"
description: "In this blogpost I try to explain how to avoid common problems which I saw in different projects"
tags:
  - ruby
  - services
  - thoughts
  - refactoring
---

Today I found the source code of simple test task in GitHub. The code author used dry-monads, services, and other abstractions. I found some issues in this code and remembered that I saw same issues in other projects. That's why I'm thinking that it can be common issues and it will be a good idea to make a review and explaining how we can improve our code. Also, I expect that this blog post can be useful for "junior/middle" developers and it can be boring for "senior" developers.

**Important**

This blog post based only on my personal experience and I don't what to make "best" code in the world. The main point which I want to provide - share my knowledge and experience for everyone else. Also, I don't want to say that you need to use services or dry-monads. But if you use it you can potentially get issues that I tried to describe in this blog post.

I asked the code author about this publication and he allowed me to do it.

## TLDR

Problems:

* [Naming based on implementation](#naming-based-on-implementation);
* [Redundancy of service objects](#redundancy-of-service-objects);
* [Using of generic names](#using-of-generic-names);
* [State inside a class and mix of parameters and dependencie](#state-inside-a-class-and-mix-of-parameters-and-dependencie);
* [ActiveModel's chain of calls in business logic](#activemodels-chain-of-calls-in-business-logic);

[Finnal result](#finnal-result)

## Original code

The main operation (service) which we call from rails controller looks like this:

```ruby
module Groups
  module Services
    class JoinUser < Service
      def initialize(params, record: ,
        input_validator: Users::Validators::NewUser.new,
        user_exists_check: Users::Services::CheckExists,
        user_creator: Users::Services::Create
      )
        @params = params
        @input_validator = input_validator
        @record = record
        @user_creator = user_creator
        @user_exists_check = user_exists_check
      end

      def call
        validated_params = yield input_validate
        yield business_validate(validated_params.to_h)
        save(validated_params.to_h)
      end

      private

      attr_reader :params, :record, :input_validator, :user_creator, :user_exists_check

      def input_validate
        input_validator.call(params[:group]).to_monad
      end

      def business_validate(validated_params)
        return Failure(:already_exists) if record.users.where(validated_params).exists?
        Success()
      end

      def save(validated_params)
        user_check_result = user_exists_check.new(validated_params[:email]).call
        if user_check_result == Success(:user_not_exists)
          user = yield user_creator.new(validated_params).call

          record.users << user
          return Success(:created)
        end

        record.users << user_check_result.value!

        Success(:created)
      end
    end
  end
end
```

Also, we use two dependencies, which look like this:

```ruby
module Users
  module Service
    class CheckExists < Service
      def initialize(email, model: User)
        @email = email
        @model = model
      end

      def call
        return Success(model.find_by(email: email)) if model.where(email: email).exists?
        Success(:user_not_exists)
      end

      private

      attr_reader :email, :model
    end
  end
end
```

```ruby
module Users
  module Services
    class Create < Service
      def initialize(params,
        input_validator: Users::Validators::NewUser.new,
        model: User
      )
        @params = params
        @input_validator = input_validator
        @model = model
      end

      def call
        yield input_validate
        save
      end

      private

      attr_reader :params, :model, :input_validator

      def input_validate
        input_validator.call(params).to_monad
      end

      def save
        Try() { model.create!(params) }
      end
    end
  end
end
```

## Problems

After reading and understanding the original code I found five places which I want to discribe:

* [Naming based on implementation](#naming-based-on-implementation);
* [Redundancy of service objects](#redundancy-of-service-objects);
* [Using of generic names](#using-of-generic-names);
* [State inside a class and mix of parameters and dependencie](#state-inside-a-class-and-mix-of-parameters-and-dependencie);
* [ActiveModel's chain of calls in business logic](#activemodels-chain-of-calls-in-business-logic);

Let's discuss each part.

### Naming based on implementation

I think that it's a good starting point for refactoring this code is dropping "out of context" words from variables, objects, and services names.

Quick example: you can see `save(validated_params.to_h)` (`Groups::Services::JoinUser` service) line in the original code. After some time to research I understand that the original context is enrolling users on groups. I mean that from the implementation perspective this line should update something in DB. But from business logic service has absolutely different context. That's why I think that `#enrol` will be better than `#save` here.

If you want to use implementation details in naming you should be ready to spend more time getting the context of each method/service and thinking why we have this code here. But if you use naming based on business flow you provide a context that can answer the question "why?" and you can reduce the time for understanding the source code. I think that domain-driven design (DDD in the future) is trying to give the same idea related to naming, that's why if you want to read more about it - DDD books will be a good start (and event storming for understanding better all business events in the system).

### Redundancy of service objects

I can see two global issues in the original source code:
1. The main service depend on a lot of different dependencies (like `Users::Validators::NewUser.new`, `Users::Services::CheckExists`, `Users::Services::Create` and direct model calls like `record.users.where(validated_params).exists?`);
2. Both called services implements only DB logic (checking for the existence of the record and saving data in DB);

Let's start with DB request logic. It's a  great temptation is to make 2 separate services and put DB logic there, like the author of the original example did. I can understand it because you want to isolate parts of your service. But this way has a downside - your business logic looks complicated. For example, let's check two lines in `Groups::Services::JoinUser#save` method:

```ruby
def save(validated_params)
  user_check_result = user_exists_check.new(validated_params[:email]).call
  # We need to execute strange comparation logic with Result monad here
  # 
  # The logic is strange because the monad looks strange in current context. It's complicated to say why `user_not_found` is a success result.
  # We need bussines logic knowledge to say why it is
  if user_check_result == Success(:user_not_exists)

    # We need to use DO notations in the nested method in the current case.
    # That's why we'll get nesting and it can be possible to increase the complication of understanding the data flow in the system
    user = yield user_creator.new(validated_params).call
```

I can see that the author wrapped up the database operation into nested DO notation (which not important in this case) and thus inflated his own code. That's why it looks like those same methods should be in model/repository (if you use repository pattern). Also, we come to the context issue based on the naming of methods, because the service names describe implementation details instead of business steps/logic.

### Using of generic names

You can find a lot of base words in the example like `record`, `user_exists_check`, `validated_params`, `business_validate`, `input_validate`, `params` and others. I covered it in the first issue. It's really hard to understand what these objects/methods do and why we need it without a full context of logic.

For example, read naming for two services and try to answer what each service do here:

* `Groups::Services::JoinUser`
* `Groups::Services::EnrollUser`

When I see `JoinUser` I expect that we take a user from data storage and just join them to a group. But in real world we need to enroll a user to a specific group.

### State inside a class and mix of parameters and dependencie

In the original example, the author used dependency injection (DI in the future) for calling other services and validations. It's a powerful technique with helps with testing and paintability of your project (I suggest to check posts or talks from [solnic](https://twitter.com/_solnic_), [Tim](https://twitter.com/timriley), and [Luca](https://twitter.com/jodosha) if you don't use or see it before).

As you can see the author puts data and dependencies inside the class constructor (`#initialize`) in each service.

```ruby
def initialize(params, record:, # data
  input_validator: Users::Validators::NewUserContract.new, # dependency
  user_exists_check: Users::Services::CheckExists, # dependency
  user_creator: Users::Services::Create # dependency
)

def initialize(email, model: User)
  @email = email  # data
  @model = model # dependency
end

def initialize(params, # data
  input_validator: Users::Validators::NewUserContract.new, # dependency
  model: User # dependency
)
```

It's not a problem in general. But if you use complicated dependencies with long time building (for example rom) or want to use DI in testing you'll get a problem. Also, you'll allocate new objects every action calls, but it's not a critical.

The most critical part of this code states inside a class because you get two issues:

You're losing pure objects conception. It means that you can possibly get bugs related to mutation of your state.

This solution is increasing maintainability of the code. For example, check these two methods from the service object:

* `def save(validated_params)`
* `def save(record, validated_params)`

In the first method, we see `save` method plus `validated_params`. Based on this knowledge I can say that the method just store something in the base and that's all. In the second method, we see that method saves something related to the `record`. The problem here in that method really uses `record` data based on the state of the service inside self but we can't understand it without reading the code.

### ActiveModel's chain of calls in business logic

I didn't use rails last 3 years but I can understand that It's a common approach in rails. I'm talking about lines with `record.users.where(payload).exists?` or something like this. I see two problems in this approach:

1. It's hard to use unit tests for this because you need to mock a chain of methods. It's not a problem if you're using only integration testing but integration testing increases time for your test suite because you use DB calls every time.
2. The issue connected to the first point, you need to make transformation AR DSL to a specific context. For example, say what is better to understand `record.users.where(payload).exists?` or `record.attendee?(payload)`.

## Finnal result

```ruby
module Cource
  module Services
    class EnrollUser < Core::Service
      attr_reader :model, :validator

      def initialize(model: User, validator: Users::Validators::NewUserContract.new)
        @model = model
        @validator = validator
      end

      def call(group, params)
        payload = yield validate_raw_data(params)
        yield group_attendee?(group, payload)

        user = yield find_or_create_by_email(payload[:email])

        success(group.enroll(user))
      end

    private

      def validate_raw_data(payload)
        # don't forget to enable monads extention
        #   Dry::Validation.load_extensions(:monads)
        #
        # https://dry-rb.org/gems/dry-validation/master/extensions/
        validator.call(payload).to_either
      end

      def group_attendee?(group, payload)
        group.attendee?(payload) ? failure(:group_attendee) : success()
      end

      def find_or_create_by_email(payload)
        Try() { model.find_or_create(payload) }.to_result
      end
    end
  end
end

class Group
  def attendee?(payload)
    users.where(payload).exists?
  end

  def enroll(user)
    self.users << user
    self
  end
end

class User
  def self.find_or_create(payload)
    find_by_email(payload[:email]) || create!(payload)
  end
end
```

You can see that I got a different code based on issues which I tried to describe on the top. In this code you can see business steps that you need to do to make something happen (`validation -> user verification for specific source group -> enrolling user`). Also, I dropped unnecessary services and move logic to models with context related names.

This code is not great, also, different developers will use different ways to write this logic and I'm not sure that "true" way exists here. But if you compare services you see that sometimes a better name is more than separate service and one more abstraction.

Also, you will get a code that can be covered by unit tests without any pain. For example, you can test business logic in `#group_attendee?` without any integration tests and complicated preparation of the data:

```ruby
RSpec.describe Cource::Services::EnrollUser, type: :service do
  subject { service.call(group: group, params: params) }

  let(:service) { described_class.new(model: model, validator: validator) }

  let(:model) { ... }
  let(:validator) { ... }

  context 'when user is an attendee for a group' do
    let(:group) { instance_double('Group', attendee?: true) }

    # your tests for one case of logic
  end

  context 'when user is not an attendee for a group' do
    let(:group) { instance_double('Group', attendee?: false) }

    # your tests for other case of logic
  end

  context 'test case with real dependencies for test everythign together' do
    subject { service.call(...) }
    let(:service) { described_class.new }

    # some data preporation

    it { expect(subject).to be_success }
  end
end
```

* *Note to testing part: I'm thinking that you should use the unit and integration testing for full coverage. In my example, I'll also add 1+ integration test for test all contracts between dependencies to be sure that everything is okay with real code and data.*


## Conclusions

* Use context instead of implementation in your code. Context is really important from a maintainability perspective and your colleagues and you from the future say "thank you". Also, you can skip unnecessary questions on PR/MR review process and make it faster;
* Using a good naming is extremely hard. I spent more than 3 years to start writing something understandable for other developers. I can suggest some rules which help me every day;
  * Imagine a real world process. For example in the original example try to imagine how this logic should work from a user perspective. Forget about CRUD or SQL implementation. Just write real steps on how a user can do something. In my case, I wrote, "as a user if I have valid data in my form or profile AND if I didn't attend this course group I can attend". Based on these words I found important steps and used this note for creating names for my methods/services;
  * If you want to use common words like `user_exists_check`, `input_validate`, etc. make a pause and ask yourself what you want to explain from real world perspective;
  * This approach takes some time and can be difficult. But it can be good practice for improving your skills as a developer. And knowing a domain can be useful in the future to understand tasks or communicate with colleagues better;
* Sometimes is better to use models for DB logic instead of creating a new service object with common behavior;
* It's a good idea to split data and dependencies for each service object. In this case, you can avoid unnecessary allocation, cache some initializations and drop mutable state inside objects;
* Using model methods instead of a chain of DSL methods can be profitable from two perspectives: adding a good name for each DB request instead of a "pure" SQL and simplify unit testing and avoiding mocking chain of methods;

## Useful links

* [dry-monads and DO notations guide](https://dry-rb.org/gems/dry-monads/1.3) - if you never work with it and don't know how it works;
* [Event storming](https://www.lucidchart.com/blog/ddd-event-storming) - you can try to adopt this idea to get more context and information about your system;
* [Tim's talk](https://www.youtube.com/watch?v=B26rbJfRoZo) where he described dry-rb ideas and services with separated data and dependencies;

## UPD

1. Added `validate_raw_data` method. Thanks mpak for mention it (from comments)
