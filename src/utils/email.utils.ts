import sgMail from "@sendgrid/mail";
import { Customer } from "../entities/Customer";

export type EmailMessage = {
    to: string;
    subject: string;
    text: string;
    html?: string;
};

const getConfig = () => ({
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL,
    fromName: process.env.SENDGRID_FROM_NAME || "Clientes BDB",
    replyTo: process.env.SENDGRID_REPLY_TO,
});

export const isEmailEnabled = () => {
    const { apiKey, fromEmail } = getConfig();
    return Boolean(apiKey && fromEmail);
};

const escapeHtml = (value: string) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const buildField = (label: string, value: string) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
        <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;margin-bottom:4px;font-weight:600;">${label}</div>
        <div style="font-size:15px;line-height:1.5;color:#111827;font-weight:500;word-break:break-word;">${value}</div>
      </td>
    </tr>`;

const buildCustomerList = (customer: Customer) => `
    <table style="width:100%;border-collapse:collapse;margin:0;padding:0;" cellpadding="0" cellspacing="0">
      ${buildField(
        "Tipo y Número de Documento",
        `${escapeHtml(customer.typeId)} - ${escapeHtml(customer.identification)}`
    )}
      ${buildField("Correo Electrónico", escapeHtml(customer.email))}
      ${buildField("Edad", escapeHtml(String(customer.age)))}
      ${buildField("Producto", escapeHtml(customer.product))}
    </table>`;

const buildHeader = () => `
    <div style="background:#ffffff;padding:20px 28px;">
      <h2 style="margin:0;font-size:20px;color:#1e40af;font-weight:700;letter-spacing:-0.02em;">Banco de Bogotá</h2>
      <p style="margin:4px 0 0;font-size:13px;color:#64748b;font-weight:500;">Sistema de Gestión de Clientes</p>
    </div>`;

const buildFooter = () => `
    <div style="margin-top:32px;padding-top:24px;border-top:2px solid #e5e7eb;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;color:#64748b;line-height:1.6;">
        Este es un correo automático generado por el Sistema de Gestión de Clientes del Banco de Bogotá.
      </p>
      <p style="margin:0;font-size:13px;color:#64748b;">
        Por favor no responda a este mensaje.
      </p>
    </div>`;

const buildCustomerCardHtml = (customer: Customer, subtitle: string) => {
    const name = escapeHtml(customer.name);
    const subtitleText = escapeHtml(subtitle);

    return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;background-color:#f1f5f9;">
    <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f1f5f9;padding:40px 20px;" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;">

            ${buildHeader()}

            <div style="background:#f8fafc;padding:24px 28px;border-bottom:1px solid #e2e8f0;">
              <div style="font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:#64748b;margin-bottom:10px;font-weight:600;">${subtitleText}</div>
              <h1 style="margin:0;font-size:24px;line-height:1.3;font-weight:700;color:#0f172a;">${name}</h1>
            </div>

            <div style="padding:28px;background:#ffffff;color:#0f172a;">
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#334155;">
                Le informamos que sus datos fueron registrados correctamente en la base de datos de clientes del Banco de Bogotá.
              </p>
              <h2 style="margin:0 0 20px;font-size:15px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.05em;">Información del Cliente</h2>
              ${buildCustomerList(customer)}
              ${buildFooter()}
            </div>

          </div>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
};

export class EmailService {
    async send(message: EmailMessage): Promise<void> {
        const { apiKey, fromEmail, fromName, replyTo } = getConfig();

        if (!apiKey || !fromEmail) {
            throw new Error(
                "Configura SENDGRID_API_KEY y SENDGRID_FROM_EMAIL para enviar correos."
            );
        }

        sgMail.setApiKey(apiKey);

        await sgMail.send({
            to: message.to,
            from: { email: fromEmail, name: fromName },
            ...(replyTo ? { replyTo } : {}),
            subject: message.subject,
            text: message.text,
            html: message.html,
        });
    }

    async sendCustomerCreated(customer: Customer): Promise<void> {
        const subject = "Registro exitoso en el Banco de Bogotá";
        const text = `Hola ${customer.name}, sus datos fueron registrados en la base de datos de clientes del Banco de Bogotá. Producto: ${customer.product}.`;
        const html = buildCustomerCardHtml(customer, "Nuevo cliente registrado");

        await this.send({ to: customer.email, subject, text, html });
    }
}

export const emailService = new EmailService();
