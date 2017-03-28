$(document).ready(function(){

  /* jQuery: Set the fixed row and column on the browser */

  var prevTop = 0;
  var prevLeft = 0;
  var marginTop = 61; //The parameter of top margin for timeline column

  /* Calculate the coordinates during scrolling and set the menu on the proper location */
  $(window).scroll(function(event){
    var currentTop = $(this).scrollTop();
    var currentLeft = $(this).scrollLeft();
    
    if(prevLeft !== currentLeft) {
      prevLeft = currentLeft;
      $('#header-days').css({'left': -$(this).scrollLeft()})
    }
    if(prevTop !== currentTop) {
      prevTop = currentTop;
      $('#left-timeLine').css({'top': -$(this).scrollTop() + marginTop})
    }
  });
})
