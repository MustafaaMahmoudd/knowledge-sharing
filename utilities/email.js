const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const pug = require('pug');

module.exports = class Email {
  constructor(user = '', information = '') {
    if (!user) {
      this.firstName = null;
    } else {
      this.to = user.email || ' ';
      this.firstName = user.name.split(' ')[0];
      this.information = information || ' ';
      this.from = 'knowledge-sharing-team';
    }
  }
  newTransporter() {
    if (process.env.NODE_ENV === 'development') {
      return nodemailer.createTransport({
        host: process.env.HOST_EMAIL,
        port: process.env.PORT_EMAIL,
        auth: {
          user: process.env.USER_NAME_EMAIL,
          pass: process.env.PASSWORD_EMAIL,
        },
      });
    }

    return nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }
  async sendConfirmationCode(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      firstName: this.firstName,
      code: this.information,
      subject,
    });

    //2)Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      html,
      subject,
      text: htmlToText.convert(html), // to convert html into string
    };
    await this.newTransporter().sendMail(mailOptions);
  }

  async sendArticles(req, subject, template, articles, emails) {
    let mailOptions;
    for (const el of articles) {
      el.user.photo = `${req.protocol}://${req.get('host')}/img/users/${
        el.user.photo
      }`;
    }
    // console.log(articles);
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      articles,
    });
    if (emails.length === 1) {
      mailOptions = {
        to: emails,
        from: this.from,
        subject,
        html,
        text: htmlToText.convert(html),
      };
      await this.newTransporter().sendMail(mailOptions);
    } else {
      let email;
      for (email of emails) {
        // Promise.all(emails.map(async (el) => {
        mailOptions = {
          to: email,
          from: this.from,
          html,
          subject,
          text: htmlToText.convert(html),
        };
        await this.newTransporter().sendMail(mailOptions);
        // }));
      }
    }
  }

  async sendResetToken(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      firstName: this.firstName,
      information: this.information,
      subject,
    });
    const mailOptions = {
      from: this.from,
      to: this.to,
      html,
      subject,
      text: htmlToText.convert(html), // to convert html into string
    };
    await this.newTransporter().sendMail(mailOptions);
  }
};
