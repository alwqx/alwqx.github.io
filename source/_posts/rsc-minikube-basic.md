---
title: rsc minikube basic
lang: en
date: 2018-02-02 11:44:43
tags:
    - rsc
    - minikube
    - kubernetes
categories: rsc
---

## Build and Test
Read source code of [minikube](https://github.com/kubernetes/minikube)

### Build from source code
First, you need go 1.8+ and set GOPATH and GOROOT correctly.Then, clone code:
```shell
git clone https://github.com/kubernetes/minikube.git $GOPATH/src/k8s.io
```
If you want to save time, you can add `--depth=1` to git:
```shell
git clone --depth=1 https://github.com/kubernetes/minikube.git $GOPATH/src/k8s.io
```
Then, build with default instruction `make`:
```shell
cd $GOPATH/src/k8s.io/minikube
make
```

<!-- more -->

### Test minikube code
There are three kinds of test:
- Unit test: `make test`, test atomic program function or method.
- Integration test: `make integration`, test across function or method all invoke path.
- Conformance test: refer to [minikube conformance test](https://github.com/kubernetes/minikube/blob/master/docs/contributors/build_guide.md#conformance-tests).

Below is sample output of compile:
```shell
➜  minikube git:(master) make
docker run -w /go/src/k8s.io/minikube --user 501:20 -e IN_DOCKER=1 -v /Users/luwenquan/workspace/gowp/src/k8s.io/minikube:/go/src/k8s.io/minikube gcr.io/google_containers/kube-cross:v1.8.3-1 make out/localkube
Unable to find image 'gcr.io/google_containers/kube-cross:v1.8.3-1' locally
v1.8.3-1: Pulling from google_containers/kube-cross
cd9a7cbe58f4: Pull complete 
6b22806153e5: Pull complete 
da3f2dc8c5f5: Pull complete 
4414273e30d1: Pull complete 
62b1d4f3edab: Pull complete 
f12acb786c3a: Pull complete 
0fc22cca2a64: Pull complete 
00d653946749: Pull complete 
7eab0db108df: Pull complete 
5528b7afcc5b: Pull complete 
3843d2d039f3: Pull complete 
a48985fbe6eb: Pull complete 
53701de4e8d8: Pull complete 
Digest: sha256:762d8f6367826fcc50ad6c79a08c5f7b43e6bdf3218eb410c5c08a67193a557f
Status: Downloaded newer image for gcr.io/google_containers/kube-cross:v1.8.3-1
CGO_ENABLED=1 go build -tags static_build -ldflags="-X k8s.io/minikube/vendor/k8s.io/kubernetes/pkg/version.gitCommit=17d7182a7ccbb167074be7a87f0a68bd00d58d97 -X k8s.io/minikube/vendor/k8s.io/kubernetes/pkg/version.gitVersion=v1.7.5 -X k8s.io/minikube/vendor/k8s.io/kubernetes/pkg/version.gitTreeState=clean -X k8s.io/minikube/vendor/k8s.io/kubernetes/pkg/version.buildDate=2017-09-24T15:37:46Z -X k8s.io/minikube/vendor/k8s.io/client-go/pkg/version.gitCommit=17d7182a7ccbb167074be7a87f0a68bd00d58d97 -X k8s.io/minikube/vendor/k8s.io/client-go/pkg/version.gitVersion=v1.7.5 -X k8s.io/minikube/vendor/k8s.io/client-go/pkg/version.gitTreeState=clean -X k8s.io/minikube/vendor/k8s.io/client-go/pkg/version.buildDate=2017-09-24T15:37:46Z  -X k8s.io/minikube/pkg/version.version=v0.22.2 -X k8s.io/minikube/pkg/version.isoVersion=v0.23.4 -X k8s.io/minikube/pkg/version.isoPath=minikube/iso -s -w -extldflags '-static'" -o ./out/localkube ./cmd/localkube
GOBIN=/Users/luwenquan/workspace/gowp/bin go get github.com/jteeuwen/go-bindata/...
/Users/luwenquan/workspace/gowp/bin/go-bindata -nomemcopy -o pkg/minikube/assets/assets.go -pkg assets ./out/localkube deploy/addons/...
CGO_ENABLED=1 GOARCH=amd64 GOOS=darwin go build -tags "container_image_ostree_stub containers_image_openpgp" --installsuffix cgo -ldflags="-X k8s.io/minikube/pkg/version.version=v0.22.2 -X k8s.io/minikube/pkg/version.isoVersion=v0.23.4 -X k8s.io/minikube/pkg/version.isoPath=minikube/iso -X k8s.io/minikube/vendor/k8s.io/kubernetes/pkg/version.gitCommit=17d7182a7ccbb167074be7a87f0a68bd00d58d97 -X k8s.io/minikube/vendor/k8s.io/kubernetes/pkg/version.gitVersion=v1.7.5 -X k8s.io/minikube/vendor/k8s.io/kubernetes/pkg/version.gitTreeState=clean -X k8s.io/minikube/vendor/k8s.io/kubernetes/pkg/version.buildDate=2017-09-24T23:21:27Z -X k8s.io/minikube/vendor/k8s.io/client-go/pkg/version.gitCommit=17d7182a7ccbb167074be7a87f0a68bd00d58d97 -X k8s.io/minikube/vendor/k8s.io/client-go/pkg/version.gitVersion=v1.7.5 -X k8s.io/minikube/vendor/k8s.io/client-go/pkg/version.gitTreeState=clean -X k8s.io/minikube/vendor/k8s.io/client-go/pkg/version.buildDate=2017-09-24T23:21:27Z " -a -o out/minikube-darwin-amd64 k8s.io/minikube/cmd/minikube
cp ./out/minikube-darwin-amd64 ./out/minikube
```
make will pull needed image and first build localkube and then minikube.

Below is output of unit test:
```shell
➜  minikube git:(master) time make test
CGO_ENABLED=1 go build -tags static_build -ldflags="-X k8s.io/minikube/vendor/k8s.io/kubernetes/pkg/version.gitCommit=17d7182a7ccbb167074be7a87f0a68bd00d58d97 -X k8s.io/minikube/vendor/k8s.io/kubernetes/pkg/version.gitVersion=v1.7.5 -X k8s.io/minikube/vendor/k8s.io/kubernetes/pkg/version.gitTreeState=clean -X k8s.io/minikube/vendor/k8s.io/kubernetes/pkg/version.buildDate=2017-09-24T22:43:56Z -X k8s.io/minikube/vendor/k8s.io/client-go/pkg/version.gitCommit=17d7182a7ccbb167074be7a87f0a68bd00d58d97 -X k8s.io/minikube/vendor/k8s.io/client-go/pkg/version.gitVersion=v1.7.5 -X k8s.io/minikube/vendor/k8s.io/client-go/pkg/version.gitTreeState=clean -X k8s.io/minikube/vendor/k8s.io/client-go/pkg/version.buildDate=2017-09-24T22:43:56Z  -X k8s.io/minikube/pkg/version.version=v0.22.2 -X k8s.io/minikube/pkg/version.isoVersion=v0.23.4 -X k8s.io/minikube/pkg/version.isoPath=minikube/iso -s -w -extldflags '-static'" -o ./out/localkube ./cmd/localkube
# k8s.io/minikube/cmd/localkube
/usr/local/golang/versions/go1.8.1/go/pkg/tool/linux_amd64/link: running gcc failed: fork/exec /usr/bin/gcc: cannot allocate memory

Makefile:104: recipe for target 'out/localkube' failed
make: *** [out/localkube] Error 2
make test  476.86s user 41.29s system 120% cpu 7:09.00 total
```
Because my machine does not have enough **memory** so compile and unit test both fail.

## Set up kubenetes local cluster with minikube

### Install minikube and kubectl
Refer to [installations](https://github.com/kubernetes/minikube#installation) to install dependencies.

### Start
```shell
minikube start --vm-driver=xhyve # vm dirver is needed on MacOS
```
**Note**: Your machine must access to `gcr.io` and some other sites (across the GFW).Because minikube will try to pull needed image from gcr.io . If you can't access to gcr.io, you will not set up your cluster even though `minikube status` or `kubectl cluster-info` work well.

Run `minikube dashboard`, if your default browser can open portal of k8s cluster, you start success.

## Conclusion
Compile minikube will pull image from gcr.io, so your machine is supporsed to access gcr.io. If not, you will fail.

Both test and compile need **4GB+ memory**.