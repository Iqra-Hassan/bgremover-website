import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import React from 'react';
import { Button } from './button';

const DeleteAlert = ({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText,
  isLoading,
}: {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  isLoading?: boolean;
}) => {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(e) => {
        if (!e) {
          onCancel();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title || 'Are you sure you want to delete this?'}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || 'This action cannot be undone. This will permanently deleted.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConfirm();
              }}
              isLoading={isLoading}
              variant="destructive"
            >
              {confirmText || 'Delete'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAlert;
