import React from 'react';
import { Table } from '@/components/ui';

interface TableWidgetProps {
  columns?: Array<{
    key: string;
    header: string;
  }>;
  data?: Record<string, any>[];
  caption?: string;
  className?: string;
}

export const TableWidget: React.FC<TableWidgetProps> = ({
  columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
  ],
  data = [
    { name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  ],
  caption,
  className,
}) => {
  return (
    <Table
      columns={columns}
      data={data}
      caption={caption}
      className={className}
    />
  );
};
