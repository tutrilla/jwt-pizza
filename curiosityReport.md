# Title: Exploring Kubernetes and Why You Want to Containerize Your Application

## Introduction

Kubernetes has been a hot topic in the tech world for the past couple of years. Interested in seeing what it exactly is and why people are interested in it, I decided to look more into the application.

## Understanding Why People Use Containers

Before jumping into Kubernetes, I decided to first understand why someone would want to divide their application into multiple containers. We have covered some of this in this course, but I wanted to tackle it as if I was a solo developer working on a small application that in time was becoming more popular with users and needed greater expansion.

## Containers

Containerization is the process of dividing your application into containers, which is where you package an application and everything it needs to run into an isolated unit.

Containers could be a Node.js container that provides an API backend, a PostgreSQL container that is a database, a React container that is a front-end, a Python container that is a worker system. In essence, an isolated app or component.

## When Is the Right Moment to Start Putting Parts of Your Application into Containers?

Besides right at the start, here are a few of the signs that it is time to do so:

- Deploying your app for real users  
- Maintaining the app across environments  
- Collaborating with other developers  
- When you need to scale your app

## Kubernetes

In essence, Kubernetes is a container orchestration system that manages containerized applications. It provides the benefits that any containers would do, but puts control of the management of them into the hands of the developer. It is a free, open-source application, and as such has quite the community following.

Here are technical terms with their definitions that facilitate understanding Kubernetes better:

### Distribution

Distribution is what the process is called when you are placing containers on different machines in the cluster (defined later).

### Scheduling

Scheduling is deciding when and where a container should run—the decision logic for distribution. It considers factors such as CPU/RAM, labels, tolerations, affinities, etc.

### Kubernetes Cluster

A Kubernetes cluster consists of control planes and nodes and is considered to be the heart of a Kubernetes application.

### Control Plane

Responsible for managing the cluster, such as scheduling, maintaining, and updating.

### Node

A node is a VM or physical computer that serves as a worker machine in the Kubernetes cluster. They could be EC2 instances, VMs on GCP/Azure, or anything that you define it as. The catch is that you need to be the one who provides it.

Minikube, Kind, and Docker Desktop are used as nodes for local development.

### Container Operations

Container operations are low-level tasks to create, start, stop, pause, delete, and monitor containers on a machine.

Containerd and CRI-O are container runtimes that run those operations; Kubernetes uses those.

### Etcd Member

This is a distributed key-value database that Kubernetes uses to store its entire cluster state.

## Kubernetes Deployment

You can deploy to Kubernetes by using a `.yaml` file.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.24
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Pods

Represents one or more containers that are either deployed together, scheduled on the same node, or share resources. They are tied to a node.

## Kubernetes Service

This routes traffic across a set of pods. It allows pods to die and replicate in Kubernetes.

## Kubernetes Labels

Kubernetes labels designate objects for development, test, and production. You can also use them to tag objects and have versions.

## Kubernetes Replicas

Kubernetes replicas are multiple identical copies of a pod that run on a cluster. This makes it so that if one pod fails, then the others will continue to serve traffic, manage load distribution, and help scaling.

## Serverless vs Kubernetes

As you can see, there is quite a bit to Kubernetes. So the thought is: why would a person or company decide to switch to using Kubernetes instead of using serverless software that does this entire process automatically?

This comes down to saving costs, but only in a specific situation. With serverless applications, you pay per use, but if you have consistent, heavy, predictable usage, those costs can add up over time.

By using Kubernetes in this situation, you can manage the infrastructure, scaling, and provisioning manually and find ways to fine-tune, optimize, and save costs accordingly.

**Do note though:** If your application has unpredictable usage, then you probably benefit more from serverless, as you will only pay when usage is high but also pay less when usage is low or not used at all. With Kubernetes, you pay the same rate the entire time. As you can see here, it is not always advantageous to use Kubernetes to save costs.

## AWS EKS

This is an interesting service that Amazon provides that allows you to manage Kubernetes on AWS. Essentially, a middle ground where you can use Kubernetes but have AWS automate or manage a lot of the processes that you normally have to do manually. Note that this can only be used within the AWS cloud and uses AWS resources.

## Conclusion

Kubernetes is a very complex system that provides full control to the developer for managing containers. That control can be a drawback, as it requires direct involvement in managing the process, whereas other systems are serverless and manage that automatically. Whatever needs your app may have, Kubernetes is an orchestration system tool worth considering.
