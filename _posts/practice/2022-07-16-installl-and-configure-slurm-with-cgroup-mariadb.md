---
title: Install and configure SLURM with cgroup and MariaDB on Ubuntu 20.04
category: practice
tags: ubuntu slurm cgroup mysql mariadb
date: 2022-07-24 12:52:00 +0800
---

# Overview
SLURM is a very good workload and job manager with many builtin plugins and various customizations. We are able to control the jobs submitted by users via SLURM control tools. Cgroup (control group) is also a Linux tool to control users' actions and by cgroup we are able to throw various limitations on resources such as CPU and memory usages.

Here, I will share the steps to install and configure SLURM with the cgroup plugin and the MariaDB as the storage accounting database.

**Please note that all the following are down by the root user.**

# cgroup
## Install
At first, before installing cgroup, we need to update the system repository:
```console
$ apt update
```
then install the cgroup package.
```console
$ apt install cgroup-tools
```
After that, copy the default `cgred.conf` to the `/etc` directory.
```console
$ cp /usr/share/doc/cgroup-tools/examples/cgred.conf /etc
```

## Configure
After installation, we can perform the configuration such as give the limitations on CPU and memory (which called `subsystem`) to a specific group, by creating the `/etc/cgconfig.conf` file. An example `cgconfig.conf` is given as follows:
```
group g1 {
    cpu {
        cpu.cfs_period_us=100000;
        cpu.cfs_quota_us=200000;
    }
    memory {
        memory.limit_in_bytes=5G
    }
}
```
The `cpu` part throws a limitation such that only 2 CPUs can be used by the group `g1` and the `memory` part says `g1` can use up to a 5G RAM. Then, we need to create a rule file to assign the cgroup to users. Create `/etc/cgrules.conf` and edit it as you expected. An example is
```
#<user>    <controllers>           <destination>
user1       cpu,memory              g1
```
With `cgconfig.conf` and `cgrules.conf` done, we want to test and make them take effect by executing
```console
$ cgconfigparser -l /etc/cgconfig.conf
> cgrulesengd -vvv
```
Without errors, we can make them as system services and the following are my system service files.
```
# /etc/systemd/system/cgconfigparser.service
[Unit]
Description=cgroup config parser
After=network.target

[Service]
User=root
Group=root
ExecStart=/usr/sbin/cgconfigparser -l /etc/cgconfig.conf
Type=oneshot

[Install]
WantedBy=multi-user.target
```
```
# /etc/systemd/system/cgrulesengd.service
[Unit]
Description=cgroup rules generator
After=network.target cgconfigparser.service

[Service]
User=root
Group=root
Type=forking
EnvironmentFile=-/etc/cgred.conf
ExecStart=/usr/sbin/cgrulesengd
Restart=on-failure

[Install]
WantedBy=multi-user.target
```
Then reload systemd and enable the services.
```console
$ systemctl daemon-reload
$ systemctl enable cgconfigparser
$ systemctl enable cgrulesgend
$ systemctl start cgconfigparser
$ systemctl start cgrulesgend
```

Another way to create group is via the cgroup command line tools. To create group with `cpu` subsystem and set limitations
```console
$ cgcreate -g cpu:g1
$ cgset g1 -r cpu.cfs_period_us=100000 -r cpu.cfs_quota_us=200000
```
To test the cgroup against CPU, we can use `stress` package. After installing `stress` by the following
```console
$ apt install stress
```
we can use it to test against CPU usage by
```console
$ cgexec -g cpu:g1 stress --cpu 32
```
You can specify the `--cpu` argument by your number.

# MariaDB
## Install
To intall MariaDB, just execute
```console
$ apt install mariadb-server -y
```
and then enable and start the service
```console
$ systemctl enable mariadb
$ service mariadb start
```
You may setup the MariaDB further for the root access by
```console
$ mysql_secure_installation
```
and follow the instruction to complete the installation.

## Configure for SLURM
For SLURM support, we should create a slurm user in database for further configuration in SLURM.
```console
$ mysql -u root -p
> grant all on slurm_acct_db.* TO 'slurm'@'localhost' identified by 'some_pass' with grant option;
> create database slurm_acct_db;
```

**!!!IMPORTANT!!!** For SlurmDBD plugin, some parameters of `innodb` should be modified, otherwise there will be some errors when starting the slurmdbd. Create a file `/etc/mysql/conf.d/innodb.cnf` and add the following to it.
```
[mysqld]
 innodb_buffer_pool_size=1024M
 innodb_log_file_size=64M
 innodb_lock_wait_timeout=900
```

# SLURM
## Install
Install `slurmd`, `slurmctld` and `slurmdbd`
```console
$ apt install slurmd slurmctld slurmdbd
```

