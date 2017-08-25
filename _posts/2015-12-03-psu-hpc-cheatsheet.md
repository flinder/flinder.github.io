---
layout: post
title: "PSU ACI Cheatsheet"
post_title: "PSU ACI Cheatsheet"
date: 2015-12-03
image_source: /images/aci_logo.png
excerpt: "Materials for the second part of the workshop <em>Intro to Penn State high performance computing and UNIX command line</em>. Everything you need to run basic programs on Penn States Advanced Cyber Infrastructure (ACI)"
comments: "true"
category: "resources"
---


##### Resources
* See their [website](http://ics.psu.edu/advanced-cyberinfrastructure/) for additional information. 
* This is the old [manual](http://ics.psu.edu/wp-content/uploads/2015/09/Lion_Manual1.docx).

##### Connecting to ACI with ssh

* Unix: `ssh access_id@hostname`
    * Hostname for Legacy (Lion) Systems: `[system_name].rcc.psu.edu`
    * Hostname for New aci systems: `[system_name].aci.ics.psu.edu`
    * You can find the system names and specifications for the legacy systems [here](http://ics.psu.edu/advanced-cyberinfrastructure/ics-aci-infrastructure/lionx-systems/)

* Windows: Use [PuTTY](http://www.putty.org/)
    * In the session tab put the `hostname` (see above) in the `Hostname` field
    * In the `Connection/Data` tab put you user name in Auto-login username
    * Back in Session put a name in the Saved Sessions field and click Save (So you don't have to type the stuff every time)
    * Click open, enter your psu password

* Unix tip: Create a ssh config file:
    * Got `~/.ssh/` (or create the directory if it doesn't exist)
    * Create a file named `config`
    * In this file make an entry for each remote server you want to connect to. Let's say we often connect to hammer, lion-xf, and lion-xg, your config could look like this:

<pre><code>Host xg                        # 'xg' is an arbitrary name you can make up
HostName lionxg.rcc.psu.edu
User [your_access_id]

Host xf
HostName lionxf.rcc.psu.edu
User your_access_id

Host hammer
HostName hammer.rcc.psu.edu
User your_access_id

#Example for server with private key pair
Host my_aws_server
HostName 54.203.110.172
User your_access_id
IdentityFile ~/.ssh/your_ssh_key.pem
</code></pre>

Then you can log in by just these commands in your terminal:
<pre><code>$ ssh xg
$ ssh xf
$ ssh hammer
</code></pre>

##### File Transfer

* Windows: Use [WinSCP](https://winscp.net/eng/download.php). It's a graphical user interface so just drag and drop files.
    * To set it up, click on `Profiles`
    * In the `Quick Connect` tab put in the name of the server (`[system_name].rcc.psu.edu`)
    * Enter your access id
    * Click `OK`
    * Click `Quick Connect`
    * Click `Connect`
    * Enter your psu password

* Unix: Use `sftp` or `scp` for file transfer.
* `sftp`:
    * Connect with `$ sftp access_id@[system_name].rcc.psu.edu`
    * This will bring you to the `sftp` prompt. Navigate on the remote machine with the standard UNIX shell command (`cd`, `pwd`, `ls`, etc.)
    * Navigate on your local machine by prefixing `l` to the command (e.g. `lcd`, `lls`, `lpwd`, etc.)
    * Navigate to the directory pair on remote and local machine between which you want to transfer files.
    * Then use `put [file]` to put a file to the remote machine and `get [file]` to get a file from the remote machine
    * The Hosts specified in your `config` (see above) will also work for `sftp`. For example:  `$ sftp xf`


##### Workflow for submitting a job
* Write your program in a way so you can execute it from the terminal
* Think about how many cores / memory / walltime you need
* Check if the necessary software is installed

<pre><code>[you@lionxf] $ module avail
[you@lionxf] $ module load [software_name]/[software_version]
</code></pre>

* Write your PBS script for the job.
    * PBS commands start with #PBS -l, lines just starting with # are comments, plain commands are have to follow UNIX shell syntax 
    * Here is an template with the most important commands. Copy this into a new text file (for example my_job.pbs, the file extension does not matter) and replace the specifics for your application. :


<pre><code># Request 1 processors on 1 node
#PBS -l nodes=1:ppn=1

# Request walltime (how long will your program run?)
#PBS -l walltime=00:01:00

# Request 1 gigabyte of memory per process
#PBS -l pmem=1gb

# send an email if the job aborts (a) and when it ends (e) 
#PBS -mae

# send the email to this address
#PBS -M [your email address]

# Request that regular output and terminal output go to the same file
#PBS -j oe

# Run your program
# don't forget to load the software modules you are using if necessary
cd $PBS_O_WORKDIR
module load R/3.2.1
Rscript example.R

</code></pre>

* Submit your my_job.pbs to the cluster:

<pre><code>[you@lionxf]$ qsub my_job.pbs
</code></pre>
* Check the status of your job
<pre><code>[you@lionxf]$ qstat -u [penn state access_id]</code></pre>
* If you want to terminate the job early
<pre><code>[you@lionxf]$ qdel [jobnumber]</code></pre>
* Check the output. There will be a file `my_job.o[job_number]` in the directory working that you specified in your `.pbs` file. This file contains all the output your job produced including error messages.
* ???
* Profit

