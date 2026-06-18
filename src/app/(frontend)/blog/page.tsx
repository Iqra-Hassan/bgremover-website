import React from 'react';
import postService from '@/server/posts/post-service';
import PostsGrid from './_components/posts-grid';
import Pagination from './_components/pagination';
import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Blog - ${settings?.general?.applicationName || ''}`,
  };
}

type tSearchParams = Promise<{ page: string }>;

const Page = async ({ searchParams }: { searchParams: tSearchParams }) => {
  const { page } = await searchParams;
  const posts = await postService.queryPosts({
    page: Number(page) || 1,
    limit: 9,
  });
  return (
    <div className="py-14 md:py-20">
      <div className="container">
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
            Blog
          </div>
          <h1 className="text-2xl font-semibold md:text-3xl">Latest posts</h1>
        </div>
        <PostsGrid posts={posts.docs} />
        <Pagination
          totalPages={posts.pagination.totalPages}
          page={posts.pagination.page}
          limit={posts.pagination.limit}
        />
      </div>
    </div>
  );
};

export default Page;
