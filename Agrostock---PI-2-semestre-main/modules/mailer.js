// mailer.js
const path = require('path');
const nodemailer = require('nodemailer');

async function setupTransport() {
  // Importando o nodemailer-express-handlebars dinamicamente
  const { default: hbs } = await import('nodemailer-express-handlebars');

  const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'agrostock01@gmail.com', // Seu email
        pass: 'rcfe herx bobl attt', // Senha de aplicativo do Gmail
    },
});


  // Configuração do Handlebars para templates
  transport.use('compile', hbs({
    viewEngine: {
      extName: '.hbs',
      partialsDir: path.resolve('./mail'),  // Ajuste conforme seu diretório de templates
      defaultLayout: false,
    },
    viewPath: path.resolve('./mail'), // Ajuste conforme o caminho dos seus templates
    extName: '.hbs',
  }));

  return transport;
}

async function sendEmail({ to, from, subject, template, context }) {
    const transport = await setupTransport();
  
    await transport.sendMail({
      to,
      from,
      subject,
      template,
      context,
    });
  }

// Exportando a função corretamente
module.exports = sendEmail;
