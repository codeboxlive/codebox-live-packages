export type RequestHandler<
  MessageData extends object | undefined,
  ResponseType extends object | null
> = (data: MessageData) => Promise<ResponseType>;

export type MessageHandler<MessageData extends object | undefined> = (
  data: MessageData
) => void;
