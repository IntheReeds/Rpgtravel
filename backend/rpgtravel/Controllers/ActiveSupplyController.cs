using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace rpgtravel.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ActiveSupplyController : Controller
    {
        private readonly ILogger<ActiveSupplyController> _logger;

         public ActiveSupplyController(ILogger<ActiveSupplyController> logger)
        {
            _logger = logger;
        }

        [HttpPost("Insert")]
        public async Task<IActionResult> AddActiveSupply([FromBody] ActiveSupply newTemplate)
        {

            string connectionString = "Server=localhost;Port=8888;Database=travelrpgDB;User Id=postgres;Password=123;";
            Console.WriteLine($"Connecting to DB with: {connectionString}");
            

            await using NpgsqlDataSource dataSource = NpgsqlDataSource.Create(connectionString);
            
            
              string insertCommandText = @"
                UPDATE active_supplies
                SET quantity = quantity + @quantity
                WHERE template_id = @template_id
                AND expedition_id = @expedition_id";

            try
            {
                await using var connection = await dataSource.OpenConnectionAsync();
                await using var transaction = await connection.BeginTransactionAsync();


                await using NpgsqlCommand cmd = new(insertCommandText, connection, transaction);
                cmd.Parameters.AddWithValue("quantity", newTemplate.quantity);
                cmd.Parameters.AddWithValue("template_id", newTemplate.template_id);
                cmd.Parameters.AddWithValue("expedition_id", newTemplate.expedition_id);

                //_logger.LogInformation($"Command: {cmd.CommandText}");
                await cmd.ExecuteNonQueryAsync();
                await transaction.CommitAsync();
            }
            catch (NpgsqlException ex)
            {
                _logger.LogError(ex, "An error occurred while executing the query.");
                return UnprocessableEntity("An error occurred while executing the query.");
            }
            finally
            {
                // Dispose of the data source
                dataSource.Dispose();
            }
            return Ok();
        }

        [HttpGet]
        [Route("get")]
        public async Task<IActionResult> GetActiveSupply(int expedition_id)
        {

            var supplies = new List<ActiveSupply>();
            
            string connectionString = "Server=localhost;Port=8888;Database=travelrpgDB;User Id=postgres;Password=123;";
           
            string getSupplies = @$"SELECT 
                                        active_supplies.*, 
                                        object_templates.name
                                    FROM active_supplies
                                    JOIN object_templates ON active_supplies.template_id = object_templates.id
                                    WHERE active_supplies.expedition_id = @expedition_id;
                                    ";

            await using NpgsqlDataSource dataSource = NpgsqlDataSource.Create(connectionString);
            await using var connection = await dataSource.OpenConnectionAsync();


            
            var command = new NpgsqlCommand(getSupplies, connection);

            command.Parameters.AddWithValue("expedition_id", expedition_id);

            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                supplies.Add(new ActiveSupply
                {
                    template_id = reader.GetInt32(0),
                    expedition_id = reader.GetInt32(1),
                    quantity = reader.GetInt32(2),
                    ration_type = reader.GetString(3),
                    name = reader.GetString(4),
                });
                
            }

            return Ok(supplies);
        }

    }
    
}