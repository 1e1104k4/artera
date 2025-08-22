'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon } from '@/components/icons';

interface ToolCallProps {
  toolName: string;
  input?: any;
  output?: any;
  state: 'input-available' | 'output-available';
  isLoading?: boolean;
}

export function ToolCall({ toolName, input, output, state, isLoading }: ToolCallProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatJson = (data: any) => {
    if (!data) return 'No data';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const getToolDisplayName = (name: string) => {
    // Convert snake_case to human readable
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = () => {
    if (isLoading) return 'text-blue-500';
    if (state === 'output-available') return 'text-green-500';
    return 'text-yellow-500';
  };

  const getStatusText = () => {
    if (isLoading) return 'Running...';
    if (state === 'output-available') return 'Completed';
    return 'Running...';
  };

  return (
    <Card className="w-full border-l-4 border-l-blue-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', {
                'bg-blue-500 animate-pulse': isLoading,
                'bg-green-500': state === 'output-available',
                'bg-yellow-500': state === 'input-available' && !isLoading,
              })} />
              <span className="font-mono text-sm font-medium">
                {getToolDisplayName(toolName)}
              </span>
            </div>
            <span className={cn('text-xs', getStatusColor())}>
              {getStatusText()}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="size-6 p-0"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDownIcon size={12} />
            </motion.div>
          </Button>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0 space-y-3">
              {input && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Input:</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-48">
                    {formatJson(input)}
                  </pre>
                </div>
              )}
              
              {output && state === 'output-available' && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Output:</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-48">
                    {formatJson(output)}
                  </pre>
                </div>
              )}

              {isLoading && (
                <div className="text-sm text-muted-foreground italic">
                  Tool is running...
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}