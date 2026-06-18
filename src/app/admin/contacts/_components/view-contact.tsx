import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useContact } from './use-contacts';
import { FormInputSkeletons, FormTextareaSkeletons } from '@/components/skeletons/form-skeletons';
import { FormItem } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { getContactStatusLabel } from '@/data/constans';
import { ContactStatus } from '@prisma/client';

interface ViewContactProps {
  open: boolean;
  onClose: () => void;
  contactId: string;
}

function ViewContactContent({ contactId }: ViewContactProps) {
  const { data, isLoading, updateStatus, isUpdating } = useContact(contactId);
  return (
    <div className="space-y-6 overflow-y-auto px-6">
      {isLoading ? (
        <>
          <FormInputSkeletons />
          <FormInputSkeletons />
          <FormInputSkeletons />
          <FormTextareaSkeletons />
        </>
      ) : (
        <>
          <FormItem>
            <Label>Name</Label>
            <Input value={data?.name || ''} readOnly />
          </FormItem>
          <FormItem>
            <Label>Email</Label>
            <Input value={data?.email || ''} readOnly />
          </FormItem>
          <FormItem>
            <Label>Subject</Label>
            <Input value={data?.subject || ''} readOnly />
          </FormItem>
          <FormItem>
            <Label>Message</Label>
            <Textarea value={data?.message || ''} readOnly className="min-h-40" />
          </FormItem>
          <FormItem>
            <Label>Status</Label>
            <div className="flex gap-2">
              {Object.values(ContactStatus).map((status) => (
                <Button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={isUpdating}
                  variant={data?.status === status ? 'default' : 'outline'}
                >
                  {getContactStatusLabel(status)}
                </Button>
              ))}
            </div>
          </FormItem>
        </>
      )}
    </div>
  );
}

export function ViewContact({ open, onClose, contactId }: ViewContactProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader>
          <SheetTitle>Contact Message</SheetTitle>
        </SheetHeader>
        <ViewContactContent open={open} onClose={onClose} contactId={contactId} />
      </SheetContent>
    </Sheet>
  );
}
