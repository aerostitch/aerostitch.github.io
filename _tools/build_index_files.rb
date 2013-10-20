#!/usr/bin/env ruby
#
require 'nokogiri'

# This is to ensure we are in the same directory as the script
# to enable people to run the script from another directory
script_path = File.dirname(File.expand_path($0))
Dir.chdir(script_path)
Website_root = File.expand_path(script_path +'/..')

def gen_subfolders_node(parent_path, parent_node)
  # Going back from the tool dir to the root dir
  Dir.chdir(parent_path) do
    current_fullpath = Dir.pwd
    Dir.glob('*')
      .delete_if { |fname| /(\/|^)_/.match(fname) or /_(\/|$)/.match(fname) }
      .select {|f| File.directory? f}
      .sort
      .each { |fold|
        parent_node.send('url') do
          parent_node.title(fold.capitalize)
          parent_node.path("#{current_fullpath}/#{fold}".gsub(Website_root,''))
          gen_files_nodes("#{current_fullpath}/#{fold}", parent_node)
          gen_subfolders_node("#{current_fullpath}/#{fold}", parent_node);
        end
      }
  end
end

def gen_files_nodes(dir, parent_node)
  Dir.chdir(dir) do
    current_fullpath = Dir.pwd
    Dir.glob('*.html')
      .delete_if { |fname| 
        /(\/|^)_/.match(fname) or /_(\/|$)/.match(fname) or
        /index\.html$/.match(fname)
      }
      .sort
      .each { |file|
        parent_node.url{
          doc = Nokogiri::HTML(File.open(file)) { |config| config.strict.nonet}
          parent_node.title(doc.search('//html/head/title').text)
          parent_node.path("#{current_fullpath}/#{file}"
                           .gsub(/\.\./,'')
                          .gsub(Website_root,'')
                          )
        }
      }
  end
end

# This gets all the html files and their modification date
def build_index_files(idx_root)
  Dir.chdir(idx_root) do
    idx_root = Dir.pwd
    doc = Nokogiri::XML::Builder.new(:encoding => 'UTF-8') do |xml|
      xml.urlset{
          gen_files_nodes(idx_root,xml)
          gen_subfolders_node(idx_root,xml)
      }
    end
    
    # Finally writing index.xml file
    idx_file = "#{idx_root}/index.xml"
    begin
      file = File.open(idx_file, "w")
      file.write(doc.to_xml)
    rescue IOError => e
      puts "[Error] Could not open file."
      puts e.message
    ensure
      file.close unless file.nil?
    end
  end
end

# Adds the content of a file (located at file_path) to the given html_obj
# for all nodes matching the node_path
def add_file_content_to_node(html_obj, node_path, file_path)
  html_obj.search(node_path).each do |node|
    if File.exist?(file_path)
      node << File.read(file_path)
    else
      puts "[INFO] no #{file_path} file found"
    end
  end
end

# adds the description to the document if description.inc exists
def update_index_html_description(fold_path)
  idx_html = File.open("#{Website_root}/_tools/templates/index.html",'r')
  doc = Nokogiri::HTML(idx_html) { |config| config.strict.nonet}
  idx_html.close()  # File have to be closed to rewrite data in it
  # Adding description content
  add_file_content_to_node(doc, '//div[@id="Description"]',
                           "#{fold_path}/description.inc")
  # Adding the content of google_tags.inc
  # which contains the html headers for google meta tag validation
  # but could also contain google analytics code for example
  # It is added to all index.html pages because 
  add_file_content_to_node(doc, '/html/head',
                           "#{Website_root}/_tools/google_tags.inc")
  # Writing result to the index.html file
  begin
    outfile = File.open("#{fold_path}/index.html",'w')
    outfile.write(doc.to_xml)
  rescue IOError => e
    puts "[Error] proceeding to update of file #{fold_path}/index.html:"
    puts e.message
  ensure
    outfile.close unless outfile.nil?
  end
end

# Now building index.xml files and customizing index.html files
Dir.glob(['../','../**/*'])
  .delete_if { |fname| /(\/|^)_/.match(fname) or /_(\/|$)/.match(fname) }
  .select {|f| File.directory? f}
  .sort
  .each { |fold|
    build_index_files(fold)
    # Then deploy index.html template file and adding customizations to
    # index.html pages
    update_index_html_description(fold)
  }

