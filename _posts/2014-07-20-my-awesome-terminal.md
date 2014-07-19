---
layout: post
title: "My awesome terminal"
---

**TL;DR:**
**DESCRAMBLER: Данная статья является только описанием опыта и каких-либо пристрастий автора. 
Данной статьей я не хочу никого задеть, я просто хочу поделиться тем, что использую каждый день. 
Мое мнение может не совпадать в Вашим, и это прекрасно.** 

Когда-то давно я исползовал Sublime Text, гуишный git(комиты делал в консоле и очень боялся, когда не указывал ключ `-m`) и делал какие-то рельсовые комманды в консоли.
Но потом я пришел в [DoInteractive](http://dointeractive.ru/) (да, это реклама) и парни открыли для меня vim. 
Думаю этот факт и стал переломным моментом в моих поисках и вот теперь, полностью перейдя в консоль, я готов поделиться всем тем, что узнал за это время.

Первым в нашем списке думаю поставить shell. Я остановился на `zsh` и тому было несколько причин.
Начну с [fish](http://fishshell.com/). Скажу честно, поставил, запусти, удачлил. Слишком он мне с первого взгляда не понравился, может я конечно ошибаюсь.
Чем не угодил обычный `bash`? В нем очень не хватало автокомплита с выбором, да и в целом хотелось чего-то нового. 
Так чем же хорош `zsh`? Я составил небольшой список:
0. [Oh my zsh](https://github.com/robbyrussell/oh-my-zsh). Маст хев, имеет кучу плагинов для автодополнения + кучу тем(хотя мне пришлось написать свою)
1. Автокомплит. Он просто божественен. Я могу написать `w/g/rls` нажать tab и в терминале будет красоваться путь `work/gems/rails`, очень удобно. Так же очень удобен выбор по автокомплиту.
2. Алиасы для файлов. Просто в `zshrc` пишете что-то вроде `alias -s {avi,mpeg,mpg,mov,m2v}=mplayer` и все видео файлы будут открываться с помощью `mplayer`. Кстати, очерь рекомендую использовать [mplayer](http://www.mplayerhq.hu/) для прослушивания интернет радио, для этого достаточно сделать небольшой [алиас](https://github.com/davydovanton/dotfiles/blob/master/zsh/zshrc#L75-L76) в shell rc файле
3. Можно настраивать свои хоткем на комманды. Хотя, сказать по правде, стандартные [emacs-ие хоткеи](http://www.catonmat.net/download/readline-emacs-editing-mode-cheat-sheet.pdf) довольно актуальны.
4. Не думаю что это фишка только `zsh`, но в нем я в первый раз заморочился с внешним видом терминала, теперь, у меня, он выглядет так:
![zsh new window]({{ site.url }}/images/2014/07/my-awesome-terminal/zsh-main.jpg)
[Скачать](https://github.com/davydovanton/dotfiles/blob/master/zsh/themes/excess.zsh-theme) ее всегда можно с моего репозитория с конфигами.

Далее я заменил стандартный `grep` на молнеиносный [ag](https://github.com/ggreer/the_silver_searcher). Он реально быстр + я так же заменил стандартный поисковик в виме на него:
{% highlight viml %}
if executable('ag')
  set grepprg=ag\ --nogroup\ --nocolor
  let g:ctrlp_user_command = 'ag %s -l --nocolor -g ""'
  let g:ctrlp_use_caching = 0
else
  let g:ctrlp_custom_ignore = '\.git$\|\.hg$\|\.svn$'
  let g:ctrlp_user_command = ['.git', 'cd %s && git ls-files . --cached --exclude-standard --others']
endif
{% endhighlight %}

Собственно я просто указал виму искать через ag, если тот имеется, в ином случае использовать [git-grep](https://www.kernel.org/pub/software/scm/git/docs/git-grep.html)

Собственно `git` и `tig`. С первым думаю знакомы все. Кроме стандартных комманд, я так же использую [хуки](http://git-scm.com/book/en/Customizing-Git-Git-Hooks), для обновления ctags - файла. Ну а [tig](https://github.com/jonas/tig) заменил мне полностью `git-log` + иногда смотрю `blame` в нем. К его плюсам могу отнести вим лайк хоткеи(поэтому просмотр логов и какой либо информации в разы быстрее чем в гуишном приложении/gitub-е).

Ну а теперь самое интересное, [vim](http://en.wikipedia.org/wiki/Vim_(text_editor)). Думаю, что все знают что это и зачем это надо, поэтому я просто оставлю нексолько полезных ссылок для тех, кто его изучает/хочет начать:
0. `:h` Серьезно, кто бы что не говорил, в виме очень крутая документация, в которой можно найти интересные комманды, например `:TOhtml`
1. [vimcasts.org](http://vimcasts.org) Очень крутые скринкасты по виму от очень крутого парня. Так же можно найти канал этого парня на [vimeo](http://vimeo.com/user1690209) 
2. [Practical Vim](http://pragprog.com/book/dnvim/practical-vim) Книга от создателя vimcasts. Думаю этим все сказано. 
3. [vimgolf](http://vimgolf.com/) Практика, практика и еще раз практика!

Но vim не был бы вимом без огромного числа плагинов, которые расширяют стандартный функционал более чем полностью. Например я использую следующие:
![vim plugins]({{ site.url }}/images/2014/07/my-awesome-terminal/vim-plugins.jpg)

Коротко о самых важных.
Vundle.vim
ag.vim
bufexplorer
ctrlp.vim
seoul256.vim
syntastic
tslime.vim
vim-airline
vim-easydir
vim-endwise
vim-multiple-cursors
vim-plugin-ruscmd
vim-rails
vim-ruby
vim-slime

Но так же, вим не был бы вимом без интересных опций и функций в `vimrc` файле.

nmap <space> <leader>
nmap <leader>n :noh<CR>

nnoremap j gj
nnoremap k gk
vnoremap j gj
vnoremap k gk

nnoremap <C-j> <C-w>j
nnoremap <C-k> <C-w>k
nnoremap <C-h> <C-w>h
nnoremap <C-l> <C-w>l

nmap <leader>hsh :%s/:\([^ ]*\)\(\s*\)=>/\1:/g

cnoreabbrev <expr> W ((getcmdtype() is# ':' && getcmdline() is# 'W')?('w'):('W'))

function! StripWhitespace()
  let save_cursor = getpos(".")
  let old_query = getreg('/')
  :%s/\s\+$//e
  call setpos('.', save_cursor)
  call setreg('/', old_query)
endfunction
noremap <leader>ss :call StripWhitespace()<CR>

if exists('$TMUX')
  let &t_SI = "\<Esc>Ptmux;\<Esc>\<Esc>]50;CursorShape=1\x7\<Esc>\\"
  let &t_EI = "\<Esc>Ptmux;\<Esc>\<Esc>]50;CursorShape=0\x7\<Esc>\\"
else
  let &t_SI = "\<Esc>]50;CursorShape=1\x7"
  let &t_EI = "\<Esc>]50;CursorShape=0\x7"
endif

