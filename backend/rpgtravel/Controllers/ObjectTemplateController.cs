using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace rpgtravel.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ObjectTemplateController : Controller
    {
        private readonly ILogger<ObjectTemplateController> _logger;

         public ObjectTemplateController(ILogger<ObjectTemplateController> logger)
        {
            _logger = logger;
        }

        [HttpPost("Insert")]
        public async Task<IActionResult> AddObjectTemplate([FromBody] ObjectTemplate newTemplate)
        {

            string connectionString = "Server=localhost;Port=8888;Database=travelrpgDB;User Id=postgres;Password=123;";
            Console.WriteLine($"Connecting to DB with: {connectionString}");
            Console.WriteLine($"name: {newTemplate.name}");
            Console.WriteLine($"gc: {newTemplate.gc}");
            Console.WriteLine($"weight: {newTemplate.weight}");
            Console.WriteLine($"type: {newTemplate.object_type}");

            await using NpgsqlDataSource dataSource = NpgsqlDataSource.Create(connectionString);
            
            
              string insertCommandText = @"
                INSERT INTO object_templates (name, gc, weight, type)
                VALUES (@name, @gc, @weight, @type::object_type)";



            try
            {
                await using var connection = await dataSource.OpenConnectionAsync();
                await using var transaction = await connection.BeginTransactionAsync();


                await using NpgsqlCommand cmd = new(insertCommandText, connection, transaction);
                cmd.Parameters.AddWithValue("name", newTemplate.name);
                cmd.Parameters.AddWithValue("gc", newTemplate.gc);
                cmd.Parameters.AddWithValue("weight", newTemplate.weight);
                cmd.Parameters.AddWithValue("type", newTemplate.object_type); // Enum can be string or mapped
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

        [HttpDelete("DeleteObjectTemplate/{id}")]
        public async Task<IActionResult> DeleteObjectTemplate(long id)
        {

            string connectionString = "Server=localhost;Port=8888;Database=travelrpgDB;User Id=postgres;Password=123;";
            Console.WriteLine($"Connecting to DB with: {connectionString}");
            await using NpgsqlDataSource dataSource = NpgsqlDataSource.Create(connectionString);
            
            
              string deleteCommandText = @"
                DELETE FROM object_templates WHERE id = @id";



            try
            {
                await using var connection = await dataSource.OpenConnectionAsync();
                await using var transaction = await connection.BeginTransactionAsync();


                await using NpgsqlCommand cmd = new(deleteCommandText, connection, transaction);
                cmd.Parameters.AddWithValue("id", id);
                
                //_logger.LogInformation($"Command: {cmd.CommandText}");
                int rowsAffected = await cmd.ExecuteNonQueryAsync();
                await transaction.CommitAsync();

                if (rowsAffected == 0)
                {
                    return NotFound("No matching object template found.");
                }
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



        [HttpPost("EditObjectTemplate")]
        public async Task<IActionResult> EditObjectTemplate([FromBody] ObjectTemplate newTemplate)
        {

            string connectionString = "Server=localhost;Port=8888;Database=travelrpgDB;User Id=postgres;Password=123;";
            Console.WriteLine($"Connecting to DB with: {connectionString}");
            await using NpgsqlDataSource dataSource = NpgsqlDataSource.Create(connectionString);
            
            
              string updateCommandText = @"
                UPDATE object_templates
                SET name = @name,
                    gc = @gc,
                    weight = @weight,
                    type = @type::object_type
                WHERE id = @id";



            try
            {
                await using var connection = await dataSource.OpenConnectionAsync();
                await using var transaction = await connection.BeginTransactionAsync();


                await using NpgsqlCommand cmd = new(updateCommandText, connection, transaction);
                if(newTemplate.id != null)
                {
                    cmd.Parameters.AddWithValue("id", newTemplate.id);
                }
                
                cmd.Parameters.AddWithValue("name", newTemplate.name);
                cmd.Parameters.AddWithValue("gc", newTemplate.gc);
                cmd.Parameters.AddWithValue("weight", newTemplate.weight);
                cmd.Parameters.AddWithValue("type", newTemplate.object_type); // Enum can be string or mapped
                //_logger.LogInformation($"Command: {cmd.CommandText}");
                int rowsAffected = await cmd.ExecuteNonQueryAsync();
                await transaction.CommitAsync();

                if (rowsAffected == 0)
                {
                    return NotFound("No object temlate found.");
                }
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
        [Route("getTemplates")]
        public async Task<IActionResult> GetTemplates()
        {
            var templates = new List<ObjectTemplate>();
            
            string connectionString = "Server=localhost;Port=8888;Database=travelrpgDB;User Id=postgres;Password=123;";
            string getText = $"SELECT * FROM object_templates";

            await using NpgsqlDataSource dataSource = NpgsqlDataSource.Create(connectionString);
            await using var connection = await dataSource.OpenConnectionAsync();
           
            var command = new NpgsqlCommand(getText, connection);
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                templates.Add(new ObjectTemplate
                {
                    id = reader.GetInt32(0),
                    name = reader.GetString(1),
                    gc = reader.GetDecimal(2),
                    weight = reader.GetDecimal(3),
                    object_type = reader.GetString(4)
                });
            }

            return Ok(templates);
        }

    }

}