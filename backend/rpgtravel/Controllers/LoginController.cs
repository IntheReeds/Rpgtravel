using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace rpgtravel.Controllers
{
   
    [ApiController]
    [Route("[controller]")]
    public class AuthController : ControllerBase
    {
         private readonly ILogger<AuthController> _logger;

         public AuthController(ILogger<AuthController> logger)
        {
            _logger = logger;
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            
             _logger.LogInformation($"Login attempt by user: {request.Username}");
            

            if (await IsValidUser(request.Username, request.Password))
            {
                var sessionId = Guid.NewGuid().ToString();
                
                Response.Cookies.Append("sessionId", sessionId, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict
                });

                // Optionally store sessionId → user mapping in DB or memory
                return Ok();
            }

            return Unauthorized("Invalid credentials");
        }



        private async Task<bool> IsValidUser(string username, string password)
        {
           

            string connectionString = "Server=localhost;Port=8888;Database=travelrpgDB;User Id=postgres;Password=123;";
            Console.WriteLine($"Connecting to DB with: {connectionString}");
            await using NpgsqlDataSource dataSource = NpgsqlDataSource.Create(connectionString);


            var query = "SELECT COUNT(*) FROM users WHERE username = @u AND password = @p";

            await using var connection = await dataSource.OpenConnectionAsync();
            NpgsqlCommand cmd = new(query, connection);
            cmd.Parameters.AddWithValue("u", username);
            cmd.Parameters.AddWithValue("p", password); // 🔐 Hash in production

            var result = await cmd.ExecuteScalarAsync();

            return Convert.ToInt32(result) > 0;

            // Example only: replace with secure database check



            
            //return username == "admin" && password == "1234";
        }
}

}