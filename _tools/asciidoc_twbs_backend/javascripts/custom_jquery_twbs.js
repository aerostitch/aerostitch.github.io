/* 
 * Author: Joseph HERLANT
 * Revision: 1.0 - 2013-09-24
 * https://aerostitch.github.io
 *
 * Description:
 * This function generates some parts of the page of my site
 * using twitter bootstrap 3.0.0
 */
$(document).ready(function(){
  proceed_offcanvas();
  build_top_menu();
//  build_index_folder_content();
//  include_description_index_page();
  build_sidebar_treeview_ztree();
});

/*
 * Function that comes from the tw offcanvas bootstrap examples
 */
function proceed_offcanvas() {
  $('[data-toggle=offcanvas]').click(function() {
    $('.row-offcanvas').toggleClass('active');
  });
}
    

/*
 * This function generates the menu of the page using twitter bootstrap 3.0.0
 * It uses a "menu.xml" file
 */
function build_top_menu(){
  $.ajax({
    type: "GET" ,
    url: "/menu.xml" ,
    dataType: "xml" ,
    success: build_topleft_menu
  });
}

/*
 * This function is the one that really generates the menu
 * from the content of the menu.xml file
 */
function build_topleft_menu(xml){
  $(xml).find('urlset > url').each(function(){
    var item_title = $(this).find('> title').text();
    var item_url = $(this).find('> path').length ? $(this).find('> path').text() : "";
    var add_elt =  null;

    if ($(this).find('> url').length > 0){
      add_elt = add_level2_menu_node($(this), item_title, item_url);
    } else { 
      add_elt = build_menu_item(item_title, item_url)
    }
    $('#menu_left').append(add_elt);
  });
}

/*
 * This function builds up the dropdown contents of the menu
 */
function add_level2_menu_node(xml, p_title, p_folder){
  var ul_elt = $('<ul>').attr('class','dropdown-menu')
                        .append(build_menu_item(p_title +' tips', p_folder));
  $(xml).find('> url').each(function(){
    var s_title = $(this).find('> title').text();
    var s_url = p_folder +'/';
    s_url += $(this).find('> path').length ? $(this).find('> path').text() : "";
    ul_elt.append(
      build_menu_item(s_title, s_url)
    );
  });
  var a_elt =  
    $('<a>').attr('href','/'+ p_folder)
      .attr('class','dropdown-toggle')
      .attr('data-toggle','dropdown')
      .append(p_title)
      .append($('<b>').attr('class','caret'));
  return $('<li>').attr('class','dropdown')
      .append(a_elt)
      .append(ul_elt);
}

/*
 * This function builds an atomic node of the menu
 */
function build_menu_item(title, url){
  var elt = $('<li>').append($('<a>').attr('href','/' + url).append(title));
  if($(location).attr('href') == url){elt.attr('class','active');}
  return elt
}

/* 
 * This function generates the index of the folder using the index.xml file.
 * Generally this function is used either in the sidebar or in the index pages
 * content
 */
/*
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
*/

/*
 * This function is a recusive function that will generate the content of the
 * navigation menu in the index pages
 */
/*
function add_index_child_url(xml, parent_obj){
  $(xml).find('> url').each(function(){
    var item_title = $(this).find('> title').text();
    var item_url = $(this).find('> path').length ? $(this).find('> path').text() : "#";
    var current_obj = add_index_page_list_item(item_title, item_url);
    if($(this).find('> url').length > 0){
      var p_obj = $('<ul>');
      add_index_child_url($(this), p_obj);
      current_obj.append(p_obj);
    }
    parent_obj.append(current_obj);
  });
}
*/

/*
 * This function generates the li element for an url element while processing
 * the index.xml file
 */
/*
function add_index_page_list_item(title, url){
  var a_elt = $('<a>').attr('href',url).append(title);
  var add_elt = $('<li>').append(a_elt);
  return add_elt;
}
*/

/*
function include_description_index_page(){
  $(function(){
    $("#Description").load("description.inc");
  });
}
*/

/*
 * This function is meant to create the treeview in the sidebar using ztree
 */
function build_sidebar_treeview_ztree(){
  var setting = { data: {simpleData: {enable: true } } };
  $.ajax({type: "GET" ,
    url: "/index.json" ,
    dataType: "json" ,
    success: function(json_tree){
      $.fn.zTree.init($("#index_page_idx"), setting, json_tree);
    }
  });
}
