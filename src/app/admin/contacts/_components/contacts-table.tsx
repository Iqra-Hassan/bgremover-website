'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import DeleteAlert from '@/components/ui/delete-alert';
import DataTable from '@/components/datatable';
import { Trash2 } from 'lucide-react';
import Moment from 'react-moment';
import { useContacts } from './use-contacts';
import { getContactStatusLabel } from '@/data/constans';
import { ViewContact } from './view-contact';
import { ContactStatus } from '@prisma/client';

export default function ContactsTable() {
  const {
    setFilter,
    data,
    isFetching,
    filters,
    selected,
    setSelected,
    showDeleteDialog,
    setShowDeleteDialog,
    selectedContact,
    setSelectedContact,
    deleteContacts,
    isDeleting,
  } = useContacts();

  return (
    <>
      <DataTable
        onSearch={(e) => setFilter({ search: e })}
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
          setSelectedContact(record.id);
        }}
        columns={[
          {
            title: 'Name',
            key: 'name',
            sortable: true,
            maxWidth: 200,
            minWidth: 100,
          },
          {
            title: 'Email',
            key: 'email',
            sortable: true,
            maxWidth: 200,
            minWidth: 100,
          },
          {
            title: 'Subject',
            key: 'subject',
            sortable: true,
            maxWidth: 200,
            minWidth: 100,
          },
          {
            title: 'Status',
            key: 'status',
            sortable: true,
            render: (value) => (
              <Badge
                variant={
                  value === 'replied' ? 'success' : value === 'read' ? 'secondary' : 'outline'
                }
              >
                {getContactStatusLabel(value)}
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
            options: Object.values(ContactStatus).map((status) => ({
              label: getContactStatusLabel(status),
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
        onConfirm={() => deleteContacts(selected)}
        isLoading={isDeleting}
      />

      <ViewContact
        open={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        contactId={selectedContact || ''}
      />
    </>
  );
}
