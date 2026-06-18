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
import { usePayments } from '../../payments/_components/use-payments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { formatPrice, getCurrencySymbol } from '@/lib/utils';
import { useSettings } from '@/components/settings-provider';
import { getPaymentStatusLabel } from '@/data/constans';

const LatestPayments = () => {
  const settings = useSettings();
  const { data, isFetching } = usePayments(6);

  return (
    <Card>
      <CardHeader className="flex border-b">
        <CardTitle className="text-base font-medium">Recent Payments</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[300px] overflow-auto px-5 pt-2">
        <Table>
          <TableHeader>
            <TableRow className="!border-0">
              <TableHead className="text-left">User</TableHead>
              <TableHead className="text-left">Price</TableHead>
              <TableHead className="text-left">Status</TableHead>
              <TableHead className="text-left">Credits</TableHead>
              <TableHead className="text-left">Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={6}>
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
                      <Avatar src={item.user?.image || ''} name={item.user?.name || 'N/A'} />
                      <div>
                        <div className="leading-[1.2] font-medium">{item.user?.name || 'N/A'}</div>
                        <div className="text-muted-foreground text-sm leading-[1.2]">
                          {item.user?.email || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getCurrencySymbol(settings?.billing.currency)}
                      {formatPrice(item.price)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="capitalize"
                      variant={item.status === 'paid' ? 'success' : 'secondary'}
                    >
                      {getPaymentStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.credits}</TableCell>
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

export default LatestPayments;
