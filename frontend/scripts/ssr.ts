import { createServer } from 'node:net';
import { join } from 'node:path';
import { cwd } from 'node:process';
import React from 'react';
import { renderToString } from 'react-dom/server';

const pipePath = '/tmp/bun_notos_in';

const server = createServer((socket) => {
  console.log('Client connected.');

  socket.on('data', async (buffer: Buffer) => {
    const data = JSON.parse(buffer.toString());
    const target = join(cwd(), `frontend/views/dist/${data.target}.js`);
    const props = data.props;
    const { default: page } = await import(target);
    const hydrated = renderToString(React.createElement(page, props));

    console.log(hydrated);

    socket.write(hydrated);
  });

  socket.on('end', () => {
    console.log('Client disconnected.');
  });

  socket.on('error', (err: Error) => {
    console.error('Socket error:', err);
  });
});

server.listen(pipePath, () => {
  console.log(`Server is listening on ${pipePath}`);
});

server.on('error', (err: Error) => {
  console.error('Server error:', err);
});
