/* 
 * Author: Joseph HERLANT
 * Revision: 1.0 - 2013-09-24
 * https://aerostitch.github.io
 *
 * Description:
 * This function generates some parts of the page of my site
 * using twitter bootstrap 3
 */
$(document).ready(function(){
  proceed_offcanvas();
  build_top_menu();
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
    error: function() { 
      $('#menu-header-bar').attr('style', 'display: none;');
      $('body').attr('style', 'padding-top: 10px;');
    },
    success: function(xml){
      $('#menu-header-bar')
    .attr('class','navbar navbar-inverse navbar-fixed-top')
        .append(
          '<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">'
          + ' <span class="icon-bar"></span>'
          + ' <span class="icon-bar"></span>'
          + ' <span class="icon-bar"></span>'
          + '</button>'
          + '<div class="container">'
          + ' <div class="navbar-header">'
          + '   <a class="navbar-brand" href="/">aerostitch\'s tips</a>'
          + ' </div>'
          + ' <div class="navbar-collapse collapse">'
          + '   <ul class="nav navbar-nav" id="menu_left">'
          + '     <li></li>'
          + '   </ul>'
          + ' </div>'
          + '</div>'
          );

      build_topleft_menu(xml);
    }
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
 * This function is meant to create the treeview in the sidebar using ztree
 */
function build_sidebar_treeview_ztree(){
  var setting = {
    view: { dblClickExpand: false, showLine: false },
    data: { simpleData: {enable: true } },
    callback: { onClick: ztree_node_onClick }
  };
  $.ajax({type: "GET" ,
    url: "/index.json" ,
    dataType: "json" ,
    error: function(){
      $('#ztree-div-container').remove();
      $('#show-me-menu-direction').remove();
      if($('#sidebar').children().length == 0)
      {
        $('#global-container-offcanvas').attr('class','');
        $('#left-pane').attr('class', '');
        $('#sidebar').remove();
      }
    },
    success: function(json_tree){
      tree = push_node_in_tree(json_tree);
      console.debug(tree);

      $.fn.zTree.init($("#index_page_idx"), setting, tree);
    }
  });
}

/*
 * This function expands the node when clicking on it
 */
function ztree_node_onClick(e,treeId, treeNode) {
  var zTree = $.fn.zTree.getZTreeObj("index_page_idx");
  zTree.expandNode(treeNode);
}

/*
 * TODO: Document that! :)
 */
function push_node_in_tree(flat_tree){
  tree = [];
  console.debug(flat_tree);
  for (var n = 0; n<flat_tree.length; n++){
    node = flat_tree[n];
    console.debug(node);
    if (node.dir == "/"){
      tree.push(node);
    } else {
      //for (var t=0; t<tree.length; t++){
        tree.push(node);
        console.debug("testa");
      //}
    }
  }
  return tree;
  /*
  node_path = json_node.name.toLowerCase().replace(/ /,'_');
  loc = $(location).attr('pathname').split('/')[url_index].toLowerCase().replace(/ /,'_');
  if(node_path == loc) {
    json_node.open=true;
    if(json_node.children){
      $.each(json_node.children, function(i, node){
        cmp_url_lvl(node, url_index +1);
      })
    }
  }
  */
}

