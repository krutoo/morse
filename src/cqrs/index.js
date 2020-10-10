/*
 * Query() creates new factory of query-messages (like createAction() from redux-toolkit).
 * Query-message is message which can be answered.
 */
const Query = topicBase => {
  const queryTopic = `[@@query]${topicBase}`;
  const responseTopic = `[@@response]${topicBase}`;

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

/*
 * Middleware for global message queue.
 */
const queueMiddleware = queue => next => {
  const hasResponse = {};

  return message => {
    if (message.meta?.isQuery) {
      const queryId = queue.getSize();

      hasResponse[queryId] = false;

      setTimeout(() => {
        if (!hasResponse[queryId]) {
          hasResponse[queryId] = true;

          next({
            topic: message.meta?.responseTopic,
            payload: Error('Query cancelled by timeout'),
            meta: { recipient: message.meta?.author, isResponse: true },
            error: true,
          });
        }
      }, message.meta?.timeout);

      next({ ...message, meta: { ...message.meta, queryId } });
    } else if (message.meta?.isResponse) {
      const { queryId } = message.meta;

      if (!hasResponse[queryId]) {
        hasResponse[queryId] = true;
        next(message);
      }
    } else {
      next(message);
    }
  };
};

export { Query, queueMiddleware };
