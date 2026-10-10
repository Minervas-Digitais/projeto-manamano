import React, { ReactNode } from 'react';
import { EmptyContainer, EmptyText } from './EmptyStateStyle';

type EmptyStateProps = {
  text: string;
  icon?: ReactNode;
  inline?: boolean;
  testID?: string;
};

export default function EmptyState({
  text,
  icon,
  inline = false,
  testID = 'empty-state',
}: EmptyStateProps) {
  return (
    <EmptyContainer $inline={inline} testID={testID}>
      {icon}
      <EmptyText>{text}</EmptyText>
    </EmptyContainer>
  );
}