## Configure `cgroup.conf`
Create a file `/etc/slurm-llnl/cgroup.conf` and add the following
```
CgroupMountpoint=/sys/fs/cgroup
CgroupAutomount=no
CgroupReleaseAgentDir="/etc/slurm-llnl/cgroup"
ConstrainCores=yes
#TaskAffinity=yes
ConstrainRAMSpace=yes
```

## Configure `slurmdbd.conf`
There are various settings for the slurmdbd, here I give my setting for my server.
```
# Example slurmdbd.conf file.
#
# See the slurmdbd.conf man page for more information.
#
# Archive info
#ArchiveJobs=yes
#ArchiveDir="/tmp"
#ArchiveSteps=yes
#ArchiveScript=
#JobPurge=12
#StepPurge=1
#
# Authentication info
AuthType=auth/munge
#AuthInfo=/var/run/munge/munge.socket.2
#
# slurmDBD info
DbdAddr=localhost
DbdHost=localhost
DbdPort=7031
SlurmUser=slurm
#MessageTimeout=300
DebugLevel=verbose
#DefaultQOS=normal,standby
LogFile=/var/log/slurm/slurmdbd.log
PidFile=/var/run/slurmdbd.pid
#PluginDir=/usr/lib/slurm
#PrivateData=accounts,users,usage,jobs
#TrackWCKey=yes
#
# Database info
StorageType=accounting_storage/mysql
StorageHost=localhost
StoragePort=3306
StoragePass=some_pass
StorageUser=slurm
StorageLoc=slurm_acct_db
```
The important parts are `DbdAddr`, `DbdAddr`, `DbdPort` and database info section. Make sure you give the correct information that is corresponding to the MariaDB settings. The `DbdPort` is default as 7031.

