import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Button } from '../ui/button';

interface PaginationProps {
  totalPages: number;
  page: number;
  setPage: (_page: number) => void;
  limit: number;
  setLimit: (_limit: number) => void;
  showOnNavigation?: boolean;
}

function Pagination({
  totalPages,
  page,
  setPage,
  limit,
  setLimit,
  showOnNavigation,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between">
      {!showOnNavigation && (
        <p className="text-muted-foreground hidden lg:block">
          Showing {page} of {totalPages} pages
        </p>
      )}
      <div className="flex w-full items-center justify-between gap-6 lg:w-auto">
        {!showOnNavigation && (
          <div className="flex items-center gap-2">
            <p className="hidden lg:block">Rows per page</p>
            <Select value={limit.toString()} onValueChange={(e) => setLimit(parseInt(e, 10))}>
              <SelectTrigger className="h-8 w-[120px] data-[size=default]:h-9">
                <SelectValue placeholder="Rows per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            className="bg-card size-9 disabled:opacity-50"
            size="icon"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronsLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-card size-9 disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-card size-9 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRightIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-card size-9 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage(totalPages)}
          >
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Pagination;
