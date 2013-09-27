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

/* 
 * This function generates the index of the folder using the index.xml file.
 * Generally this function is used either in the sidebar or in the index pages
 * content
 */
function build_index_folder_content(){
  $.ajax({type: "GET" ,
    url: "index.xml" ,
    dataType: "xml" ,
    success: function(xml){
      $(xml).find('urlset').each(function(){
        var tmp_item = add_index_child_url($(this), $('#index_page_idx'));
      });
    }
  });
}

/*
 * This function is a recusive function that will generate the content of the
 * navigation menu in the index pages
 */
function add_index_child_url(xml, parent_obj){
  $(xml).find('> url').each(function(){
  var item_title = $(this).find('> title').text();
  var item_url = $(this).find('> path').length ? $(this).find('> path').text() : "#";
  var current_obj = add_index_page_list_item(item_title, item_url);
  if($(this).find('> url').length > 0){
    add_index_child_url($(this), current_obj.append($('<u>')));
  }
  parent_obj.append(current_obj);
  });
}

/*
 * This function generates the li element for an url element while processing
 * the index.xml file
 */
function add_index_page_list_item(title, url){
  var a_elt = $('<a>').attr('href',url).append(title);
  var add_elt = $('<li>').append(a_elt);
  return add_elt;
}

