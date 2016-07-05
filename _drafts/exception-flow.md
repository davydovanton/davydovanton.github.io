https://github.com/bbatsov/ruby-style-guide#no-exceptional-flows

http://c2.com/cgi/wiki?DontUseExceptionsForFlowControl
http://code.tutsplus.com/articles/round-table-1-should-exceptions-ever-be-used-for-flow-control--net-30947
http://devblog.avdi.org/2014/05/21/jim-weirich-on-exceptions/
http://dev.mensfeld.pl/2015/03/exceptions-should-not-be-expected-stop-using-them-for-control-flow-or-any-other-logic-handling-in-ruby/
http://www.codinghell.ch/blog/2013/03/31/how-and-when-not-to-use-exceptions/

http://programmers.stackexchange.com/questions/189222/are-exceptions-as-control-flow-considered-a-serious-antipattern-if-so-why
https://www.reddit.com/r/ruby/comments/2ofr1v/alternative_to_exception_handling_for_flow_control/
http://stackoverflow.com/questions/4734512/is-it-good-practice-to-use-exceptions-for-control-flow-in-ruby-or-ruby-on-rails


``` ruby
class TestController
  def index
    # some code
    result = Result.new
    if result.success?
      if other
        return render :index, params: {}
      else
        return render :index, params: {}
      end
    else
      if other
        return render :index, params: {}
      else
        return render :index, params: {}
      end
    end
  end

  def other_index
    # code
  rescue SomeErrorOne
    render :show
  rescue SomeErrorTwo
    render :error
  else
    return render :index, params: {}
  end

  def show
    render *SomeService.call(params)
  end
end

class SomeHandler
  def self.call(params)
    result = Result.new

    if result.success?
      if other
        [:index, params: {}]
      else
        [:index, params: {}]
      end
    else
      if other
        [:index, params: {}]
      else
        [:index, params: {}]
      end
    end
  end
end
```
