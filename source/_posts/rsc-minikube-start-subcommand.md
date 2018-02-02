---
title: rsc minikube start subcommand
lang: en
date: 2018-02-02 12:35:26
tags:
    - rsc
    - minikube
    - kubernetes
categories: rsc
---

dir `pkg` has many libs and functions for the whole project.

## pkg/minikube/cluster
cluster pkg provides functions to interact with the cluster:
- start cluster
- stop cluster
- remove cluster
- get cluster status
- get driver ip
- ...

<!-- more -->

below functions are important:
- createHost
- GetVMHostIP
- CreateSSHShell

```golang
// DeleteHost deletes the host VM.
func DeleteHost(api libmachine.API) error {
	host, err := api.Load(cfg.GetMachineName())
	if err != nil {
		return errors.Wrapf(err, "Error deleting host: %s", cfg.GetMachineName())
	}
	m := util.MultiError{}
	m.Collect(host.Driver.Remove())
	m.Collect(api.Remove(cfg.GetMachineName()))
	return m.ToError()
}
```
when remove cluster, it will produce many errors, so util pkg wraps a struct MultiError to handle it.

## runStart
runStart is the main func to start minikube cluster.It mainly does following things(**Note**: I try to record detailed things):

### get basic options from flags
```golang
shouldCacheImages := viper.GetBool(cacheImages)
k8sVersion := viper.GetString(kubernetesVersion)
clusterBootstrapper := viper.GetString(cmdcfg.Bootstrapper)
```

### new api client
```golang
api, err := machine.NewAPIClient()
```
then check if default machine name has existed.
```golang
exists, err := api.Exists(cfg.GetMachineName())
```

### new machine config
check diskSize and k8sVersion, then new a machine config:
```golang
config := cluster.MachineConfig{
    MinikubeISO:         viper.GetString(isoURL),
    Memory:              viper.GetInt(memory),
    CPUs:                viper.GetInt(cpus),
    DiskSize:            diskSizeMB,
    VMDriver:            viper.GetString(vmDriver),
    XhyveDiskDriver:     viper.GetString(xhyveDiskDriver),
    DockerEnv:           dockerEnv,
    DockerOpt:           dockerOpt,
    InsecureRegistry:    insecureRegistry,
    RegistryMirror:      registryMirror,
    HostOnlyCIDR:        viper.GetString(hostOnlyCIDR),
    HypervVirtualSwitch: viper.GetString(hypervVirtualSwitch),
    KvmNetwork:          viper.GetString(kvmNetwork),
    Downloader:          pkgutil.DefaultDownloader{},
    DisableDriverMounts: viper.GetBool(disableDriverMounts),
}
```

### start cluster machine
```golang
start := func() (err error) {
    host, err = cluster.StartHost(api, config)
    if err != nil {
        glog.Errorf("Error starting host: %s.\n\n Retrying.\n", err)
    }
    return err
}
err = pkgutil.RetryAfter(5, start, 2*time.Second)
```

### load and write cluster profile config
load confg
```golang
cc, err := loadConfigFromFile(viper.GetString(cfg.MachineProfile))
```
setup kubernetesConfig
```golang
kubernetesConfig := bootstrapper.KubernetesConfig{
    KubernetesVersion:      selectedKubernetesVersion,
    NodeIP:                 ip,
    NodeName:               cfg.GetMachineName(),
    APIServerName:          viper.GetString(apiServerName),
    DNSDomain:              viper.GetString(dnsDomain),
    FeatureGates:           viper.GetString(featureGates),
    ContainerRuntime:       viper.GetString(containerRuntime),
    NetworkPlugin:          viper.GetString(networkPlugin),
    ExtraOptions:           extraOptions,
    ShouldLoadCachedImages: shouldCacheImages,
}
```
setup cluster config
```golang
clusterConfig := cluster.Config{
    MachineConfig:    config,
    KubernetesConfig: kubernetesConfig,
}
```
save cluster config
```golang
if err := saveConfig(clusterConfig); err != nil {
    glog.Errorln("Error saving profile cluster configuration: ", err)
}
```

### mount path
```golang
mountCmd := exec.Command(path, "mount", fmt.Sprintf("--v=%d", mountDebugVal), viper.GetString(mountString))
mountCmd.Env = append(os.Environ(), constants.IsMinikubeChildProcess+"=true")
```

### demo output
output of `minikube start`:
```shell
➜  k8swp minikube start
Starting local Kubernetes v1.7.5 cluster...
Starting VM...
Getting VM IP address...
Moving files into cluster...
Setting up certs...
Connecting to cluster...
Setting up kubeconfig...
Starting cluster components...
Kubectl is now configured to use the cluster.
```

## Conclusion
There are many pkgs should learn:
- k8s.io/minikube/pkg/minikube
- k8s.io/minikube/pkg/util
- k8s.io/minikube/pkg/version
- github.com/docker/machine

start subcommand uses many pkgs, so it does not have many codes. Reader should read more about the pkgs start uses.