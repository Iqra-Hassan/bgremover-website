'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import DeleteAlert from '@/components/ui/delete-alert';
import DataTable from '@/components/datatable';
import { Trash2 } from 'lucide-react';
import Moment from 'react-moment';
import { usePosts } from './use-posts';
import { PostFormSheet } from './post-form';
import { getPostStatusLabel } from '@/data/constans';
import Image from 'next/image';
import { PostStatus } from '@prisma/client';

export default function PostsTable() {
  const {
    setFilter,
    data,
    isFetching,
    filters,
    selected,
    setSelected,
    showDeleteDialog,
    setShowDeleteDialog,
    openCreateDialog,
    setOpenCreateDialog,
    openUpdateDialog,
    setOpenUpdateDialog,
    selectedPost,
    setSelectedPost,
    deletePosts,
    isDeleting,
  } = usePosts();

  return (
    <>
      <DataTable
        onSearch={(e) => setFilter({ search: e })}
        addButtonText="Add Post"
        onAddClick={() => setOpenCreateDialog(true)}
        pagination={{
          page: filters.page,
          limit: filters.limit,
          totalPages: data?.pagination.totalPages || 1,
          setPage: (page) => setFilter({ page }),
          setLimit: (limit) => setFilter({ limit }),
        }}
        sort={{
          key: filters.sort,
          order: filters.order,
          onSort: (key, order) => setFilter({ sort: key, order }),
        }}
        isLoading={isFetching}
        data={data?.docs || []}
        selection={{
          selected,
          setSelected,
        }}
        onClickRow={(record) => {
          setSelectedPost(record.id);
          setOpenUpdateDialog(true);
        }}
        columns={[
          {
            title: 'Title',
            key: 'title',
            sortable: true,
            maxWidth: 300,
            minWidth: 200,
            render: (value, record) => (
              <div className="flex items-center gap-4">
                <Image
                  src={record?.thumbnail || '/images/placeholder.svg'}
                  alt={value}
                  width={60}
                  height={60}
                  className="size-10 rounded-md object-cover"
                />
                <p className="truncate text-sm font-medium">{value}</p>
              </div>
            ),
          },
          {
            title: 'Status',
            key: 'status',
            sortable: true,
            render: (value) => (
              <Badge variant={value === 'published' ? 'success' : 'secondary'}>
                {getPostStatusLabel(value)}
              </Badge>
            ),
          },
          {
            title: 'Created At',
            key: 'createdAt',
            render: (value) => (
              <Moment format="MMM D, YYYY h:mm A" className="text-[13px]">
                {value}
              </Moment>
            ),
            sortable: true,
          },
          {
            title: 'Updated At',
            key: 'updatedAt',
            render: (value) => (
              <Moment format="MMM D, YYYY h:mm A" className="text-[13px]">
                {value}
              </Moment>
            ),
            sortable: true,
          },
        ]}
        filters={[
          {
            type: 'multi-select',
            label: 'Status',
            key: 'status',
            value: filters.status,
            onFilter: (value) => setFilter({ status: value }),
            options: Object.values(PostStatus).map((status) => ({
              label: getPostStatusLabel(status),
              value: status,
            })),
          },
        ]}
        actions={[
          {
            label: <Trash2 className="size-4" />,
            className: '!text-destructive',
            onClick: () => {
              if (selected.length > 0) {
                setShowDeleteDialog(true);
              }
            },
          },
        ]}
      />

      <DeleteAlert
        open={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={() => deletePosts(selected)}
        isLoading={isDeleting}
      />

      <PostFormSheet
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        mode="create"
      />

      <PostFormSheet
        open={openUpdateDialog}
        onClose={() => setOpenUpdateDialog(false)}
        mode="update"
        postId={selectedPost}
      />
    </>
  );
}
