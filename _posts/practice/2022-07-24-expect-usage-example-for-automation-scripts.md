---
title: Expect usage example for automation scripts
category: practice
tags: expect automation passwd
---

# Introduction
Expect is an extension to Tcl scripting language and provides features to automate interactions between programs and users. For example, it can send password to an SSH command automatically without any user interaction. I will give some insights about what expect can do and some examples in this post.

# Basic examples
## Greeting like a robot
Basically, expect has two keywords to use, `expect` and `send`. `expect` is to receive a certain message or a message pattern and then `send` responds accordingly. The following simple example shows a greeting between two robots. Create a file `greeting.exp` and add following lines:
```bash 
#!/usr/bin/expect -f
expect "Nice to meet you"
send "Nice to meet you, too"
expect eof
```
The shebang line implies this script uses expect and the final line `expect eof` indicates the end of the program. You can run the script by
```console
$ expect greeting.exp
```
or 
```console
$ chmod +x greeting.exp
$ ./greeting.exp
```
and after you type `Nice to meet you`, the program will respond.
```console
$ expect greeting.exp
Nice to meet you
Nice to meet you, too
```
That's interesting, right?

## Automatically SSH to a server
Then we can move to another example which is to login to a server automatically, with an additional keyword `spawn`.

Create a file `ssh.exp` and add the following lines:
```bash
#!/usr/bin/expect -f
set passwd password

spawn ssh bowentan@server.address
expect ".*assword.*"
send "$passwd\r"
expect eof
```
The `set` is used to locally declare a variable `passwd` containing `password`, just like a shell variable. Besides a complete string to match in `expect`, you can also use a regex pattern to match the prompt messages. And the `\r` character is to simulate the `enter` key of the keyboard.

## Automate password resets for a large number of user list
One more example is to add the feature of receiving command line arguments and then use the script to reset the passwords of a large number of users maintained in a list with root privilege.

Create a file `auto_passwd.exp` and add the following lines:
```bash
#!/usr/bin/expect -f

set username [lindex $argv 0]
set password 00000000

spawn passwd $username
expect ".*assword.*"
send "$password\r"
expect eof
```
and the list of users `user.list` is like
```
user1
user2
user3
user4
...
```
then you can change passwords for all users to `00000000` in the list `user.list` by a single command:
```console
$ while read username; do expect auto_passwd.exp $username; done < user.list
```

That's it! Expect has many more helpful features for automation, you can learn more [here](https://core.tcl-lang.org/expect/index).