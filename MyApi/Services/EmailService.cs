using Microsoft.Extensions.Configuration;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Options;
namespace MyApi.Services;
public sealed class EmailOptions
{
    public string FromEmail { get; init; } = default!;
    public string FromName  { get; init; } = default!;
    public SmtpOptions Smtp { get; init; } = new();
    public sealed class SmtpOptions
    {
        public string Host { get; init; } = "smtp-relay.brevo.com";
        public int    Port { get; init; } = 587;
        public string User { get; init; } = default!;
        public string Password { get; init; } = default!;
    }
}
public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string htmlBody);
}

public sealed class SmtpEmailService(IOptions<EmailOptions> opt) : IEmailService
{
    private readonly EmailOptions _opt = opt.Value;

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        var msg = new MimeMessage();
        msg.From.Add(new MailboxAddress(_opt.FromName, _opt.FromEmail));
        msg.To.Add(MailboxAddress.Parse(toEmail));
        msg.Subject = subject;
        msg.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(_opt.Smtp.Host, _opt.Smtp.Port, SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(_opt.Smtp.User, _opt.Smtp.Password);
        await smtp.SendAsync(msg);
        await smtp.DisconnectAsync(true);
    }
}