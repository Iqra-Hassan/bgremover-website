'use client';

import Pagination from '@/components/datatable/pagination';
import { useRouter } from 'nextjs-toploader/app';

type PaginationProps = {
  totalPages: number;
  page: number;
  limit: number;
};

const PostPagination = ({ totalPages, page, limit }: PaginationProps) => {
  const router = useRouter();

  return (
    <div className="mt-10 flex justify-center">
      <Pagination
        totalPages={totalPages}
        page={page}
        showOnNavigation
        setPage={(page) => {
          router.push(`/blog?page=${page}`);
        }}
        limit={limit}
        setLimit={() => {}}
      />
    </div>
  );
};

export default PostPagination;
