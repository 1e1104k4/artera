'use client';

import { DefaultChatTransport } from 'ai';
import { useChat, type UseChatHelpers } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, fetchWithErrorHandlers, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import type { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from './sidebar-history';
import { toast } from './toast';
import type { Session } from 'next-auth';
import { useSearchParams } from 'next/navigation';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { useAutoResume } from '@/hooks/use-auto-resume';
import { ChatSDKError } from '@/lib/errors';
import { useDataStream } from './data-stream-provider';
import type { ChatMessage, Attachment } from '@/lib/types';

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  session,
  autoResume,
  hideDeploy,
  hideModelAndVisibility,
  greetingProps,
  apiEndpoint = '/api/chat',
  historyBasePath = '/chat',
  disableHistoryRewrite = false,
  starterQuery,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
  hideDeploy?: boolean;
  hideModelAndVisibility?: boolean;
  greetingProps?: { title?: string; subtitle?: string; hidden?: boolean };
  apiEndpoint?: string;
  historyBasePath?: string;
  disableHistoryRewrite?: boolean;
  starterQuery?: string;
}) {
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const { mutate } = useSWRConfig();
  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>('');

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
  } = useChat({
    id,
    messages: initialMessages as UseChatHelpers<ChatMessage>['messages'],
    experimental_throttle: 100,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: apiEndpoint,
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest({ messages, id, body }) {
        return {
          body: {
            id,
            message: (messages as any).at(-1),
            selectedChatModel: initialChatModel,
            selectedVisibilityType: visibilityType,
            ...body,
          },
        };
      },
    }),
    onData: (dataPart: any) => {
      setDataStream((ds: any) => (ds ? [...ds, dataPart] : []));
    },
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error: unknown) => {
      if (error instanceof ChatSDKError) {
        toast({
          type: 'error',
          description: error.message,
        });
      }
    },
  } as any);

  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);
  const [hasAppendedStarterQuery, setHasAppendedStarterQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: 'user' as const,
        parts: [{ type: 'text', text: query }],
      } as any);

      setHasAppendedQuery(true);
      window.history.replaceState({}, '', `${historyBasePath}/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id, historyBasePath]);

  useEffect(() => {
    if (starterQuery && !hasAppendedStarterQuery) {
      sendMessage({
        role: 'user' as const,
        parts: [{ type: 'text', text: starterQuery }],
      } as any);
      setHasAppendedStarterQuery(true);
    }
  }, [starterQuery, hasAppendedStarterQuery, sendMessage]);

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages: setMessages as UseChatHelpers<ChatMessage>['setMessages'],
  });

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={initialChatModel}
          selectedVisibilityType={initialVisibilityType}
          isReadonly={isReadonly}
          session={session}
          hideDeploy={hideDeploy}
          hideModelAndVisibility={hideModelAndVisibility}
        />

        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages as any}
          setMessages={setMessages as any}
          regenerate={regenerate as any}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
          greetingProps={greetingProps}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              status={status as any}
              stop={stop as any}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages as any}
              setMessages={setMessages as any}
              sendMessage={sendMessage as any}
              selectedVisibilityType={visibilityType}
              hideSuggestedActions
              historyBasePath={historyBasePath}
              disableHistoryRewrite={disableHistoryRewrite}
            />
          )}
        </form>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        status={status as any}
        stop={stop as any}
        attachments={attachments}
        setAttachments={setAttachments}
        sendMessage={sendMessage as any}
        messages={messages as any}
        setMessages={setMessages as any}
        regenerate={regenerate as any}
        votes={votes}
        isReadonly={isReadonly}
        selectedVisibilityType={visibilityType}
      />
    </>
  );
}
