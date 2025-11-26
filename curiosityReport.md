# Exploring Kubernetes and why you want to containerize your application

## Introduction

Kubernetes has been a hot topic in the tech world for the past couple of years. Interested in seeing what it exactly is and why people are interested in it, I decided to look more into the application.

## Understanding why people use containers

Before jumping into Kubernetes, I decided to first understand why someone would want to divide their application into multiple containers. We have covered some of this in this course, but I wanted to tackle it as if I was a solo developer working on a small application that in time was becoming more popular with users and needed greater expansion.

## Containers

Containerization is the process of dividing your application into containers, where you package an application and everything it needs to run into an isolated unit.

Containers could be a **Node.js container** that provides an API backend, a **Postgres container** that is a database, a **React container** that is a front-end, or a **Python container** that is a worker system. In essence, an isolated app or component.

## When is the right moment to start containerizing your application?

Besides right at the start, here are a few of the signs that it is time to do so:

- Deploying your app for real users  
- Maintaining the app across environments  
- Collaborating with other developers  
- When you need to scale your app  

## Kubernetes

In essence, Kubernetes is a container orchestration system that manages containerized applications. It provides the benefits that containers offer, but puts control of their management into the hands of the developer. It is a free open-source application, and as such, has quite the community following.

### Technical terms

Here are technical terms with their definitions that facilitate understanding Kubernetes better:

- **Distribution**  
  A Kubernetes distribution is a packaged version of Kubernetes, usually including additional tools or configuration. Examples include OpenShift, Rancher, and AWS EKS.

- **Scheduling**  
  The process of assigning pods to nodes based on resource availability and constraints.

- **Kubernetes Cluster**  
  A set of machines (nodes) that run Kubernetes-managed containerized applications.

- **Control Plane**  
  The set of components that manage the Kubernetes cluster, including the API server, scheduler, controller manager, and etcd.

- **Node**  
  A physical or virtual machine in the Kubernetes cluster that runs pods.

- **Container Operations**  
  Refers to tasks such as starting, stopping, monitoring, and restarting containers in the cluster.

- **etcd Member**  
  A node that participates in the distributed key-value store (etcd) used by Kubernetes to store cluster data.

- **Kubernetes Deployment**  
  A Kubernetes object that defines how many replicas of a pod should be running and manages updates to pods.

- **Pods**  
  The smallest deployable unit in Kubernetes, usually containing one or more containers.

- **Kubernetes Service**  
  An abstraction that defines how to access a set of pods, often via a stable IP address or DNS name.

- **Kubernetes Labels**  
  Key-value pairs attached to Kubernetes objects to identify and group them.

- **Kubernetes Replicas**  
  The number of pod instances running at the same time to ensure high availability.

- **Serverless vs Kubernetes**  
  Serverless platforms (e.g., AWS Lambda) automatically manage infrastructure, scaling, and provisioning. Kubernetes offers more control but requires management.

- **AWS EKS**  
  Amazon Elastic Kubernetes Service, a managed Kubernetes service in AWS.

## Conclusion

Kubernetes is a very complex system that provides full control to the developer for managing containers. That control can be a drawback, as it requires direct involvement in managing the process, whereas other systems are serverless and manage that automatically. Whatever needs your app may have, Kubernetes is an orchestration system tool worth considering.
