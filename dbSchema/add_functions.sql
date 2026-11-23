  CREATE OR REPLACE FUNCTION apply_cycle_personnel_cost(
    p_expedition_id INTEGER,
    p_cycle_days INTEGER
) RETURNS NUMERIC AS $$
DECLARE
    cycle_cost NUMERIC := 0;
BEGIN
    SELECT SUM(ot.gc * oi.modifier * oi.quantity * p_cycle_days)
    INTO cycle_cost
    FROM object_instances oi
    JOIN object_templates ot ON oi.template_id = ot.id
    WHERE 
        oi.expedition_id = p_expedition_id
        AND ot.type IN ('actor', 'npc');

    cycle_cost := COALESCE(cycle_cost, 0);

    -- Apply to expedition total
    UPDATE expeditions
    SET total_gold_cost = total_gold_cost + cycle_cost
    WHERE id = p_expedition_id;

    RETURN cycle_cost;
END;
$$ LANGUAGE plpgsql;




CREATE OR REPLACE FUNCTION apply_supply_deduction(
    p_expedition_id INTEGER,
    p_template_id INTEGER
) RETURNS INT AS $$
DECLARE
    used_quantity INTEGER;
BEGIN
    -- Get the total quantity of this template used in the expedition
    SELECT SUM(quantity) 
    INTO used_quantity
    FROM object_instance_details
    WHERE expedition_id = p_expedition_id
	AND type IN ('npc', 'actor');
      

    -- If no instances found, do nothing
    IF used_quantity IS NULL THEN
        RETURN 0;
    END IF;

    -- Deduct that quantity from the active supply
    UPDATE active_supplies
    SET quantity = GREATEST(0, quantity - used_quantity)
    WHERE expedition_id = p_expedition_id
      AND template_id = p_template_id;

	RETURN used_quantity;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION generate_expedition_log(
    p_expedition_id INTEGER,
    p_stage_name TEXT,
    p_cycle_days INTEGER,
    p_active_supply_template_id INTEGER,
    p_cycle_number INTEGER
) RETURNS VOID AS $$
DECLARE
    v_log TEXT := '';
    v_current_cycle INTEGER;
    v_active_supply_name TEXT;
    record RECORD;
BEGIN
    -- Get current cycle number from expeditions table
    SELECT current_cycle_number INTO v_current_cycle
    FROM expeditions
    WHERE id = p_expedition_id;

    -- Get name of active supply
    SELECT name INTO v_active_supply_name
    FROM object_templates
    WHERE id = p_active_supply_template_id;

    -- Header with dynamic supply name
    v_log := FORMAT('%s: %s Days Used %s
===============
%s											supply_hub_name
', p_stage_name, p_cycle_days, v_active_supply_name, p_stage_name);

    -- Personnel Costs
    v_log := v_log || 'Personnel Costs: //can be used in multiple cycles\n';

    FOR record IN
        SELECT ot.name, oi.quantity, ot.gc, (oi.quantity * ot.gc * oi.modifier * p_cycle_days) AS total
        FROM object_instances oi
        JOIN object_templates ot ON ot.id = oi.template_id
        WHERE oi.expedition_id = p_expedition_id
          AND ot.type IN ('npc', 'actor')
    LOOP
        v_log := v_log || FORMAT('\t%s: %s %sgc/d | %sgc\n',
                                  record.name, record.quantity, record.gc, record.total);
    END LOOP;

    -- Ration Purchases (only from this cycle)
    v_log := v_log || 'Ration Purchases: //only one cycle\n';

    FOR record IN
        SELECT ot.name, oi.quantity, ot.gc
        FROM object_instances oi
        JOIN object_templates ot ON ot.id = oi.template_id
        WHERE oi.expedition_id = p_expedition_id
          AND oi.cycle_number = p_cycle_number
          AND ot.type IN ('land_supply', 'naval_supply')
    LOOP
        v_log := v_log || FORMAT('\t%s: %s %sgc\n',
                                  record.name, record.quantity, record.gc);
    END LOOP;

    -- Other Purchases (only from this cycle)
    v_log := v_log || 'Other Purchases: //only one cycle\n';

    FOR record IN
        SELECT ot.name, oi.quantity, ot.gc
        FROM object_instances oi
        JOIN object_templates ot ON ot.id = oi.template_id
        WHERE oi.expedition_id = p_expedition_id
          AND oi.cycle_number = p_cycle_number
          AND ot.type = 'other'
    LOOP
        v_log := v_log || FORMAT('\t%s: %s %sgc\n',
                                  record.name, record.quantity, record.gc);
    END LOOP;

    -- Total Rations (all time)
    v_log := v_log || 'Total Rations: \n';

    FOR record IN
        SELECT ot.name, SUM(oi.quantity) AS quantity
        FROM object_instances oi
        JOIN object_templates ot ON ot.id = oi.template_id
        WHERE oi.expedition_id = p_expedition_id
          AND ot.type IN ('land_supply', 'naval_supply')
        GROUP BY ot.name
    LOOP
        v_log := v_log || FORMAT('\t%s %s\n', record.name, record.quantity);
    END LOOP;

    -- Insert final log into expedition_logs
    INSERT INTO expedition_logs (expedition_id, stage_name, cycle_days, log_text, cycle_number)
    VALUES (p_expedition_id, p_stage_name, p_cycle_days, v_log, v_current_cycle);
END;
$$ LANGUAGE plpgsql;