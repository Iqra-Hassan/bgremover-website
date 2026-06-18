'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Loader } from 'lucide-react';
import { XIcon } from 'lucide-react';
import { usePasskeys } from './use-passkeys';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const UserPasskeys = () => {
  const {
    passkeys,
    isLoading,
    isDeleting,
    deletePassKey,
    isCreating,
    createPassKey,
    createName,
    setCreateName,
    showCreateModal,
    setShowCreateModal,
  } = usePasskeys();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Passkeys</CardTitle>
          <CardDescription>Use passkeys as a secure alternative to passwords.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-20 items-center justify-center">
              <Loader className="animate-spin" />
            </div>
          ) : passkeys.length > 0 ? (
            <div className="space-y-2">
              {passkeys.map((passkey) => (
                <div
                  key={passkey.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-semibold">{passkey.name || 'Unnamed Passkey'}</p>
                    <p className="text-muted-foreground text-sm">
                      Created on {new Date(passkey.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-7"
                    disabled={isDeleting}
                    onClick={() => deletePassKey(passkey.id)}
                  >
                    <XIcon />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No passkeys found. Add a new passkey to get started.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button size="lg" onClick={() => setShowCreateModal(true)}>
            <PlusIcon /> Add passkey
          </Button>
        </CardFooter>
      </Card>
      <Dialog
        open={showCreateModal}
        onOpenChange={(e) => {
          if (!e) {
            setCreateName('');
            setShowCreateModal(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Passkey</DialogTitle>
            <DialogDescription>
              Enter a name for your new passkey. This will help you identify it later.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Enter passkey name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
          />
          <DialogFooter className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setCreateName('');
                setShowCreateModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              isLoading={isCreating}
              disabled={!createName.trim() || isCreating}
              onClick={createPassKey}
            >
              Create Passkey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserPasskeys;
