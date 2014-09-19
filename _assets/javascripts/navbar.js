!function () {
  'use strict';

  var $navbar = $(".pure-menu.pure-menu-open")
    , tStart = 100
    , tEnd = 500
    , cStart = [0, 120, 231, 0]
    , cEnd = [0, 120, 231, 1]
    , cDiff = [
      cEnd[0] - cStart[0],
      cEnd[1] - cStart[1],
      cEnd[2] - cStart[2],
      cEnd[3] - cStart[3]
    ];

  $(document).scroll(function() {
    var p = ($(this).scrollTop() - tStart) / (tEnd - tStart);
    p = Math.min(1, Math.max(0, p));

    var cBg = [
      Math.round(cStart[0] + cDiff[0] * p),
      Math.round(cStart[1] + cDiff[1] * p),
      Math.round(cStart[2] + cDiff[2] * p),
      cStart[3] + cDiff[3] * p
    ];

    $navbar.css('background-color', 'rgba(' + cBg.join(',') +')');
  });
}();
