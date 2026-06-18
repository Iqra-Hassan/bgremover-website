'use client';

import { Loader } from 'lucide-react';
import React from 'react';
import Moment from 'react-moment';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUsers } from '../../users/_components/use-users';
import { Avatar } from '@/components/ui/avatar';

const LatestUsers = () => {
  const { data, isFetching } = useUsers(6);

  return (
    <Card>
      <CardHeader className="flex border-b">
        <CardTitle className="text-base font-medium">Recent Users</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[300px] overflow-auto px-5 pt-2">
        <Table>
          <TableHeader>
            <TableRow className="!border-0">
              <TableHead className="text-left">Name</TableHead>
              <TableHead className="text-left">Email</TableHead>
              <TableHead className="text-left">Role</TableHead>
              <TableHead className="text-left">Email Verified</TableHead>
              <TableHead className="text-left">Joined At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="flex min-h-[300px] items-center justify-center">
                    <Loader className="animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.docs?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar src={item.image ?? undefined} name={item.name} />
                      <p className="max-w-[250px] truncate text-sm font-medium">{item.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-[250px] truncate text-sm font-medium">{item.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="capitalize"
                      variant={item.role === 'admin' ? 'success' : 'secondary'}
                    >
                      {item.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="capitalize"
                      variant={item.emailVerified ? 'success' : 'secondary'}
                    >
                      {item.emailVerified ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Moment format="DD/MM/YYYY" className="text-[13px]">
                      {item.createdAt}
                    </Moment>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LatestUsers;
