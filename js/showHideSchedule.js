$(document).ready(function(){
  
  /* Background colors from css*/
  var pre_bgColor       = $('.pre-class').css('background-color');
  var trackA_bgColor    = $('.trackA-class').css('background-color');
  var trackB_bgColor    = $('.trackB-class').css('background-color');

  var ballet_bgColor    = $('.ballet-class').css('background-color');
  var balletCo_bgColor  = $('.balletCo-class').css('background-color');
  var sJazz_bgColor     = $('.streetJazz-class').css('background-color');
  var jazz_bgColor      = $('.jazz-class').css('background-color');
  var tap_bgColor       = $('.tap-class').css('background-color');
  var contemp_bgColor   = $('.contemporary-class').css('background-color');
  var lyrical_bgColor   = $('.lyrical-class').css('background-color');
  var pointe_bgColor    = $('.pointe-class').css('background-color');
  var hiphop_bgColor    = $('.hiphop-class').css('background-color');
  var stretch_bgColor   = $('.stretch-class').css('background-color');
  var acro_bgColor      = $('.acro-class').css('background-color');


  /* Set the selected schedule makes visible when its clicked */
  function visible_itsSchedule(className){
    if(className == '.pre-class' || className == '.trackA-class' || className == '.trackB-class'){
      $(className).css({'opacity': '1', 'color': 'black'});
    }else{
      $(className).parent('.pre-class, .trackA-class, .trackB-class').css({'opacity': '1', 'color': 'black'});
    }
  }

  /* Set the selected schedule makes invisible when its clicked */
  function inVisible_itsSchedule(className){
    if(className == '.pre-class' || className == '.trackA-class' || className == '.trackB-class'){
      $(className).css({'opacity': '0.2','color': 'lightgray'});
    }else{
      $(className).parent('.pre-class, .trackA-class, .trackB-class').css({'opacity': '0.2','color': 'lightgray'});
    }
  }

  /* Set the schedules make visible when its clicked */
  function visible_otherSchedules(className){
    if(className == '.pre-class' || className == '.trackA-class' || className == '.trackB-class'){
      $('.pre-class, .trackA-class, .trackB-class').not(className).css({'opacity': '1', 'color': 'black'});
    }else{
      $('.ballet-class, .balletCo-class, .streetJazz-class, .jazz-class, .tap-class, .contemporary-class, .lyrical-class, .pointe-class, .hiphop-class, .stretch-class, .acro-class').not(className).parent('.pre-class, .trackA-class, .trackB-class').css({'opacity': '1', 'color': 'black'});
    }
  }

  /* Set the schedules make invisible when its clicked */
  function inVisible_otherSchedules(className){
    if(className == '.pre-class' || className == '.trackA-class' || className == '.trackB-class'){
      $('.pre-class, .trackA-class, .trackB-class').not(className).css({'opacity': '0.2','color': 'lightgray'});
    }else{
      $('.ballet-class, .balletCo-class, .streetJazz-class, .jazz-class, .tap-class, .contemporary-class, .lyrical-class, .pointe-class, .hiphop-class, .stretch-class, .acro-class').not(className).parent('.pre-class, .trackA-class, .trackB-class').css({'opacity': '0.2', 'color': 'black'});
    }
  }



  //Flag: whether clicked or not by class level
  var flag_Pre = false;
  var flag_trackA = false;
  var flag_trackB = false;

  var flag_Ballet = false;
  var flag_BalletCo = false;
  var flag_sJazz = false;
  var flag_Jazz = false;
  var flag_Tap = false;
  var flag_Contemp = false;
  var flag_Lyrical = false;
  var flag_Pointe = false;
  var flag_Hiphop = false;
  var flag_Stretch = false;
  var flag_Acro = false;


  $('.ballet-class, .balletCo-class, .streetJazz-class, .jazz-class, .tap-class, .contemporary-class, .lyrical-class, .pointe-class, .hiphop-class, .stretch-class, .acro-class, .pre-class, .pre-class > p, .pre-class > p > b, .trackA-class, .trackA-class > p, .trackA-class > p > b,.trackB-class, .trackB-class > p, .trackB-class > p > b').click(function(){

    var target = $(event.target);

    //Prevent click event overlapped element
    event.stopPropagation();

    if(target.is('.ballet-class')){
      if(flag_Ballet == false){
        visible_itsSchedule('.ballet-class');
        inVisible_otherSchedules('.ballet-class');
        flag_Ballet = true;
      }else{
        visible_otherSchedules('.ballet-class')
        flag_Ballet = false;
      }
    }else if(target.is('.balletCo-class')){
      if(flag_BalletCo == false){
        visible_itsSchedule('.balletCo-class');
        inVisible_otherSchedules('.balletCo-class');
        flag_BalletCo = true;
      }else{
        visible_otherSchedules('.balletCo-class')
        flag_BalletCo = false;
      }      
    }else if(target.is('.streetJazz-class')){
      if(flag_sJazz == false){
        visible_itsSchedule('.streetJazz-class');
        inVisible_otherSchedules('.streetJazz-class');
        flag_sJazz = true;
      }else{
        visible_otherSchedules('.streetJazz-class')
        flag_sJazz = false;
      }      
    }else if(target.is('.jazz-class')){
      if(flag_Jazz == false){
        visible_itsSchedule('.jazz-class');
        inVisible_otherSchedules('.jazz-class');
        flag_Jazz = true;
      }else{
        visible_otherSchedules('.jazz-class')
        flag_Jazz = false;
      }    
    }else if(target.is('.tap-class')){
      if(flag_Tap == false){
        visible_itsSchedule('.tap-class');
        inVisible_otherSchedules('.tap-class');
        flag_Tap = true;
      }else{
        visible_otherSchedules('.tap-class')
        flag_Tap = false;
      }    
    }else if(target.is('.contemporary-class')){
      if(flag_Contemp == false){
        visible_itsSchedule('.contemporary-class');
        inVisible_otherSchedules('.contemporary-class');
        flag_Contemp = true;
      }else{
        visible_otherSchedules('.contemporary-class')
        flag_Contemp = false;
      }    
    }else if(target.is('.lyrical-class')){
      if(flag_Lyrical == false){
        visible_itsSchedule('.lyrical-class');
        inVisible_otherSchedules('.lyrical-class');
        flag_Lyrical = true;
      }else{
        visible_otherSchedules('.lyrical-class')
        flag_Lyrical = false;
      }    
    }else if(target.is('.pointe-class')){
      if(flag_Pointe == false){
        visible_itsSchedule('.pointe-class');
        inVisible_otherSchedules('.pointe-class');
        flag_Pointe = true;
      }else{
        visible_otherSchedules('.pointe-class')
        flag_Pointe = false;
      }    
    }else if(target.is('.hiphop-class')){
      if(flag_Hiphop == false){
        visible_itsSchedule('.hiphop-class');
        inVisible_otherSchedules('.hiphop-class');
        flag_Hiphop = true;
      }else{
        visible_otherSchedules('.hiphop-class')
        flag_Hiphop = false;
      }    
    }else if(target.is('.stretch-class')){
      if(flag_Stretch == false){
        visible_itsSchedule('.stretch-class');
        inVisible_otherSchedules('.stretch-class');
        flag_Stretch = true;
      }else{
        visible_otherSchedules('.stretch-class')
        flag_Stretch = false;
      }    
    }else if(target.is('.acro-class')){
      if(flag_Acro == false){
        visible_itsSchedule('.acro-class');
        inVisible_otherSchedules('.acro-class');
        flag_Acro = true;
      }else{
        visible_otherSchedules('.acro-class')
        flag_Acro = false;
      }    
    }else if(target.is('.pre-class, .pre-class > p, .pre-class > p > b')){
      if(flag_Pre == false){
        visible_itsSchedule('.pre-class');
        inVisible_otherSchedules('.pre-class');
        flag_Pre = true, flag_trackA = false, flag_trackB = false;
      }else{
        visible_otherSchedules('.pre-class');
        flag_Pre = false;
      }     
    }else if(target.is('.trackA-class, .trackA-class > p, .trackA-class > p > b')){
      if(flag_trackA == false){
        visible_itsSchedule('.trackA-class');
        inVisible_otherSchedules('.trackA-class');
        flag_trackA = true, flag_Pre = false, flag_trackB = false;
      }else{
        visible_otherSchedules('.trackA-class');
        flag_trackA = false;
      }   
    }else if(target.is('.trackB-class, .trackB-class > p, .trackB-class > p > b')){
      if(flag_trackB == false){
        visible_itsSchedule('.trackB-class');
        inVisible_otherSchedules('.trackB-class');
        flag_trackB = true, flag_Pre = false, flag_trackA = false;
      }else{
        visible_otherSchedules('.trackB-class');
        flag_trackB = false;
      }
    }
  });

})