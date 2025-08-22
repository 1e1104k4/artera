'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useDataStream } from '@/components/data-stream-provider';
import { ToolCall } from '@/components/tool-call';

interface ToolCallData {
  toolName: string;
  toolCallId: string;
  input: any;
  output?: any;
  state: 'input-available' | 'output-available';
}

export default function ToolCallsDisplay() {
  const { dataStream } = useDataStream();
  const [toolCalls, setToolCalls] = useState<Map<string, ToolCallData>>(new Map());

  useEffect(() => {
    if (!dataStream || dataStream.length === 0) return;

    const newToolCalls = new Map(toolCalls);

    // Process all tool calls and results from the data stream
    for (const part of dataStream) {
      if (part.type === 'data-toolCall') {
        const data = part.data as ToolCallData;
        newToolCalls.set(data.toolCallId, data);
      } else if (part.type === 'data-toolResult') {
        const data = part.data as ToolCallData;
        // Update existing tool call with result
        const existing = newToolCalls.get(data.toolCallId);
        if (existing) {
          newToolCalls.set(data.toolCallId, {
            ...existing,
            output: data.output,
            state: 'output-available',
          });
        } else {
          // Create new entry if we missed the initial call
          newToolCalls.set(data.toolCallId, data);
        }
      }
    }

    setToolCalls(newToolCalls);
  }, [dataStream]);

  if (toolCalls.size === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Tool Calls</h3>
      <div className="space-y-3">
        {Array.from(toolCalls.values()).map((toolCall) => (
          <ToolCall
            key={toolCall.toolCallId}
            toolName={toolCall.toolName}
            input={toolCall.input}
            output={toolCall.output}
            state={toolCall.state}
            isLoading={toolCall.state === 'input-available'}
          />
        ))}
      </div>
    </div>
  );
}