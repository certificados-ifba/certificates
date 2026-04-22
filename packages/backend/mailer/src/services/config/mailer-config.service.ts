import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'

export class MailerConfigService implements MailerOptionsFactory {
  createMailerOptions(): MailerOptions {
    const secure = String(process.env.MAILER_SECURE).toLowerCase() === 'true'
    const useTls = String(process.env.MAILER_TLS).toLowerCase() === 'true'

    return {
      transport: {
        host: process.env.MAILER_HOST,
        port: Number(process.env.MAILER_PORT),
        secure,
        ignoreTLS: !useTls,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASS
        }
      },
      defaults: {
        from: process.env.MAILER_FROM
      },
      preview: true,
      template: {
        dir: process.cwd() + '/src/template/',
        adapter: new HandlebarsAdapter(), // or new PugAdapter()
        options: {
          strict: true
        }
      }
    }
  }
}