## Configure `slurm.conf`
Finally, to configure the SLURM, you can use [the official configurator](https://slurm.schedmd.com/configurator.html) to generate this file, here I just put mine.
```
# slurm.conf file generated by configurator.html.
# Put this file on all nodes of your cluster.
# See the slurm.conf man page for more information.
#
ClusterName=ss620a
SlurmctldHost=ss620a
#SlurmctldHost=
#
#DisableRootJobs=NO
#EnforcePartLimits=NO
#Epilog=
#EpilogSlurmctld=
#FirstJobId=1
#MaxJobId=67043328
#GresTypes=
#GroupUpdateForce=0
#GroupUpdateTime=600
#JobFileAppend=0
#JobRequeue=1
#JobSubmitPlugins=lua
#KillOnBadExit=0
#LaunchType=launch/slurm
#Licenses=foo*4,bar
#MailProg=/bin/mail
#MaxJobCount=10000
#MaxStepCount=40000
#MaxTasksPerNode=512
MpiDefault=none
#MpiParams=ports=#-#
#PluginDir=
#PlugStackConfig=
#PrivateData=jobs
ProctrackType=proctrack/cgroup
#Prolog=
#PrologFlags=
#PrologSlurmctld=
#PropagatePrioProcess=0
#PropagateResourceLimits=
#PropagateResourceLimitsExcept=
#RebootProgram=
ReturnToService=2
SlurmctldPidFile=/var/run/slurmctld.pid
SlurmctldPort=6817
SlurmdPidFile=/var/run/slurmd.pid
SlurmdPort=6818
SlurmdSpoolDir=/var/spool/slurmd
SlurmUser=slurm
#SlurmdUser=root
#SrunEpilog=
#SrunProlog=
StateSaveLocation=/var/spool/slurmctld
SwitchType=switch/none
#TaskEpilog=
TaskPlugin=task/cgroup
#TaskPlugin=task/none
#TaskProlog=
#TopologyPlugin=topology/tree
#TmpFS=/tmp
#TrackWCKey=no
#TreeWidth=
#UnkillableStepProgram=
#UsePAM=0
#
#
# TIMERS
#BatchStartTimeout=10
#CompleteWait=0
#EpilogMsgTime=2000
#GetEnvTimeout=2
#HealthCheckInterval=0
#HealthCheckProgram=
InactiveLimit=0
KillWait=30
#MessageTimeout=10
#ResvOverRun=0
MinJobAge=300
#OverTimeLimit=0
SlurmctldTimeout=120
SlurmdTimeout=300
#UnkillableStepTimeout=60
#VSizeFactor=0
Waittime=0
#
#
# SCHEDULING
#DefMemPerCPU=0
#MaxMemPerCPU=0
#SchedulerTimeSlice=30
SchedulerType=sched/backfill
SelectType=select/cons_tres
SelectTypeParameters=CR_Core
#
#
# JOB PRIORITY
#PriorityFlags=
#PriorityType=priority/basic
#PriorityDecayHalfLife=
#PriorityCalcPeriod=
#PriorityFavorSmall=
#PriorityMaxAge=
#PriorityUsageResetPeriod=
#PriorityWeightAge=
#PriorityWeightFairshare=
#PriorityWeightJobSize=
#PriorityWeightPartition=
#PriorityWeightQOS=
#
#
# LOGGING AND ACCOUNTING
AccountingStorageEnforce=associations,limits,qos
AccountingStorageHost=localhost
#AccountingStoragePass=
AccountingStoragePort=7031
AccountingStorageType=accounting_storage/slurmdbd
AccountingStorageUser=slurm
#AccountingStoreFlags=
#JobCompHost=
#JobCompLoc=
#JobCompPass=
#JobCompPort=
JobCompType=jobcomp/none
#JobCompUser=
#JobContainerType=job_container/none
JobAcctGatherFrequency=30
JobAcctGatherType=jobacct_gather/none
SlurmctldDebug=info
SlurmctldLogFile=/var/log/slurmctld.log
SlurmdDebug=info
SlurmdLogFile=/var/log/slurmd.log
#SlurmSchedLogFile=
#SlurmSchedLogLevel=
#DebugFlags=
#
#
# POWER SAVE SUPPORT FOR IDLE NODES (optional)
#SuspendProgram=
#ResumeProgram=
#SuspendTimeout=
#ResumeTimeout=
#ResumeRate=
#SuspendExcNodes=
#SuspendExcParts=
#SuspendRate=
#SuspendTime=
#
#
# COMPUTE NODES
NodeName=ss620a CPUs=128 RealMemory=1031720 Sockets=2 CoresPerSocket=32 ThreadsPerCore=2 State=UNKNOWN
PartitionName=work Nodes=ALL Default=YES PriorityTier=1 MaxTime=INFINITE State=UP
PartitionName=test Nodes=ALL Default=no PriorityTier=100 QoS=testqos MaxTime=INFINITE State=UP
```
The important parts are `AccountingStorage*` and the compute nodes in the final lines. If you want to use `sacctmgr` to get more controls, you should do that carefully. To get the information such as CPUs and memory, you can use `slurmd -C`.

After all configuration files done, we should start/restart all the related services.
```console
$ service slurmdbd restart
$ service slurmctld restart
$ service slurmd restart
```

You may come across the problem that `slurmctld` cannot start with the error.
```
fatal: mkdir(/var/spool/slurmctld): Permission denied
```
To solve this, do following:
```console
$ mkdir /var/spool/slurmctld
$ chmod 755 -R /var/spool/slurmctld
$ chmod 755 -R /var/spool/slurmctld
```

PS: Remember to add cluster, qos (if nay) at first before restart `slurmctld`, otherwise failures will occur.

# Additional settings
## Limit users' usages in ssh sessions
There is an issue that some users may abuse the cluster resources like CPUs and memory even in the ssh sessions, i.e., the command line prompt or background jobs. Here I provide a method after a lot of search to limit the usages in the ssh sessions with the cgroup settings.

At first, edit the `/etc/cgconfig.conf` to add a group with some subsystems. Here I also give mine.
```
group interactive {
    perm {
        admin {
           uid=root;
           gid=root;
        }
        task {
           uid=root;
           gid=iuser;
           fperm=775;
        }
    }
    cpu {
        cpu.cfs_period_us=100000;
        cpu.cfs_quota_us=800000;
    }
    memory {
        memory.limit_in_bytes=8G;
        memory.memsw.limit_in_bytes=16G;
    }
}
```
The key is the `perm` part to guarantee who can add users to the `interactive` group using `cgclassify` command. In `task`, we need beforehand create a group `iuser` or other names and assign the group to users. Then, create a file `/etc/profile.d/ssh.sh` with the following lines.
```bash
# check if user is in an SSH session and *hasn't* been spawned by slurm
if [[ -n $SSH_CONNECTION ]] && [[ -z $SLURM_JOBID ]]; then
  # get the shell pid
  SESSIONPID=$$
  # attach the shell to the relevant cgroup
  cgclassify -g memory,cpu:interactive $SESSIONPID
  # now everything spawned by this shell should be in this cgroup
fi
```
By this, each user will be added in the `interactive` group when logining through ssh connections. 

To make `memory.memsw.limit_in_bytes` take effect, an additional step is required. Add the following line to `/etc/default/grub`.
```
GRUB_CMDLINE_LINUX_DEFAULT="cgroup_enable=memory swapaccount=1"
```
then update the grub settings by
```console
$ update-grub
```
and reboot the server.