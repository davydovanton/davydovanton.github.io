desc 'Publish Updated Blog to GitHub Page'
task :publish do
  puts 'Building project'
  sh 'jekyll build'
  puts 'Relocating blog to GitHub Push Center…'
  cd '_site'
  FileUtils.cp_r './', '../../frontend.io'
  cd '../../frontend.io'
  puts 'Commiting with Current Timestamp…'
  sh "git add . ; git commit -m \"#{ Time.new }\" ; git push origin master"
  puts 'Done.'
end
