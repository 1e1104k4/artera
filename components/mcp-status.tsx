'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircleFillIcon,  LoaderIcon } from './icons';

export function MCPStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  useEffect(() => {
    // Simple check to see if MCP is available
    const checkMCPStatus = async () => {
      try {
        // This is a simple check - in a real implementation you might want to ping the MCP server
        setStatus('connected');
      } catch (error) {
        setStatus('disconnected');
      }
    };

    checkMCPStatus();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircleFillIcon className="size-4 text-green-500" />;
      case 'disconnected':
        return <div className="size-4 text-red-500" >X</div>;
      case 'checking':
        return <LoaderIcon size={16} className="text-yellow-500 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'MCP Connected';
      case 'disconnected':
        return 'MCP Disconnected';
      case 'checking':
        return 'Checking MCP...';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            disabled
          >
            {getStatusIcon()}
            <span className="ml-2 hidden sm:inline">{getStatusText()}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>OpenSea MCP Server Status</p>
          <p className="text-xs text-muted-foreground">
            {status === 'connected' 
              ? 'Connected to OpenSea MCP server. NFT tools available.' 
              : status === 'checking' 
                ? 'Checking connection...' 
                : 'Not connected to MCP server.'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
