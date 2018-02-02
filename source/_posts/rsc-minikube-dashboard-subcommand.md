---
title: rsc minikube dashboard subcommand
lang: en
date: 2018-02-02 12:39:59
tags:
    - rsc
    - minikube
    - kubernetes
categories: rsc
---
minikube will open default browser and navigate to Kubernetes UI when run `minikube dashboard`.
Or just print url of Kubernetes UI if run `minikube dashboard --url`.

Before doing dashboard, minikube checks local cluster's status, which uses below's pkgs:
- minikube/pkg/minikube/machine
- minikube/pkg/minikube/cluster

<!-- more -->

First, new a machine client api, client api is a struct which has certsDir、 storePath and libmachine.API.
Second cluster pkg checks if local cluster is running by `cluster.EnsureMinikubeRunningOrExit(api, 1)`.

In dashboard subcommand, minikube will retry 20 times to CheckService:
```golang
if err = commonutil.RetryAfter(20, func() error { return service.CheckService(namespace, svc) }, 6*time.Second); err != nil {
    fmt.Fprintf(os.Stderr, "Could not find finalized endpoint being pointed to by %s: %s\n", svc, err)
    os.Exit(1)
}
```

Let's dive into the `commonutil.RetryAfter` function:
```golang
func RetryAfter(attempts int, callback func() error, d time.Duration) (err error) {
	m := MultiError{}
	for i := 0; i < attempts; i++ {
		err = callback()
		if err == nil {
			return nil
		}
		m.Collect(err)
		if _, ok := err.(*RetriableError); !ok {
			return m.ToError()
		}
		time.Sleep(d)
	}
	return m.ToError()
}
```
Beyond my exception, RetryAfter function is simple. It uses for-loop. In each loop,it runs callback function, if runs into error, handles it.

MultiError is a wrapper of `golang error type`, in ToError(), MultiError ranges its errors and join error strings together:
```golang
return errors.New(strings.Join(errStrings, "\n"))
```

Because each invoke of `minikube dashboard` is sync, so we do not meet high-currency challenge.

For operating browser, minikube uses [browser pkg](https://github.com/pkg/browser).