import type { EntryContext } from '@remix-run/server-runtime';
import { RemixServer } from '@remix-run/react';
import isbot from 'isbot';
import  { createReadableStreamFromReadable } from '@remix-run/node';
import { PassThrough} from 'stream';

import ReactDOM from 'react-dom/server';


const ABORT_DELAY = 5000;

type PlatformRequestHandler = (
  arg0: Request,
  arg1: number,
  arg2: Headers,
  arg3: EntryContext,
  arg4: JSX.Element,
) => Response | Promise<Response>;

async function handleNodeRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  jsx: JSX.Element,
): Promise<Response> {
  let callbackName = isbot(request.headers.get('user-agent'))
    ? 'onAllReady'
    : 'onShellReady';

  return new Promise((resolve, reject) => {
    let didError = false;

    let { pipe, abort } = ReactDOM.renderToPipeableStream(jsx, {
      [callbackName]: async () => {

        const body = new PassThrough();
        const stream = createReadableStreamFromReadable(body);
        responseHeaders.set('Content-Type', 'text/html');

        resolve(
          new Response(stream, {
            headers: responseHeaders,
            status: didError ? 500 : responseStatusCode,
          }),
        );
        pipe(body);
      },
      onShellError(error: unknown) {
        reject(error);
      },
      onError(error: unknown) {
        didError = true;

        console.error(error);
      },
    });

    setTimeout(abort, ABORT_DELAY);
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

  const requestHandler: PlatformRequestHandler = handleNodeRequest;

  return requestHandler(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext,
    jsx,
  );
}
