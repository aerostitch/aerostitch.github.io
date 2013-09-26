/* 
 * Author: Joseph HERLANT
 * Revision: 1.0 - 2013-09-24
 * https://aerostitch.github.io
 *
 * Description:
 * This function generates the menu of the page using twitter bootstrap 3.0.0
 * It uses a "menu.xml" file
 */
$(document).ready(function(){
  $.ajax({
    type: "GET" ,
    url: "/menu.xml" ,
    dataType: "xml" ,
    success: build_top_menu
  });
});

/*
 * This function is the one that really generates the menu
 * from the content of the xml file
 */
function build_top_menu(xml){
  $(xml).find('urlset > url').each(function(){
    var item_title = $(this).find('> title').text();
    var item_url = $(this).find('> loc').length ? $(this).find('> loc').text() : "";
    var a_elt = null;
    var add_elt =  null;
    if ($(this).find('> url').length > 0){
      var ul_elt = $('<ul>').attr('class','dropdown-menu');
      $(this).find('> url').each(function(){
        var s_title = $(this).find('> title').text();
        var s_url = $(this).find('> loc').length ? $(this).find('> loc').text() : "";
        ul_elt.append(
          $('<li>').append(
            $('<a>').attr('href',s_url).append(s_title)
          )
        );
      });
      a_elt =  
        $('<a>').attr('href','#')
          .attr('class','dropdown-toggle')
          .attr('data-toggle','dropdown')
          .append(item_title)
          .append($('<b>').attr('class','caret'));
      add_elt = $('<li>').attr('class','dropdown')
          .append(a_elt)
          .append(ul_elt);
    } else { 
      a_elt = $('<a>').attr('href',item_url).append(item_title);
      add_elt = $('<li>').append(a_elt);
      if($(location).attr('href') == item_url){add_elt.attr('class','active');}
    }
    $('#menu_left').append(add_elt);
  });
}

