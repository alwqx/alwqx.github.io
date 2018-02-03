---
title: rsc minikube pkg minikube package
lang: en
date: 2018-02-02 12:46:37
tags:
    - rsc
    - minikube
    - kubernetes
categories: rsc
---

## pkg/minikube/constants
pkg constants defines default values minikube will use later:
- APIServerName
- ClusterDNSDomain
- MinikubeHome
- DefaultMinipath:filepath.Join(homedir.HomeDir(), ".minikube")
- KubeconfigPath
- KubeconfigEnvVar
- MinikubeContext
- MinikubeEnvPrefix
- DefaultMachineName
- DefaultStorageClassProvisioner
- MountProcessFileName
- SupportedVMDrivers
- config for vm

<!-- more -->

```golang
DefaultKeepContext  = false
ShaSuffix           = ".sha256"
DefaultMemory       = 2048
DefaultCPUS         = 2
DefaultDiskSize     = "20g"
MinimumDiskSizeMB   = 2000
DefaultVMDriver     = "virtualbox"
DefaultStatusFormat = "minikube: {{.MinikubeStatus}}\n" +
    "cluster: {{.ClusterStatus}}\n" + "kubectl: {{.KubeconfigStatus}}\n"
DefaultAddonListFormat     = "- {{.AddonName}}: {{.AddonStatus}}\n"
DefaultConfigViewFormat    = "- {{.ConfigKey}}: {{.ConfigValue}}\n"
GithubMinikubeReleasesURL  = "https://storage.googleapis.com/minikube/releases.json"
KubernetesVersionGCSURL    = "https://storage.googleapis.com/minikube/k8s_releases.json"
DefaultWait                = 20
DefaultInterval            = 6
DefaultClusterBootstrapper = "localkube"
```
- ...

## pkg/minikube/config
This pkg is simple, it is mainly for MinikubeConfig `type MinikubeConfig map[string]interface{}`.
MinikubeConfig is a map, its value is interface.Main function about it is:
```golang
// ReadConfig reads in the JSON minikube config
func ReadConfig() (MinikubeConfig, error) {
	f, err := os.Open(constants.ConfigFile)
	if err != nil {
		if os.IsNotExist(err) {
			return make(map[string]interface{}), nil
		}
		return nil, fmt.Errorf("Could not open file %s: %s", constants.ConfigFile, err)
	}
	m, err := decode(f)
	if err != nil {
		return nil, fmt.Errorf("Could not decode config %s: %s", constants.ConfigFile, err)
	}

	return m, nil
}
```

## pkg/minikube/cluster
Cluster pkg operates the VM and k8s cluster.It defines MachineConfig and Config which holds `MachineConfig` and `bootstrapper.KubernetesConfig`.

Cluster has below important methods

### cluster.go
#### StartHost
This method needs libmachine api and MachineConfig.
1. check if VM machine exists, if not, create and return it.
2. if vm exists, load it as host, then check host status.
    - if host does not running, starts host and save host status.
3. if host driver is "none", run `h.ConfigureAuth()`
4. finally, return host and nil(error).

#### StopHost
Load host uses libmachine api and stops it.

#### DeleteHost
Load host uses libmachine api and deletes it.
While deleting host it maybe run into many errors,so we use `MultiError` to handle process of deleting.

#### GetHostStatus
1. check if host exists, if not, return none status.
2. load host and get status using host driver api.
3. return status in step 2.

#### GetHostDriverIP
1. load host and get ip using driver api.
2. parse and return ip.

#### createVirtualboxHost
return virtualbox dirver

#### createHost
receive libmachine.API and MachineConfig as parameters.
It will switch MachineConfig.VMDriver, creates host driver according to driver kinds.
Although driver type is ensure,run `h, err := api.NewHost(config.VMDriver, data)` to get a host struct.
Config host --> create host --> save host.

#### GetHostDockerEnv
get host and then get dirver ip,parse ip to docker env map.

#### MountHost
runs the mount command from the 9p client on the VM to the 9p server on the host.
**so what is 9p client and 9p server?**

#### CreateSSHShell
1. get host.
2. check vm host(cluster) status,if not running, return error.
3. create ssh client use host: `client, err := host.CreateSSHClient()`.
4. run client with args `client.Shell(args...)`.


### different platforms
1. cluster_windows.go
    - createHypervHost
2. cluster_linux.go
    - createKVMHost
3. cluster_darwin.go
    - createXhyveHost
    - createHyperkitHost

### Conclusion
cluster mainly provides methods to operates cluster:
- create
- start
- stop
- delete
- ...
It also supports different method according to platform: windows,linux and darwin.

## pkg/minikube/asserts

### addons.go
addons defines components and their yaml,manifests files for minikube:
- addon-manager
- dashboard
- default-storageclass
- kube-dns
- heapster
- ingress
- registry
- registry-creds

the yaml file is for kubenetes to create pods or deployments/services.

### vm_asserts.go
support a base assert struct and interfaces:
```golang
type CopyableFile interface {
	io.Reader
	GetLength() int
	GetAssetName() string
	GetTargetDir() string
	GetTargetName() string
	GetPermissions() string
}

type BaseAsset struct {
	data        []byte
	reader      io.Reader
	Length      int
	AssetName   string
	TargetDir   string
	TargetName  string
	Permissions string
}
```
Then implements below two assert struct:
- MemoryAsset
- BinDataAsset
they are for vm to use.

## pkg/minikube/drivers
I thought drivers pkg is very complex,but it only has on subpkg and few functions.
I think pkg drivers will have more functions.

### hyperkit/disk.go
- createDiskImage
this method needs github.com/docker/machine/libmachine/mcnutils。
it creates a file and write bytes to it.
- fixPermissions
just as its name implies, fis permissions of path.

## pkg/minikube/kubernetes_versions
pkg to get and validate kubernetes versions.

- GetK8sVersionsFromURL
Just as its name implies, this method get kubernetes versions from url.
- IsValidLocalkubeVersion
check if kubernetes version validate.
- PrintKubernetesVersions
- getJson
```golang
func getJson(url string, target *K8sReleases) error {
	r, err := http.Get(url)
	if err != nil {
		return errors.Wrapf(err, "Error getting json from url: %s via http", url)
	}
	defer r.Body.Close()

	return json.NewDecoder(r.Body).Decode(target)
}
```
get request from url and decode to target.

## pkg/minikube/notify
notify will check minikube version and notify user if localversion < onlineversion(get from online).
- getJson from url
- read version info from localfile
- write version info to localfile
- compare localversion and onlineversion
- notify(print update info) user to update minikube

### parse response body to struct
```golang
return json.NewDecoder(r.Body).Decode(target)
```

### write time to file
```golang
err := ioutil.WriteFile(path, []byte(inputTime.Format(timeLayout)), 0644)
```

### parse time from string
```golang
timeInFile, err := time.Parse(timeLayout, string(lastUpdateCheckTime))
```