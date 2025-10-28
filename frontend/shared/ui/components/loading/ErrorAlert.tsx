import React from 'react';
import { Alert } from '../ui/Alert';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  error: string | Error;
  onRetry?: () => void;
  className?: string;
}

export function ErrorAlert({ error, onRetry, className = '' }: ErrorAlertProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <div className="flex items-center justify-between w-full">
        <div>
          <h4 className="font-semibold">Error</h4>
          <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-4"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    </Alert>
  );
}