---
title: Awesome Bash tools
category: practice
tags: bash zsh command-tool
date: 2022-07-24 13:25:00 +0800
---

# Oh my zsh
As an alternative to the default bash/shell in terminals, I think zsh is an excellent one to use. The oh-my-zsh is a delightful and community-driven framework for managing zsh configurations and it is able to integrate many plugins into zsh by simple steps. You can explore it from its [official website](https://ohmyz.sh/).

To install on-my-zsh, simply run the following commands,
```console 
$ sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```
or
```console 
$ sh -c "$(wget https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"
```
Then you're done!

## PowerLevel10k theme
There are many color themes for zsh prompt styles. Here I give my favorite one and the example screenshot is as follows.
![powerlevel10k screenshot](/assets/images/p10k.png)

To install this theme, just clone the git repository as below and set `ZSH_THEME="powerlevel10k/powerlevel10k"` in your `~/.zshrc` file, if you are using oh-my-zsh.
```shell
ZSH_THEME="powerlevel10k/powerlevel10k" 
```

For another installation methods, please refer to the [official github](https://github.com/romkatv/powerlevel10k).

# exa
`exa` is a very awesome replacement for `ls` command, with supports for displaying even file type icons. It is mainly written by Rust and hence it will give you a feeling of slow speed.
![example1](/assets/images/exa.png)

I recommend to install `exa` by Rust `cargo`, which is more robust in installations (my experience), using the following single command.
```console
$ cargo install exa
```

For other installation methods, you can visit the [official github](https://github.com/ogham/exa) and go to the installation section.

# fzf
`fzf` is a good plugin in the terminal to find files or search in the command history. It is so convenient and fast that I am using this feature in my all terminals including the ones on servers.
![fzf-preview](/assets/images/fzf.png)

To install it as a git repository, run the following commands.
```console
$ git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
$ ~/.fzf/install
```
and when the installation is complete, `~/.zshrc` will be added automatically to source the configuration fo `fzf` and you don't need to worry about it. If you want to use it as a `vim` plugin, you could add the following line to `~/.vimrc`, if you are using [vim-plug](https://github.com/junegunn/vim-plug).
```vim
Plug 'junegunn/fzf', { 'do': { -> fzf#install() } }
```
After installing, you can type `fzf` and then type some word to search for files in current directory recursively   or `ctrl` + `r` to invoke bash history search mode as follows.
![fzf-s](/assets/images/fzf-s.png)

For more details, please visit the [official site](https://github.com/junegunn/fzf).

# bat
`bat` is an "advanced" version of `cat` with the feature that it can recognize the language used in the file and format the output with highlighting accordingly. 
![bat](/assets/images/bat.png)

You can install `bat` using 
```console
$ cargo install bat
```
or the package manager in your system. Please refer to the [Github site](https://github.com/sharkdp/bat) for more details.

# ncdu
`ncdu` is a very powerful interactive alternative to `df` and `du` commands.
![ncdu](/assets/images/ncdu.png)
You can navigate into or out of a directory and check how much disk space each directory and file uses. Also, you can delete any files and directories inside the `ncdu`. you are able to export the scanning results to a json file by `ncdu -o <file>` and check it in another system with `ncdu` installed by `ncdu -f <file>`.

To install the ncdu on Ubuntu, run the command:
```console
$ sudo apt install ncdu
```
and the source codes and more information can be found in the [official site](https://dev.yorhel.nl/ncdu).

# tldr
`tldr` is an interesting and helpful tool with a similar feature of `man` but `tldr` can provide more compact information of commands with examples.
![tldr](/assets/images/tldr.png)
 
To install `tldr`, you need to have `npm` and run:
```console
$ npm install -g tldr
```
It will need to create an index for first use. For more you can visit the official site [here](https://tldr.sh/).

# fd
`fd` is an easy-to-use alternative to `find` and it can find entries in the system in a more user-friendly way. But it does not support all of functionality of `find`. `fd` is just designed for the majority of usage.
![fd](/assets/images/fd.png)

There are many installation methods, some of which are:
```console
$ sudo apt install fd-find
$ cargo install fd-find
$ npm install -g fd-find
```

# vimrc
This is an integrated configuration of Vim. If you often use `vim` to edit files and write codes, this may give you a good feeling. You can check more details [here](https://github.com/amix/vimrc).
![vim](/assets/images/vim.png)

To install it, run the following commands:
```console
$ git clone --depth=1 https://github.com/amix/vimrc.git ~/.vim_runtime
$ sh ~/.vim_runtime/install_awesome_vimrc.sh
```
and as a plugin, [vim-plug](https://github.com/junegunn/vim-plug) is very helpful to install additional plugins.

# ripgrep
`ripgrep` is a convenient alternative to `grep` command with the ability to recursively search files in directories for a regex pattern.

Use the following commands to install `ripgrep` or other methods provided in the [Github repository](https://github.com/BurntSushi/ripgrep).
```console
$ apt install ripgrep
$ cargo install ripgrep
```

# libqalculate
`libqalculate` is a library providing terminal command to perform mathematical calculations including elementary arithmetics, equations, integrals, unit conventions and so on.
![libqalculate](/assets/images/libqalculate.png)

The installation is somewhat complicated and some errors may occur. I recommend to follow the instructions in [Github](https://github.com/Qalculate/libqalculate).

# Other interesting tools
There are other impressive tools I am using and I list them here. If you are interested in them, you can visit their websites.
1. [grex](https://github.com/pemistahl/grex)
2. [visidata](https://www.visidata.org/)
3. [Thefuck](https://github.com/nvbn/thefuck)
4. [GDB dashboard](https://github.com/cyrus-and/gdb-dashboard)