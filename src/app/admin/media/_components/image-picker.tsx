'use client';

import { FileIcon, InboxIcon, Loader, PlusIcon, Trash2Icon } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Media, useMedia } from './use-media';
import UploadDialog from './upload-dialog';
import SearchFilter from '@/components/datatable/search-filter';
import Pagination from '@/components/datatable/pagination';

function ImageItem({ media, onClick }: { media: Media; onClick: () => void }) {
  return (
    <div className="flex aspect-square w-full flex-col items-start gap-1" onClick={onClick}>
      {media.mimeType.startsWith('image') ? (
        <Image
          src={media?.url}
          width={300}
          height={300}
          className="size-full rounded-md border object-cover"
          alt="Preview"
        />
      ) : (
        <div className="flex size-full items-center justify-center rounded-md bg-gray-200 text-gray-500">
          <span className="text-xl">
            <FileIcon className="size-8" />
          </span>
        </div>
      )}
      <p className="w-full truncate text-xs">{media.fileName}</p>
    </div>
  );
}

export function ImagePickerDialog({
  openDialog,
  setOpenDialog,
  onChange,
  allowTypes,
}: {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  onChange?: (url: string) => void;
  allowTypes?: string[];
}) {
  const { data, openUploadDialog, setOpenUploadDialog, filters, isFetching, setFilter } = useMedia({
    limit: 12,
    allowTypes,
  });
  return (
    <>
      <Dialog open={openDialog} onOpenChange={() => setOpenDialog(false)}>
        <DialogContent hideCloseButton className="gap-0 p-0 sm:max-w-2xl">
          <DialogHeader className="flex flex-row items-center justify-between border-b px-5 py-3">
            <DialogTitle>Select Image</DialogTitle>
            <Button onClick={() => setOpenUploadDialog(true)}>
              <PlusIcon /> Upload media
            </Button>
          </DialogHeader>
          <div className="overflow-y-auto p-6">
            {data && (
              <div className="w-full">
                <SearchFilter className="mb-4" onChange={(e) => setFilter({ search: e })} />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {data?.docs.map((media) => (
                    <ImageItem
                      key={media.id}
                      media={media}
                      onClick={() => {
                        setOpenDialog(false);
                        onChange?.(media.url);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            {!isFetching && data?.docs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <InboxIcon className="h-9 w-9 stroke-[1.3] text-zinc-400 dark:text-zinc-600" />
                <p className="text-muted-foreground text-md mt-2">No media found</p>
              </div>
            )}
            {isFetching && !data?.docs.length && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader className="size-9 animate-spin text-zinc-400 dark:text-zinc-600" />
                <p className="text-muted-foreground text-md mt-2">Loading...</p>
              </div>
            )}
          </div>
          <DialogFooter className="flex items-center !justify-between border-t px-5 py-3">
            <Pagination
              page={filters.page}
              limit={filters.limit}
              totalPages={data?.pagination.totalPages || 1}
              setPage={(page) => setFilter({ page })}
              setLimit={(limit) => setFilter({ limit })}
              showOnNavigation
            />
            <Button variant="secondary" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <UploadDialog openUploadDialog={openUploadDialog} setOpenUploadDialog={setOpenUploadDialog} />
    </>
  );
}

const ImagePicker = ({
  value,
  onChange,
  allowTypes = ['image'],
  disabled,
}: {
  value?: string;
  onChange?: (e?: string) => void;
  allowTypes?: string[];
  disabled?: boolean;
}) => {
  const [openDialog, setOpenDialog] = React.useState(false);

  return (
    <div>
      {value ? (
        <div className="bg-muted bg-transparent-image relative flex size-[50px] items-center justify-center overflow-hidden">
          <Image
            src={value}
            width={60}
            height={60}
            alt="Image"
            className="max-w-full object-contain"
          />
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-1 right-1 size-5 rounded-xs !p-0"
            onClick={() => onChange?.('')}
            disabled={disabled}
          >
            <Trash2Icon className="size-3" />
          </Button>
        </div>
      ) : (
        <Button variant="secondary" onClick={() => setOpenDialog(true)} disabled={disabled}>
          Choose from gallery
        </Button>
      )}
      <ImagePickerDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        onChange={onChange}
        allowTypes={allowTypes}
      />
    </div>
  );
};

export default ImagePicker;
