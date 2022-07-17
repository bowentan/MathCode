---
title: Delta server user guide
category: project
tags: slurm job-submission
date: 2022-07-17 22:35:00 +0800
---

# Overview
This document serves as a guide and reference for using the servers in Team Delta, specially for `ss620a` and `ss620b`. For `dl380a` and `delta2`, please refer to the `delta_important_notes_for_using_servers` repository by `bowentan` in GitLab.

People who are involved in the team and need to use the servers are supposed to read this document and follow the rules so as to efficiently and safely use the servers for their projects.

# General
## Storage
In `ss620a` and `ss620b`, there are six storage devices with each 15T size, named as `/data*`. You can store data and perform tasks in those directories. However, these storage are local to respective server and thus they are unable to be access from each other. Be careful to store your project data and perform tasks consistently.

In addition as the current server `delta2`, disk2 workspace directory is mounted already but the path is change to `/disk2/workspace`.

## Tools and databases
### Tools
All tools are managed by Lmod and you can view and search any tool you expect to use by command `module avail <tool name>` or `module spider <tool name>`. If you want to use any tools, `module spider` them at first to check what should be loaded before loading themselves and then `module load` to load the tools.

If you cannot find the tool you want to use, please contact the administrators at first.

### Databases
Databases are accessible by environmental variables currently. By typing `$biodb_` in the terminal prompt and then press `tab` key, you can see the available databases.

## Basic job submission using SLURM
### Submit jobs
In `ss620a` and `ss620b`, SLURM is used to manage job submissions, instead of SGE. To submit jobs, create a bash/shell script. The *minimum required parameters* are given in the example `stress.sh` as it follows.
{% gist 2fe050ea7d2e8f5950f3cb532447c48e stress.sh %}
then submit the job by
```shell
sbatch stress.sh
```
You must *AT LEAST* give the above options. If you don't know how much resource and time the job needed, submit it to `test` partition (introduced later) or specified a large enough value.

You can also specify the corresponding parameters in the command line such as
```shell
sbatch --time=01:00:00 stress.sh
```
For advanced usage such as the beginning time, running parallel jobs and specifying job dependencies (i.e., determining the order and relationship between multiple jobs), please refer to the official documents of SLURM or just search for what you want via Google.

### Check job status
To view the whole queue, use command `squeue`. Also, you can change the format and sorting order of the output by its options. To check more detailed status of a single job, use `sstat <jobid>`.

### Cancel jobs
You should use `scancel <jobid>` command to cancel a single job or use `scancel -u $USER` to cancel all your jobs in queue.

### **!!!IMPORTANT!!!**
Working in `ss620a` and `ss620b` by *ssh session (command line prompt)*, you must be reminded that your accesses to resources, i.e., CPUs and memory, are *STRICTLY* limited. In each login session or a background job that is run by directly issuing commands, the total number of CPUs you can use is 8 and the total memory you can use is 8G (16G, plus swap). That means no matter how many CPUs and memory your command job is specified to use, it will only use up to 8 CPUs and 8G memory (possibly be killed if exceeding 8G memory). For jobs submitted by `sbatch` or other submission command of SLURM, there is no limitations for the resource usages. Therefore, remember to submit jobs via `sbatch` if your jobs will consume much resource.

However, you must be also reminded that there are two partitions where jobs can be submitted to. One is `work` partition, where there is no limitation on resource usages and the number of jobs you can submit. The other one is `test` partition, where there is a constraint that each user can only submit *5 jobs in total* into the queue at a given time and the job can only run up to *one hour*. 

The difference between the two partitions is that jobs in `test` partition have higher priorities to start running in queue than ones in `work` partition. Therefore, the `test` partition is just used to test your programs or pipelines before submitting to the `work` partition. You can switch the partition your job is submitted to by the option `-p <partition>` or `--partition=<partition>` written in the shell script or just given after the `sbatch` command. The default partition is `work`.

If any enquiry, please contact the administrators.