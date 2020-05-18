const Query = baseTopic => {
  const queryTopic = `[@@query]${baseTopic}`;
  const responseTopic = `[@@response]${baseTopic}`;

  const createQuery = (payload, { timeout = 10000 } = {}) => ({
    topic: queryTopic,
    payload,
    meta: { isQuery: true, timeout, responseTopic },
  });

  createQuery.queryTopic = queryTopic;
  createQuery.responseTopic = responseTopic;

  return createQuery;
};

// @todo add checking of "isQuery" meta property
Query.responseOf = (queryMessage, payload) => ({
  topic: queryMessage.meta.responseTopic,
  payload,
  meta: {
    recipient: queryMessage.meta.author,
    isResponse: true,
    queryId: queryMessage.meta.queryId,
  },
});

const globalQueueMiddleware = queue => enqueue => {
  const hasResponse = {};

  return message => {
    if (message.meta.isQuery) {
      const queryId = queue.getSize();

      hasResponse[queryId] = false;

      setTimeout(() => {
        if (!hasResponse[queryId]) {
          hasResponse[queryId] = true;

          enqueue({
            topic: message.meta.responseTopic,
            payload: Error('Query cancelled by timeout'),
            meta: { recipient: message.meta.author, isResponse: true },
            error: true,
          });
        }
      }, message.meta.timeout);

      enqueue({ ...message, meta: { ...message.meta, queryId } });
    } else if (message.meta.isResponse) {
      const { queryId } = message.meta;

      if (!hasResponse[queryId]) {
        hasResponse[queryId] = true;
        enqueue(message);
      }
    } else {
      enqueue(message);
    }
  };
};

export { Query, globalQueueMiddleware };
