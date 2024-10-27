export interface BlogPost {
  title: string;
  date: string;
  slug: string;
  content: string;
  excerpt: string;
}

export const blogPosts: BlogPost[] = [
  {
    title: "Getting Started with AWS Cloud: A Comprehensive Guide",
    date: "2024-03-15",
    slug: "getting-started-with-aws-cloud",
    excerpt: "Amazon Web Services (AWS) has revolutionized how we build and deploy applications. In this guide, I'll share my experience and best practices for getting started with AWS cloud services.",
    content: `# Getting Started with AWS Cloud: A Comprehensive Guide

Amazon Web Services (AWS) has revolutionized how we build and deploy applications. In this guide, I'll share my experience and best practices for getting started with AWS cloud services.

## Why AWS?

AWS offers several key advantages:

- **Scalability**: Easily scale your applications up or down based on demand
- **Reliability**: High availability across multiple geographic regions
- **Cost-effective**: Pay only for what you use
- **Innovation**: Access to cutting-edge technologies and services

## Essential Services for Beginners

### 1. Amazon EC2 (Elastic Compute Cloud)
EC2 is like having a virtual server in the cloud. It's perfect for:
- Hosting web applications
- Running development environments
- Processing batch jobs

\`\`\`bash
# Example: Launch an EC2 instance using AWS CLI
aws ec2 run-instances \\
    --image-id ami-0c55b159cbfafe1f0 \\
    --instance-type t2.micro \\
    --key-name MyKeyPair
\`\`\`

### 2. Amazon S3 (Simple Storage Service)
S3 is object storage built to store and retrieve any amount of data. Use it for:
- Static website hosting
- Application assets
- Data backup

### 3. Amazon RDS (Relational Database Service)
RDS makes it easy to set up and operate databases in the cloud:
- Automated backups
- Multi-AZ deployment
- Managed updates

## Best Practices

1. **Security First**
   - Use IAM roles and policies
   - Enable MFA
   - Regular security audits

2. **Cost Management**
   - Set up billing alerts
   - Use reserved instances
   - Regular resource cleanup

3. **High Availability**
   - Deploy across multiple AZs
   - Use auto-scaling
   - Implement proper monitoring

## Code Example: S3 Static Website

Here's a simple example of hosting a static website on S3:

\`\`\`typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'us-east-1' });

async function uploadToS3(bucketName: string, key: string, body: string) {
  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: 'text/html'
    }));
    console.log('Upload successful');
  } catch (err) {
    console.error('Upload failed:', err);
  }
}
\`\`\`

## Conclusion

AWS provides a robust platform for building modern applications. Start small, focus on core services, and gradually expand your knowledge as needed.

Remember to:
- Keep learning and experimenting
- Follow AWS best practices
- Stay updated with new services and features

Happy cloud computing! 🚀`
  },
  {
    title: "Managing AWS EKS with Crossplane: A Practical Guide",
    date: "2024-03-20",
    slug: "aws-eks-crossplane-guide",
    excerpt: "Kubernetes has revolutionized container orchestration, and AWS EKS makes it easier than ever to run Kubernetes clusters. Enter Crossplane - a powerful tool that brings Kubernetes-style declarative configuration to cloud infrastructure.",
    content: `# Managing AWS EKS with Crossplane: A Practical Guide

Kubernetes has revolutionized container orchestration, and AWS EKS (Elastic Kubernetes Service) makes it easier than ever to run Kubernetes clusters. Enter Crossplane - a powerful tool that brings Kubernetes-style declarative configuration to cloud infrastructure. Let's explore how to use Crossplane to manage EKS clusters.

## What is Crossplane?

Crossplane extends Kubernetes to manage cloud infrastructure using the same declarative approach we use for applications. It treats infrastructure as code, allowing you to:

- Define cloud resources using Kubernetes-style YAML
- Manage multiple cloud providers consistently
- Version control your infrastructure
- Implement GitOps practices for infrastructure

## Setting Up Crossplane for EKS

First, let's install Crossplane in your existing Kubernetes cluster:

\`\`\`bash
helm repo add crossplane-stable https://charts.crossplane.io/stable
helm repo update

helm install crossplane \\
  crossplane-stable/crossplane \\
  --namespace crossplane-system \\
  --create-namespace
\`\`\`

## Creating an EKS Cluster with Crossplane

Here's a complete example of creating an EKS cluster using Crossplane:

\`\`\`yaml
apiVersion: eks.aws.crossplane.io/v1beta1
kind: Cluster
metadata:
  name: my-eks-cluster
spec:
  forProvider:
    region: us-west-2
    version: "1.27"
    roleArnRef:
      name: eks-cluster-role
    resourcesVpcConfig:
      subnetIds:
        - subnet-0123456789abcdef0
        - subnet-0123456789abcdef1
      securityGroupIds:
        - sg-0123456789abcdef0
      endpointPrivateAccess: true
      endpointPublicAccess: true
  writeConnectionSecretToRef:
    namespace: default
    name: my-eks-connection
\`\`\`

## Managing Node Groups

Once your cluster is running, add a managed node group:

\`\`\`yaml
apiVersion: eks.aws.crossplane.io/v1alpha1
kind: NodeGroup
metadata:
  name: my-node-group
spec:
  forProvider:
    clusterName: my-eks-cluster
    region: us-west-2
    nodeRole: arn:aws:iam::123456789012:role/eks-node-group-role
    scalingConfig:
      desiredSize: 2
      maxSize: 4
      minSize: 1
    instanceTypes:
      - t3.medium
    subnets:
      - subnet-0123456789abcdef0
      - subnet-0123456789abcdef1
\`\`\`

## Best Practices

1. **Resource Organization**
   - Use composition to create reusable infrastructure patterns
   - Implement proper RBAC for infrastructure management
   - Version control your Crossplane configurations

2. **Security**
   \`\`\`yaml
   apiVersion: aws.crossplane.io/v1beta1
   kind: ProviderConfig
   metadata:
     name: aws-provider
   spec:
     credentials:
       source: Secret
       secretRef:
         namespace: crossplane-system
         name: aws-creds
         key: credentials
   \`\`\`

3. **Monitoring**
   - Set up proper logging for Crossplane operations
   - Monitor resource reconciliation
   - Implement alerts for failed provisions

## Advanced Configuration: Add-ons

Install common EKS add-ons using Crossplane:

\`\`\`yaml
apiVersion: eks.aws.crossplane.io/v1alpha1
kind: Addon
metadata:
  name: vpc-cni
spec:
  forProvider:
    clusterName: my-eks-cluster
    addonName: vpc-cni
    addonVersion: v1.12.0
    resolveConflicts: OVERWRITE
\`\`\`

## Troubleshooting Tips

1. Check Crossplane provider status:
   \`\`\`bash
   kubectl get providers
   kubectl describe provider.pkg aws-provider
   \`\`\`

2. Verify resource creation:
   \`\`\`bash
   kubectl get managed
   kubectl describe cluster.eks.aws.crossplane.io my-eks-cluster
   \`\`\`

3. Common issues and solutions:
   - IAM permissions: Ensure proper roles and policies
   - VPC configuration: Verify subnet and security group settings
   - Version compatibility: Check Crossplane and provider versions

## Conclusion

Crossplane brings infrastructure management into the Kubernetes ecosystem, making it easier to manage EKS clusters using familiar tools and practices. By treating infrastructure as code and using Kubernetes-style declarations, we can create more maintainable and reproducible cloud environments.

Remember to:
- Keep your Crossplane providers updated
- Follow security best practices
- Implement proper monitoring and alerting
- Use version control for your infrastructure configurations

Happy cloud native infrastructure management! 🚀`
  }
];

export const getBlogPosts = (): BlogPost[] => {
  return blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getBlogPost = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};