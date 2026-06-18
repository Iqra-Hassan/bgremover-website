import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Post } from '@prisma/client';

const PostCard = ({ post }: { post: Post }) => {
  return (
    <Card
      key={post.id}
      className="bg-muted/50 flex flex-col gap-0 rounded-3xl p-0 pb-4 shadow-none"
    >
      <div className="w-full">
        <Link
          href={`/blog/${post.slug}`}
          className="fade-in transition-opacity duration-200 hover:opacity-80"
        >
          <Image
            width={500}
            height={400}
            src={post.thumbnail || '/images/placeholder.svg'}
            alt={post.title}
            className="aspect-[14/9] h-full w-full rounded-tl-[23px] rounded-tr-[23px] object-cover object-center"
          />
        </Link>
      </div>
      <CardHeader className="mt-6">
        <h3 className="text-lg font-semibold hover:underline md:text-xl">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
      </CardHeader>
      {post.excerpt && (
        <CardContent className="mt-2">
          <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
        </CardContent>
      )}

      <CardFooter className="mt-3">
        <Button asChild variant="link" className="!px-0">
          <Link href={`/blog/${post.slug}`}>
            Read more
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
