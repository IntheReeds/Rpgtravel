using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace rpgtravel.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ObjectInstanceController : Controller
    {
        private readonly ILogger<ObjectInstanceController> _logger;

         public ObjectInstanceController(ILogger<ObjectInstanceController> logger)
        {
            _logger = logger;
        }

        [HttpPost("create")]
        public async Task<IActionResult> AddObjectInstance([FromBody] ObjectInstance newInstance)
        {
            string connectionString = "Server=localhost;Port=8888;Database=travelrpgDB;User Id=postgres;Password=123;";
            

            await using NpgsqlDataSource dataSource = NpgsqlDataSource.Create(connectionString);
            
            
            string insertCommandText = @"
                INSERT INTO object_instances (expedition_id, template_id, quantity, modifier, notes, cycle_number)
                VALUES (@expedition_id, @template_id, @quantity, @modifier, @notes, @cycle_number)";
            
            Console.WriteLine($"modifier: {newInstance.modifier}");
            Console.WriteLine($"quantity: {newInstance.quantity}");

            try
            {
                await using var connection = await dataSource.OpenConnectionAsync();
                await using var transaction = await connection.BeginTransactionAsync();


                await using NpgsqlCommand cmd = new(insertCommandText, connection, transaction);
                cmd.Parameters.AddWithValue("expedition_id", newInstance.expedition_id);
                cmd.Parameters.AddWithValue("template_id", newInstance.template_id);
                cmd.Parameters.AddWithValue("quantity", newInstance.quantity);
                cmd.Parameters.AddWithValue("modifier", newInstance.modifier); 
                cmd.Parameters.AddWithValue("notes", newInstance.notes); 
                cmd.Parameters.AddWithValue("cycle_number", newInstance.cycle_number); 

                
                //_logger.LogInformation($"Command: {cmd.CommandText}");
                await cmd.ExecuteNonQueryAsync();
                await transaction.CommitAsync();

                await using (var transaction2 = await connection.BeginTransactionAsync())
                {
            
                    string objectTypeCommand = @"
                    INSERT INTO active_supplies (template_id, expedition_id, quantity, type)
                    SELECT @template_id, @expedition_id, @quantity, type::text::ration_type
                    FROM object_templates
                    WHERE id = @template_id
                        AND type IN ('land_supply', 'naval_supply')
                    ON CONFLICT (template_id, expedition_id) DO UPDATE
                    SET quantity = active_supplies.quantity + EXCLUDED.quantity
                    ";
                    await using NpgsqlCommand cmd2 = new (objectTypeCommand, connection, transaction2);
                    cmd2.Parameters.AddWithValue("template_id", newInstance.template_id);
                    cmd2.Parameters.AddWithValue("expedition_id", newInstance.expedition_id);
                    cmd2.Parameters.AddWithValue("quantity", newInstance.quantity);
                    await cmd2.ExecuteNonQueryAsync();
                    
                    await transaction2.CommitAsync();

    

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
        [Route("get")]
        public async Task<IActionResult> GetObjectInstances(int expedition_id, string? passedObjectTypeS)
        {
            bool applyTypeFilter = true;
            string[] passedObjectType = {};

            _logger.LogInformation($"Command: {passedObjectTypeS}");
            if (passedObjectTypeS == null)
            {
                applyTypeFilter = false;
            }
            else
            {
                passedObjectType = passedObjectTypeS
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            }

            


            var objects = new List<ObjectInstance>();
            
            string connectionString = "Server=localhost;Port=8888;Database=travelrpgDB;User Id=postgres;Password=123;";
           
            string getText = @$"SELECT 
                                oi.id AS instance_id,
                                oi.expedition_id,
                                oi.template_id,
                                oi.quantity,
                                oi.modifier,
                                oi.notes,
                                ot.name AS template_name,
                                ot.gc,
                                ot.weight,
                                ot.type::object_type,
                                (ot.gc * oi.modifier * oi.quantity) AS total_cost
                            FROM 
                                object_instances oi
                            JOIN 
                                object_templates ot ON oi.template_id = ot.id
                            WHERE 
                                oi.expedition_id = @expedition_id
                            AND
                                (@applyTypeFilter = FALSE OR ot.type::text = ANY(@passedObjectType))" ;

            await using NpgsqlDataSource dataSource = NpgsqlDataSource.Create(connectionString);
            await using var connection = await dataSource.OpenConnectionAsync();


            
            var command = new NpgsqlCommand(getText, connection);

            command.Parameters.AddWithValue("expedition_id", expedition_id);
            command.Parameters.AddWithValue("passedObjectType", passedObjectType);
            command.Parameters.AddWithValue("applyTypeFilter", applyTypeFilter);

            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                objects.Add(new ObjectInstance
                {
                    id = reader.GetInt32(0),
                    expedition_id = reader.GetInt32(1),
                    template_id = reader.GetInt32(2),
                    quantity = reader.GetInt32(3),
                    modifier = reader.GetDecimal(4),
                    notes = reader.GetString(5),
                    template_name = reader.GetString(6),
                    gc = reader.GetDecimal(7),
                    weight = reader.GetDecimal(8),
                    object_type = reader.GetString(9),
                    total_GC = reader.GetDecimal(10),
                });
                
            }

            return Ok(objects);
        }

    }

}