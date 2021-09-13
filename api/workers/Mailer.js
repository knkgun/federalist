const HttpClient = require('../utils/httpClient');

const { mailer } = require('../../config');

class Mailer {
  constructor({ host, password, username } = mailer) {
    this.httpClient = new HttpClient(host);
    this.password = password;
    this.username = username;
  }

  send({
    html, subject, to, cc, bcc,
  }) {
    return this.httpClient.request({
      method: 'POST',
      url: '/send',
      auth: {
        password: this.password,
        username: this.username,
      },
      data: {
        to, subject, html, cc, bcc,
      },
    });
  }
}

module.exports = Mailer;
