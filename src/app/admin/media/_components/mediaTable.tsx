'use client';

import React from 'react';

import DeleteAlert from '@/components/ui/delete-alert';

import { useMedia } from './use-media';
import UploadDialog from './upload-dialog';
import DataTable from '@/components/datatable';
import Image from 'next/image';
import { FileIcon, Trash2 } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import Moment from 'react-moment';
import PreviewMediaDialog from './preview-media';

export default function MediaTable() {
  const {
    setFilter,
    data,
    isFetching,
    filters,
    selected,
    setSelected,
    setPreview,
    preview,
    showDeleteDialog,
    setShowDeleteDialog,
    openUploadDialog,
    setOpenUploadDialog,
    openPreviewDialog,
    setOpenPreviewDialog,
    deleteMedia,
    isDeleting,
  } = useMedia();

  return (
    <>
      <DataTable
        onSearch={(e) => setFilter({ search: e })}
        addButtonText="Add media"
        onAddClick={() => setOpenUploadDialog(true)}
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
          setPreview(record);
          setOpenPreviewDialog(true);
        }}
        columns={[
          {
            title: 'Name',
            key: 'fileName',
            sortable: true,
            maxWidth: 250,
            render(value, record) {
              return (
                <div className="flex items-center">
                  {record.mimeType.startsWith('image') ? (
                    <Image
                      src={record?.url}
                      width={50}
                      height={50}
                      className="mr-3 size-10 min-w-10 rounded-md object-cover"
                      alt="Preview"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPreview(record);
                        setOpenPreviewDialog(true);
                      }}
                    />
                  ) : (
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPreview(record);
                        setOpenPreviewDialog(true);
                      }}
                      className="mr-3 flex size-10 min-w-10 items-center justify-center rounded-md bg-gray-200 text-gray-500"
                    >
                      <span className="text-xl">
                        <FileIcon className="size-4" />
                      </span>
                    </div>
                  )}
                  <p className="truncate">{value}</p>
                </div>
              );
            },
          },
          {
            title: 'Type',
            key: 'mimeType',
            sortable: true,
          },
          {
            title: 'Size',
            key: 'size',
            render: (value) => <>{formatFileSize(value)}</>,
            sortable: true,
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
        ]}
        actions={[
          {
            label: <Trash2 />,
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
        onConfirm={() => deleteMedia(selected)}
        isLoading={isDeleting}
      />
      <UploadDialog openUploadDialog={openUploadDialog} setOpenUploadDialog={setOpenUploadDialog} />
      <PreviewMediaDialog media={preview} open={openPreviewDialog} onClose={setOpenPreviewDialog} />
    </>
  );
}
