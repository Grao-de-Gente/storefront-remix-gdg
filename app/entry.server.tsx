import type { EntryContext } from '@remix-run/server-runtime';
import { RemixServer } from '@remix-run/react';
import isbot from 'isbot';

import ReactDOM from 'react-dom/server';


const ABORT_DELAY = 5000;

type PlatformRequestHandler = (
  arg0: Request,
  arg1: number,
  arg2: Headers,
  arg3: EntryContext,
  arg4: JSX.Element,
) => Response | Promise<Response>;

async function handleCfRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  jsx: JSX.Element,
) {
  const body = await ReactDOM.renderToReadableStream(jsx, {
    signal: request.signal,
    onError(error: unknown) {
      // Log streaming rendering errors from inside the shell
      console.error(error);
      responseStatusCode = 500;
    },
  });

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {

  const jsx = (
      <RemixServer context={remixContext} url={request.url} />
  );

  const requestHandler: PlatformRequestHandler = handleCfRequest;

  return requestHandler(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext,
    jsx,
  );
}
