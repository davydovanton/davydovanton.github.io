//= require_directory ./vendor/
//= require_tree .

!function () {
  'use strict';

  var body = document.body,
    timer;

  window.addEventListener('scroll', function() {
    clearTimeout(timer);
    if(!body.classList.contains('disable-hover')) {
      body.classList.add('disable-hover')
    }

    timer = setTimeout(function(){
      body.classList.remove('disable-hover')
    },500);
  }, false);
}();
