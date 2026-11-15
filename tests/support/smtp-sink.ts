import { SMTPServer } from 'smtp-server';

export interface SmtpMessage {
  readonly from: string;
  readonly to: readonly string[];
  readonly raw: string;
}

export interface SmtpSink {
  readonly port: number;
  readonly messages: SmtpMessage[];
  reset(): void;
  close(): Promise<void>;
}

export async function startSmtpSink(): Promise<SmtpSink> {
  const messages: SmtpMessage[] = [];

  const server = new SMTPServer({
    authOptional: true,
    disabledCommands: ['AUTH', 'STARTTLS'],
    hideSTARTTLS: true,
    logger: false,
    onData(stream, session, callback) {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (error) => callback(error));
      stream.on('end', () => {
        messages.push({
          from: session.envelope.mailFrom ? session.envelope.mailFrom.address : '',
          to: session.envelope.rcptTo.map((entry) => entry.address),
          raw: Buffer.concat(chunks).toString('utf8'),
        });
        callback();
      });
    },
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.server.address();
  if (!address || typeof address === 'string') throw new Error('SMTP sink did not bind a port');

  return {
    port: address.port,
    messages,
    reset: () => {
      messages.length = 0;
    },
    close: async () => {
      await new Promise<void>((resolve) => {
        const timer = setTimeout(() => {
          const netServer = server.server as unknown as { closeAllConnections?: () => void };
          netServer.closeAllConnections?.();
          resolve();
        }, 1000);
        server.close(() => {
          clearTimeout(timer);
          resolve();
        });
      });
    },
  };
}
