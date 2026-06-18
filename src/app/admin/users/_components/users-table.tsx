'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import DeleteAlert from '@/components/ui/delete-alert';
import DataTable from '@/components/datatable';
import { Trash2 } from 'lucide-react';
import Moment from 'react-moment';
import { useUsers } from './use-users';
import { UserFormSheet } from './user-form';
import { getUserRoleLabel } from '@/data/constans';
import { Avatar } from '@/components/ui/avatar';

export default function UsersTable() {
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
    selectedUser,
    setSelectedUser,
    deleteUsers,
    isDeleting,
  } = useUsers();

  return (
    <>
      <DataTable
        onSearch={(e) => setFilter({ search: e })}
        addButtonText="Add User"
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
          setSelectedUser(record.id);
          setOpenUpdateDialog(true);
        }}
        columns={[
          {
            title: 'Name',
            key: 'name',
            sortable: true,
            maxWidth: 200,
            render: (record, row) => {
              return (
                <div className="flex items-center gap-2">
                  <Avatar src={row.image} name={row.name} />
                  <p className="max-w-[250px] truncate text-sm font-medium">{row.name}</p>
                </div>
              );
            },
          },
          {
            title: 'Email',
            key: 'email',
            sortable: true,
            maxWidth: 250,
          },
          {
            title: 'Credits',
            key: 'credits',
            sortable: true,
            render: (value) => <Badge variant="secondary">{value}</Badge>,
          },
          {
            title: 'Role',
            key: 'role',
            sortable: true,
            render: (value) => (
              <Badge variant={value === 'admin' ? 'success' : 'secondary'}>
                {getUserRoleLabel(value)}
              </Badge>
            ),
          },
          {
            title: 'Email Verified',
            key: 'emailVerified',
            sortable: true,
            render: (value) => (
              <Badge variant={value ? 'success' : 'secondary'}>{value ? 'Yes' : 'No'}</Badge>
            ),
          },
          {
            title: 'Joined At',
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
        onConfirm={() => deleteUsers(selected)}
        isLoading={isDeleting}
      />

      <UserFormSheet
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        mode="create"
      />

      <UserFormSheet
        open={openUpdateDialog}
        onClose={() => setOpenUpdateDialog(false)}
        mode="update"
        userId={selectedUser}
      />
    </>
  );
}
