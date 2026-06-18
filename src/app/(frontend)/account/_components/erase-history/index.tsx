'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useHistory } from './use-history';
import { DownloadIcon, Loader, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';
import Moment from 'react-moment';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/datatable/pagination';
import { downloadImage } from '@/lib/utils';
import DeleteAlert from '@/components/ui/delete-alert';
import { Badge } from '@/components/ui/badge';

const EraseHistory = () => {
  const {
    history,
    isLoadingHistory,
    page,
    setPage,
    handleDeleteHistory,
    deleteId,
    setDeleteId,
    isLoadingDeleteHistory,
  } = useHistory();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>View your image edit history.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!history && isLoadingHistory ? (
            <div className="flex h-[200px] items-center justify-center">
              <Loader className="size-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Preview</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="w-[40px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history?.docs.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Image
                            src={item.outputUrl}
                            alt="Image"
                            width={60}
                            height={60}
                            className="size-12 rounded-md object-cover"
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.isFree ? 'outline' : 'default'}>
                            {item.isFree ? 'Free' : 'Pro'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Moment fromNow>{item.createdAt}</Moment>
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => downloadImage(item.outputUrl)}
                            variant="outline"
                            size="icon"
                            className="mr-2 size-7 rounded-md"
                          >
                            <DownloadIcon className="size-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="!text-destructive size-7 rounded-md"
                            onClick={() => setDeleteId(item.id)}
                            disabled={isLoadingDeleteHistory}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {history?.docs.length === 0 && (
                      <TableRow className="!bg-transparent">
                        <TableCell colSpan={5} className="h-[200px] text-center">
                          No history found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-end">
                <Pagination
                  totalPages={history?.pagination.totalPages || 1}
                  page={page}
                  setPage={setPage}
                  showOnNavigation
                  limit={history?.pagination.limit || 6}
                  setLimit={() => {}}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <DeleteAlert
        open={!!deleteId}
        onConfirm={() => handleDeleteHistory(deleteId || '')}
        onCancel={() => setDeleteId(null)}
        confirmText="Delete"
        isLoading={isLoadingDeleteHistory}
      />
    </>
  );
};

export default EraseHistory;
