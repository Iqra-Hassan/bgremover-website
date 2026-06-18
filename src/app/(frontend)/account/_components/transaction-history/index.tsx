'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from './use-transactions';
import { Loader } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Moment from 'react-moment';
import Pagination from '@/components/datatable/pagination';
import { formatPrice, getCurrencySymbol } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/components/settings-provider';

const TransactionsHistory = () => {
  const settings = useSettings();
  const { transactions, isLoadingTransactions, page, setPage } = useTransactions();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>View your transaction history.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!transactions && isLoadingTransactions ? (
            <div className="flex h-[200px] items-center justify-center">
              <Loader className="size-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions?.docs.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {getCurrencySymbol(settings?.billing?.currency)}
                          {formatPrice(item.price)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.status === 'paid' ? 'success' : 'destructive'}>
                            {item.status === 'paid' ? 'Paid' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.credits}</TableCell>
                        <TableCell>
                          <Moment format="DD/MM/YYYY hh:mm A">{item.createdAt}</Moment>
                        </TableCell>
                      </TableRow>
                    ))}
                    {transactions?.docs.length === 0 && (
                      <TableRow className="!bg-transparent">
                        <TableCell colSpan={5} className="h-[200px] text-center">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-end">
                <Pagination
                  totalPages={transactions?.pagination.totalPages || 1}
                  page={page}
                  setPage={setPage}
                  showOnNavigation
                  limit={transactions?.pagination.limit || 6}
                  setLimit={() => {}}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default TransactionsHistory;
