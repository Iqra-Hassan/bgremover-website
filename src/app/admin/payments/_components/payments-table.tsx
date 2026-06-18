'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/datatable';
import Moment from 'react-moment';
import { usePayments } from './use-payments';
import { Avatar } from '@/components/ui/avatar';
import { PaymentStatus } from '@prisma/client';
import { getPaymentStatusLabel } from '@/data/constans';
import { formatPrice, getCurrencySymbol } from '@/lib/utils';
import { useSettings } from '@/components/settings-provider';

export default function PaymentsTable() {
  const settings = useSettings();
  const { setFilter, data, isFetching, filters } = usePayments();

  return (
    <>
      <DataTable
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
        columns={[
          {
            title: 'User',
            key: 'user',
            sortable: true,
            maxWidth: 200,
            minWidth: 150,
            render: (value, record) => (
              <div className="flex items-center gap-2">
                <Avatar src={record.user?.image || ''} name={record.user?.name || 'N/A'} />
                <div>
                  <div className="leading-[1.2] font-medium">{record.user?.name || 'N/A'}</div>
                  <div className="text-muted-foreground text-sm leading-[1.2]">
                    {record.user?.email || 'N/A'}
                  </div>
                </div>
              </div>
            ),
          },
          {
            title: 'Price',
            key: 'price',
            render: (value) => (
              <Badge variant="outline">
                {getCurrencySymbol(settings?.billing.currency)}
                {formatPrice(value)}
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
            maxWidth: 100,
            minWidth: 80,
            render: (value) => (
              <Badge variant={value === 'paid' ? 'success' : 'secondary'}>
                {getPaymentStatusLabel(value)}
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
        ]}
        filters={[
          {
            type: 'multi-select',
            label: 'Status',
            key: 'status',
            value: filters.status,
            onFilter: (value) => setFilter({ status: value }),
            options: Object.values(PaymentStatus).map((status) => ({
              label: getPaymentStatusLabel(status),
              value: status,
            })),
          },
        ]}
      />
    </>
  );
}
