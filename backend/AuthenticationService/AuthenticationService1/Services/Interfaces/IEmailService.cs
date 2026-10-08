namespace AuthenticationService1.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string toEmail, string resetToken);
        Task SendWelcomeEmailAsync(string toEmail);
    }
}