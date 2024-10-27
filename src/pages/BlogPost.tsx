import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar } from 'lucide-react';

const BLOG_POSTS = {
  'getting-started-with-aws-cloud': {
    title: "Getting Started with AWS Cloud: A Comprehensive Guide",
    date: "2024-03-15",
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
  }
};

function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? BLOG_POSTS[slug as keyof typeof BLOG_POSTS] : null;

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Post not found</p>
        <Link to="/blog" className="text-[var(--aws-orange)] hover:text-[#ffb84d] mt-4 inline-block">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/blog"
          className="inline-flex items-center text-[var(--aws-orange)] hover:text-[#ffb84d] mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>

        <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>
        
        <div className="flex items-center gap-2 text-gray-400 mb-8">
          <Calendar className="w-4 h-4" />
          <span>{new Date(post.date).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="aws-card rounded-lg p-8">
        <article className="prose prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}

export default BlogPost;