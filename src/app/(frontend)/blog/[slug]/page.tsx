import { Metadata } from 'next';
import Image from 'next/image';
import React, { cache } from 'react';

import postService from '@/server/posts/post-service';
import NotFound from '../../_components/not-found';

type tParams = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: tParams }): Promise<Metadata> {
  const { slug } = await params;
  const post = await cache(postService.getPostBySlug)(slug);

  return {
    title: post?.title || '404 - Not Found',
    description: post?.excerpt || '',
    openGraph: {
      title: post?.title || '404 - Not Found',
      description: post?.excerpt || '',
      images: post?.thumbnail ? [post.thumbnail] : [],
    },
  };
}

const BlogPostPage = async ({ params }: { params: tParams }) => {
  const { slug } = await params;
  const post = await cache(postService.getPostBySlug)(slug);
  if (!post) {
    return <NotFound />;
  }

  return (
    <div className="container !max-w-[800px] py-12 md:py-20">
      <h1 className="text-2xl font-bold md:text-4xl">{post.title}</h1>
      {post.thumbnail && (
        <Image
          width={500}
          height={400}
          src={post.thumbnail}
          alt={post.title}
          className="mt-8 h-auto w-full rounded-xl object-contain"
        />
      )}
      <div>
        <div
          className="prose dark:prose-invert mt-10"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </div>
  );
};

export default BlogPostPage;
