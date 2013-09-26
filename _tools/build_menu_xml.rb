#!/usr/bin/env ruby
#
# Going back from the tool dir to the root dir
Dir.chdir('..')

# Getting only html files in dirs not begining or ending by an underscore
puts Dir.glob('**/index.html')
        .delete_if{|fname| /(\/|^)_/.match(fname) or /_(\/|$)/.match(fname)}
        .sort()

puts '******* Dirs *******'
puts Dir.glob('**/*')
        .delete_if { |fname| /(\/|^)_/.match(fname) or /_(\/|$)/.match(fname) }
        .select { |filename| File.directory? filename }

