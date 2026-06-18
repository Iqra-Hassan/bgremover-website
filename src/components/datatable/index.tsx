'use client';

import { InboxIcon, PlusIcon } from 'lucide-react';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { cn } from '@/lib/utils';

import TableSkeletons from '../skeletons/table-skeleton';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import TableFilters from './filters';
import Pagination from './pagination';
import SearchFilter from './search-filter';
import { DataTableProps } from './types';

const DataTable = (props: DataTableProps) => {
  const {
    onSearch,
    addButtonText,
    onAddClick,
    pagination,
    isLoading,
    sort,
    data,
    columns,
    selection,
    onClickRow,
    actions,
    filters,
  } = props;

  return (
    <div>
      <div className="flex flex-col items-center justify-between gap-5 sm:flex-row sm:gap-2">
        <div className="flex w-full flex-1 items-center gap-4 sm:w-auto">
          {onSearch && <SearchFilter onChange={onSearch} />}
        </div>
        <div className="flex w-full items-center gap-4 sm:w-auto">
          {filters && <TableFilters filters={filters} />}
          {addButtonText && (
            <Button className="h-9" onClick={onAddClick}>
              <PlusIcon /> {addButtonText}
            </Button>
          )}
        </div>
      </div>
      <div className="relative">
        <div className="bg-card mt-5 h-[calc(100svh-248px)] overflow-auto rounded-xl border">
          {!data?.length && isLoading ? (
            <TableSkeletons />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {selection && (
                    <TableHead className="w-12 px-4">
                      <Checkbox
                        checked={selection.selected.length > 0}
                        isIndeterminate={selection.selected.length !== data.length}
                        onCheckedChange={() => {
                          selection.setSelected(
                            selection.selected.length !== data.length
                              ? data.map((item) => item.id)
                              : [],
                          );
                        }}
                      />
                    </TableHead>
                  )}
                  {columns.map((column) => (
                    <TableHead
                      style={{
                        ...(column.width && { width: column.width }),
                        ...(column.minWidth && { minWidth: column.minWidth }),
                        ...(column.maxWidth && { maxWidth: column.maxWidth }),
                        ...(column.align && { textAlign: column.align }),
                      }}
                      key={column.key}
                      onClick={() => {
                        if (column.sortable) {
                          if (sort?.key === column.key) {
                            sort?.onSort(
                              sort.order === 'asc' ? undefined : column.key,
                              sort.order === 'asc'
                                ? undefined
                                : sort.order === 'desc'
                                  ? 'asc'
                                  : 'desc',
                            );
                          } else {
                            sort?.onSort(column.key, 'desc');
                          }
                        }
                      }}
                      className={cn('group whitespace-nowrap', {
                        'cursor-pointer': column.sortable,
                      })}
                    >
                      <div className="flex items-center gap-1.5">
                        {column.title}
                        {column.sortable && sort && (
                          <div className="relative inline-flex size-4 items-center">
                            <ArrowUpIcon
                              className={cn('invisible absolute size-3.5 opacity-0 transition', {
                                'visible opacity-100':
                                  sort.key === column.key && sort.order === 'asc',
                              })}
                            />
                            <ArrowDownIcon
                              className={cn('invisible absolute size-3.5 opacity-0 transition', {
                                'visible opacity-100':
                                  sort.key === column.key && sort.order === 'desc',
                                'group-hover:visible group-hover:opacity-40':
                                  sort.key !== column.key,
                              })}
                            />
                          </div>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow
                    key={index}
                    onClick={() => onClickRow?.(row)}
                    className={cn({ 'cursor-pointer': onClickRow })}
                  >
                    {selection && (
                      <TableCell className="w-12 px-4">
                        <Checkbox
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            const isSelected = selection.selected.includes(row.id);
                            if (isSelected) {
                              selection.setSelected(
                                selection.selected.filter((id) => id !== row.id),
                              );
                            } else {
                              selection.setSelected([...selection.selected, row.id]);
                            }
                          }}
                          checked={selection.selected.includes(row.id)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell
                        style={{
                          ...(column.width && { width: column.width }),
                          ...(column.minWidth && { minWidth: column.minWidth }),
                          ...(column.maxWidth && { maxWidth: column.maxWidth }),
                          ...(column.align && { textAlign: column.align }),
                        }}
                        key={column.key}
                        className="truncate"
                      >
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {data.length === 0 && (
                  <TableRow className="!bg-transparent">
                    <TableCell colSpan={columns.length + (selection ? 1 : 0)}>
                      <div className="flex min-h-[calc(100svh-320px)] flex-col items-center justify-center">
                        <InboxIcon className="h-12 w-12 stroke-[1.3] text-zinc-400 dark:text-zinc-600" />
                        <p className="text-md mt-2 font-medium text-zinc-400 dark:text-zinc-600">
                          No data found
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
        {selection && (
          <div
            className={cn(
              'bg-card border-border invisible absolute bottom-0 left-1/2 flex min-w-[330px] -translate-x-1/2 items-center justify-between rounded-full border px-4 py-2 opacity-0 shadow-lg transition-all',
              {
                'visible -translate-y-5 opacity-100': selection.selected.length > 0,
              },
            )}
          >
            <div className="mr-14 flex items-center gap-2">
              <p className="text-[13px]">
                <span>Selected</span> <strong>{selection.selected.length}</strong> <span>Rows</span>
              </p>
              <Button
                variant="outline"
                className="border-foreground/50 h-5 w-11 rounded-sm text-xs"
                onClick={() => selection.setSelected([])}
              >
                Reset
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {actions?.map((action, i) => (
                <Button
                  key={i}
                  className={cn('size-7 rounded-sm', action.className)}
                  onClick={action.onClick}
                  variant="outline"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-5">
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          setPage={pagination.setPage}
          setLimit={pagination.setLimit}
          limit={pagination.limit}
        />
      </div>
    </div>
  );
};

export default DataTable;
