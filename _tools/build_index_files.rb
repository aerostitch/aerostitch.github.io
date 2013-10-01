#!/usr/bin/env ruby
#
require 'nokogiri'
require 'fileutils'

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
    doc = Nokogiri::XML::Builder.new do |xml|
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
      file.close unless file == nil
    end
  end
end

build_index_files('..')
Dir.glob('../**/*')
  .delete_if { |fname| /(\/|^)_/.match(fname) or /_(\/|$)/.match(fname) }
  .select {|f| File.directory? f}
  .sort
  .each { |fold|
    build_index_files(fold)
    # Then deploy index.html template file
    FileUtils.copy("#{Website_root}/_tools/templates/index.html", 
              "#{fold}/index.html")
  }
