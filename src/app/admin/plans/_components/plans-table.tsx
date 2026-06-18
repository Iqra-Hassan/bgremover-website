'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import DeleteAlert from '@/components/ui/delete-alert';
import DataTable from '@/components/datatable';
import { Trash2 } from 'lucide-react';
import Moment from 'react-moment';
import { usePlans } from './use-plans';
import { PlanFormSheet } from './plan-form';
import { getPlanStatusLabel } from '@/data/constans';
import { useSettings } from '@/components/settings-provider';
import { formatPrice, getCurrencySymbol } from '@/lib/utils';

export default function PlansTable() {
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
    selectedPlan,
    setSelectedPlan,
    deletePlans,
    isDeleting,
  } = usePlans();
  const settings = useSettings();

  return (
    <>
      <DataTable
        onSearch={(e) => setFilter({ search: e })}
        addButtonText="Add Plan"
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
          setSelectedPlan(record.id);
          setOpenUpdateDialog(true);
        }}
        columns={[
          {
            title: 'Name',
            key: 'name',
            sortable: true,
            maxWidth: 200,
          },
          {
            title: 'Price',
            key: 'price',
            render: (value, record) => (
              <Badge variant="outline">
                {getCurrencySymbol(settings?.billing.currency)}
                {formatPrice(record.price)}
              </Badge>
            ),
          },
          {
            title: 'Credits',
            key: 'credits',
            sortable: true,
          },
          {
            title: 'Status',
            key: 'status',
            sortable: true,
            render: (value) => (
              <Badge variant={value === 'active' ? 'success' : 'secondary'}>
                {getPlanStatusLabel(value)}
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
        onConfirm={() => deletePlans(selected)}
        isLoading={isDeleting}
      />

      <PlanFormSheet
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        mode="create"
      />

      <PlanFormSheet
        open={openUpdateDialog}
        onClose={() => setOpenUpdateDialog(false)}
        mode="update"
        planId={selectedPlan}
      />
    </>
  );
}
