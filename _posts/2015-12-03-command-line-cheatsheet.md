---
layout: post
title: "Blog"
post_title: "UNIX Commandline Cheatsheet"
date: 2015-12-01
image_source: /images/cline.png
excerpt: "A little collection of basic UNIX commands, for my workshop <em>Intro to Penn State high performance computing and UNIX command line</em>"
---

This is the cheatsheet accompanying a workshop I gave recently for the <a href="http://bdss.psu.edu">BDSS IGERT</a> trainees. 


##### Resources
* [Software Carpentry Shell Novice Tutorial](http://swcarpentry.github.io/shell-novice/) (they have other great tutorials as well)
* [Data Science at the Commandline](http://datascienceatthecommandline.com/)
* [LCtHW Tutorial](http://cli.learncodethehardway.org/book/) (covers Windows PowerShell in parallel)
* [Documentation](https://www.gnu.org/software/bash/manual/bash.html) 

##### Basic Commands


###### Filesystem
* Directories in paths are connected by `/.`
* `/` in the beginning of a file means the root directory
* `./` is the current directory
* `../` is the parent directory
* `~/` is the home directory
* Files that start with a `.` are hidden files

###### Moving around

<pre><code>$ pwd               # Where am I?
$ cd [dir]          # Change directory
$ pushd [dir]       # Save current location and change to [dir]
$ popd              # Change back to directory stored with pushd
</code></pre>

###### Moving creating and destroying things
<pre><code>$ cp [origin] [target] # Copy
$ mv [origin] [target] # Move    
$ mkdir [dir]          # Make directory
$ rm (-r) [file]       # Remove [file] (-r for recursive for dirs)
$ touch [file]         # Create empty file
</code></pre>

###### Looking at stuff
<pre><code>$ ls                   # List stuff in current directory 
$ cat [file]           # Print [file] contents stdout
$ head (-n) [file]     # Show first (-n) lines of [file]
$ tail (-n) [file]     # Show the last (-n) lines of [file]
$ less                 # Scroll thought the file
</code></pre>

###### Finding Things
<pre><code>$ find [file/dir]         # Find file or directory
$ grep 'something' [file] # Find string in file
</code></pre>

###### Pipe and Redirect
<pre><code>$ [command] | [programm] # Input the output of [command] to a [program]
$ [command] > [file]     # Create / overwrite [file] containing output of [command]
$ [command] >> [file]    # Append output of [command] to [file]
$ [program] < [file]     # Input content of [file] to [program]
</code></pre>

##### Shell Configuration Example
If you want to make permanent changes to your command line you can do so in your `~/.bashrc` or `~/.bash_profile` (mac) files.
Example: Shortcuts (aliases) for commands you often use. To create the shortcut `ll` for `ls -alH` put the following into your `config` file:  `alias ll='ls -alH'`

##### Editing
<pre><code>nano [file]       # Opens [file] in a simple text editor
</code></pre>

In nano `^` means `cntrl`. So `^X` is `cntrl-X` in case you are confused. 

<pre><code>vim  [file]       # Opens [file] in a more advanced editor

sed               # Stream editor
sed '' [file]     # print the contents of the file
sed 's/[pattern]/[replacement]/' [file]   # replace the first match of [pattern] with [replacement]
sed 's/[pattern]/[replacement]/3' [file]   # replace the third match 
sed 's/[pattern]/[replacement]/g' [file]   # replace all matches
</code></pre>

If you want to learn vim check out [Vim Adventures](http://http://vim-adventures.com/)
See this [tutorial](https://www.digitalocean.com/community/tutorials/the-basics-of-using-the-sed-stream-editor-to-manipulate-text-in-linux) for the basics of `sed` and the [documentation](https://www.gnu.org/software/sed/manual/sed.html) for all the details.
