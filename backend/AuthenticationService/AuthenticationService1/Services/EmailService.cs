using AuthenticationService1.Services.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace AuthenticationService1.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string resetToken)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("UniLife Hub", _configuration["Email:From"]));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = "Réinitialisation de votre mot de passe";

            var resetLink = $"{_configuration["Frontend:Url"]}/reset-password?token={resetToken}";

            message.Body = new TextPart("html")
            {
                Text = $@"
                    <h2>Réinitialisation de mot de passe</h2>
                    <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                    <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
                    <a href='{resetLink}'>Réinitialiser mon mot de passe</a>
                    <p>Ce lien est valide pendant 1 heure.</p>
                    <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
                "
            };

            await SendEmailAsync(message);
        }

        public async Task SendWelcomeEmailAsync(string toEmail)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("UniLife Hub", _configuration["Email:From"]));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = "Bienvenue sur UniLife Hub !";

            message.Body = new TextPart("html")
            {
                Text = @"
                    <h2>Bienvenue sur UniLife Hub !</h2>
                    <p>Votre compte a été créé avec succès.</p>
                    <p>Vous pouvez maintenant vous connecter et profiter de toutes nos fonctionnalités.</p>
                "
            };

            await SendEmailAsync(message);
        }

        private async Task SendEmailAsync(MimeMessage message)
        {
            using var client = new SmtpClient();

            await client.ConnectAsync(
                _configuration["Email:SmtpServer"],
                int.Parse(_configuration["Email:Port"]),
                SecureSocketOptions.StartTls
            );

            await client.AuthenticateAsync(
                _configuration["Email:Username"],
                _configuration["Email:Password"]
            );

            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}