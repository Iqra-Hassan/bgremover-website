import React from 'react';

import PostCard from './post-card';
import { Post } from '@prisma/client';
import { InboxIcon } from 'lucide-react';

const PostsGrid = ({ posts }: { posts: Post[] }) => {
  return (
    <>
      {posts?.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts?.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      ) : (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
          <InboxIcon className="text-muted-foreground size-10 [&_*]:stroke-[1.3]" />
          <p className="text-accent-foreground text-lg font-medium">No posts available.</p>
        </div>
      )}
    </>
  );
};

export default PostsGrid;
