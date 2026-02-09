import { createLogger } from '@eventflow/common';

const logger = createLogger('email-sender');

export class EmailSender {
  async send(to: string, subject: string, body: string): Promise<void> {
    logger.info({ to, subject }, 'Sending email (simulated)');
    
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    logger.info({ to, subject }, 'Email sent successfully (simulated)');
  }
}