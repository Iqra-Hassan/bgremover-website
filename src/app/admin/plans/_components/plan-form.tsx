'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { TagsInput } from '@/components/ui/tags-input';
import { NumberInput } from '@/components/ui/number-input';
import { usePlanForm } from './use-plans';
import { getCurrencySymbol } from '@/lib/utils';
import { useSettings } from '@/components/settings-provider';
import { FormInputSkeletons, FormTextareaSkeletons } from '@/components/skeletons/form-skeletons';
import { getPlanStatusLabel } from '@/data/constans';
import { PlanStatus } from '@prisma/client';

interface PlanFormProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'update';
  planId?: string | null;
}

export function PlanForm({ onClose, mode, planId }: PlanFormProps) {
  const { form, onSubmit, isSubmitting, isLoading } = usePlanForm({ mode, planId, onClose });
  const settings = useSettings();

  return (
    <>
      {isLoading ? (
        <div className="space-y-6 px-6">
          <FormInputSkeletons />
          <FormTextareaSkeletons />
          <FormInputSkeletons />
          <FormInputSkeletons />
          <FormInputSkeletons />
          <FormInputSkeletons />
          <FormInputSkeletons />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-y-auto">
            <div className="space-y-6 px-6">
              <FormField
                control={form.control}
                name="name"
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter plan name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter plan description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <NumberInput
                        prefix={getCurrencySymbol(settings?.billing.currency)}
                        decimalScale={2}
                        value={field.value}
                        onValueChange={(value) => field.onChange(value || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={(e) => {
                        if (e) {
                          field.onChange(e);
                        }
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(PlanStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {getPlanStatusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="credits"
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credits</FormLabel>
                    <FormControl>
                      <NumberInput value={field.value} onValueChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="features"
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Features</FormLabel>
                    <FormControl>
                      <TagsInput
                        placeholder="Add features..."
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>Press Enter to add a feature.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPopular"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Popular Plan</FormLabel>
                      <FormDescription>
                        Mark this plan as popular (will be highlighted)
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="order"
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <NumberInput value={field.value} onValueChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" className="flex-1" isLoading={isSubmitting}>
                {mode === 'create' ? 'Create Plan' : 'Update Plan'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      )}
    </>
  );
}

export function PlanFormSheet({ open, onClose, mode, planId }: PlanFormProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{mode === 'create' ? 'Create Plan' : 'Update Plan'}</SheetTitle>
        </SheetHeader>
        <PlanForm open={open} onClose={onClose} mode={mode} planId={planId} />
      </SheetContent>
    </Sheet>
  );
}
