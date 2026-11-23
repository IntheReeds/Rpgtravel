using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace rpgtravel.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ExpeditionController : Controller
    {
        private readonly ILogger<ExpeditionController> _logger;

         public ExpeditionController(ILogger<ExpeditionController> logger)
        {
            _logger = logger;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateExpedition([FromBody] string name)
        {

            string connectionString = "Server=localhost;Port=8888;Database=travelrpgDB;User Id=postgres;Password=123;";
            Console.WriteLine($"Connecting to DB with: {connectionString}");

            await using NpgsqlDataSource dataSource = NpgsqlDataSource.Create(connectionString);
            
            
            string insertCommandText = @"
                INSERT INTO expeditions (name)
                VALUES (@name)";



            try
            {
                await using var connection = await dataSource.OpenConnectionAsync();
                await using var transaction = await connection.BeginTransactionAsync();


                await using NpgsqlCommand cmd = new(insertCommandText, connection, transaction);
                cmd.Parameters.AddWithValue("name", name);

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
        [Route("getExpeditions")]
        public async Task<IActionResult> GetExpeditions()
        {
            var expeditions = new List<Expedition>();
            
            string connectionString = "Server=localhost;Port=8888;Database=travelrpgDB;User Id=postgres;Password=123;";
            string getText = $@"SELECT id, name, total_gold_cost, current_cycle_number FROM expeditions
                                ORDER BY created_at ASC";

            await using NpgsqlDataSource dataSource = NpgsqlDataSource.Create(connectionString);
            await using var connection = await dataSource.OpenConnectionAsync();
           
            var command = new NpgsqlCommand(getText, connection);
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                expeditions.Add(new Expedition
                {
                    id = reader.GetInt32(0),
                    name = reader.GetString(1),
                    total_gold_cost = reader.GetDecimal(2),
                    current_cycle_number = reader.GetInt32(3),
        
                });
                
            }

            return Ok(expeditions);
        }
        [HttpPost]
        [Route("advancecycle")]
        public async Task<IActionResult> advanceCycle(int expedition_id, int cycle_days, int template_id, string stage_name)
        {
            string connectionString = "Server=localhost;Port=8888;Database=travelrpgDB;User Id=postgres;Password=123;";
            Console.WriteLine($"Connecting to DB with: {connectionString}");

            await using NpgsqlDataSource dataSource = NpgsqlDataSource.Create(connectionString);
            
            
            string insertCommandText = @"SELECT apply_cycle_personnel_cost($1, $2),
                                         apply_supply_deduction($3, $4);";
                                        

            try
            {
                await using var connection = await dataSource.OpenConnectionAsync();
                await using var transaction = await connection.BeginTransactionAsync();


                await using NpgsqlCommand cmd = new(insertCommandText, connection, transaction);
                cmd.Parameters.AddWithValue(expedition_id);
                cmd.Parameters.AddWithValue(cycle_days);
                cmd.Parameters.AddWithValue(expedition_id);
                cmd.Parameters.AddWithValue(template_id);
    
                //_logger.LogInformation($"Command: {cmd.CommandText}");    
                var result = await cmd.ExecuteScalarAsync();
            

                string generateLogText = @"SELECT generate_expedition_log($1, $2, $3, $4, 
                                         (select current_cycle_number from expeditions where id = $5));";


                await using var cmdLog = new NpgsqlCommand(generateLogText, connection, transaction);

                cmdLog.Parameters.AddWithValue(expedition_id);
                cmdLog.Parameters.AddWithValue(stage_name);
                cmdLog.Parameters.AddWithValue(cycle_days);
                cmdLog.Parameters.AddWithValue(template_id);
                cmdLog.Parameters.AddWithValue(expedition_id);


                await cmdLog.ExecuteScalarAsync();



                string insertCommandText3 = @"UPDATE expeditions
                                         SET current_cycle_number = current_cycle_number + 1
                                         Where id = @expedition_id";

                await using var cmd3 = new NpgsqlCommand(insertCommandText3, connection, transaction);
                cmd3.Parameters.AddWithValue("expedition_id", expedition_id);
                await cmd3.ExecuteNonQueryAsync();
                


                
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
        [Route("getLogs")]
        public async Task<IActionResult> GetLogs(int expedition_id)
        {
            var expeditionLogs = new List<ExpeditionLog>();
            
            string connectionString = "Server=localhost;Port=8888;Database=travelrpgDB;User Id=postgres;Password=123;";
            string getText = $@"SELECT id, expedition_id, stage_name, cycle_days, log_text FROM expedition_logs
                                WHERE expedition_id = @expedition_id
                                ORDER BY created_at ASC";

            await using NpgsqlDataSource dataSource = NpgsqlDataSource.Create(connectionString);
            await using var connection = await dataSource.OpenConnectionAsync();
           
            var command = new NpgsqlCommand(getText, connection);
            command.Parameters.AddWithValue("expedition_id", expedition_id);
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                expeditionLogs.Add(new ExpeditionLog
                {
                    id = reader.GetInt32(0),
                    expedition_id = reader.GetInt32(1),
                    stage_name = reader.GetString(2),
                    cycle_days = reader.GetInt32(3),
                    log_text = reader.GetString(4),
        
                });
                
            }

            return Ok(expeditionLogs);
        }
        

    }
    

}