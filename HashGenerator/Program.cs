using BCrypt.Net;

var hash = BCrypt.Net.BCrypt.HashPassword("Admin@1234", 12);
Console.WriteLine(hash);