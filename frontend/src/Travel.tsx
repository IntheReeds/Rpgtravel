import { useState, useEffect } from 'react'
import './Travel.css'
import './types/resturant'
import { Expedition, objectInsertion,  objectInstance, ActiveSupply, ExpeditionLog } from './types/resturant';
import { objectTemplate } from './types/resturant';
import Draggable from 'react-draggable';

//import RestaurantFinder from './findResturants'


function Travel() {
  
  
  const [stageName, setStageName] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCreateExpedition, setShowCreateExpedition] = useState(false);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);

  const [currentExpedition, setCurrentExpedition] = useState<Expedition>();

  const [newExpeditionName, setNewExpeditionName] = useState('');
  const [selectedExpedition, setSelectedExpedition] = useState<number>(0);

  const [insertionName, setInsertionName] = useState('');
  const [insertionGC, setInsertionGC] = useState('');
  const [insertionWeight, setInsertionWeight] = useState('');
  const [insertionObjectType, setInsertionObjectType] = useState('');

  const [insertionID, setInsertionID ] = useState<number>();
  const [insertionQuantity, setInsertionQuantity ] = useState('');
  const [insertionModifier, setInsertionModifier ] = useState('');

  const [activeTab, setActiveTab] = useState('');
  const [templates, setTemplates] = useState<objectTemplate[]>([]);

  const [instances, setInstances] = useState<objectInstance[]>([]);
  const [activeSupplyType, setActiveSupplyType] = useState<number>(0);
  const [cycleLength, setCycleLength] = useState<number>(1);
  const [activeSupplies, setActiveSupplies] = useState<ActiveSupply[]>([]);
  const [activeLogs, setActiveLogs] = useState<ExpeditionLog[]>([]);


  const [changedQuantity, setChangedQuantity] = useState<number>(0);

  const [addObjectField, setAddObjectField] = useState(false);
  const [addObjectFieldPlus, setAddObjectFieldPlus] = useState(true);

  const [addTemplateField, setAddTemplateField] = useState(false);
  const [addTemplateFieldPlus, setAddTemplateFieldPlus] = useState(true);

  const [currentDay, setCurrentDay] = useState<number>(0);
  const [currentCycle, setCurrentCycle] = useState<number>(0);

  const options: string[] = ["npc", "actor", "land_supply", "naval_supply", "other"];

  const [selectedValue, setSelectedValue] = useState('');
  const [showList, setShowList] = useState(false);
  const [totalGoldCost, setTotalGoldCost] = useState<number>(0);
  const [cycleNumbersLoading, setCycleNumbersLoading] = useState(true);

const filteredOptions = templates.filter((t) =>
  t.name.toLowerCase().includes(selectedValue.toLowerCase())
);

const filteredTemplates = templates.filter(t => t.object_type === 'other');

const filteredOptionsObject = filteredTemplates.filter((t) =>
  t.name.toLowerCase().includes(selectedValue.toLowerCase())
);

const handleSelect = (template: objectTemplate) => {
  setInsertionID(template.id);
  setSelectedValue(template.name);

  setShowList(false);
};

  const fetchExpeditions = async (): Promise<Expedition[]> => {


    try {
      const response = await fetch('http://localhost:5062/Expedition/getExpeditions');
      if (!response.ok) {
        throw new Error('Failed to fetch expeditions');
      }
      const data: Expedition[] = await response.json();
      setExpeditions(data);
      return data;
    } catch (error) {
      console.error('Error fetching expeditions:', error);
      return [];
    }
  };

  useEffect(() => {

  fetchExpeditions();
  }, []);

  useEffect(() => {
    if (selectedExpedition !== null) {
      //setCurrentExpedition(expeditions.find(expedition => expedition.id === selectedExpedition));
      //setCurrentCycle(currentExpedition.current_cycle_number);
      
      setDaysCycles();

      fetchSupplies();
      
      
      
    }
  }, [selectedExpedition]);

  const setDaysCycles = async() => {
    

    const logs = await fetchLogs();
    if(logs.length !== 0)
    {
      let total = 0;
      for (const key in logs) {
        if (logs.hasOwnProperty(key)) {
           
            total += logs[key].cycle_days;
        }
      }
      console.log("total:" + total);
      setCurrentDay(total);   
    }


  }
  

  const reset = async() => {
    setInstances([]);
    setActiveLogs([]);

  }
  const handleCreateExpeditionClick = async (name: string) => {

    //alert(name);
    try {
      //await new Promise(resolve => setTimeout(resolve, 500));
      const response = await fetch("http://localhost:5062/Expedition/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(name),
        credentials: "include"
      });

      if (response.ok) {
        //alert("Create Expedition Sucessfull");
        //await fetchTemplates();
        await fetchExpeditions();
      } else {
        alert(" failed");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Network error");
    } finally {
      fetchTemplates();
    }
  };

  const editActiveSupply = async () => {

    try {
      const response = await fetch(`http://localhost:5062/Expedition/changeActiveSupply?expedition_id=${selectedExpedition}&changedQuantity=${changedQuantity}&template_id=${activeSupplyType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
    });
      
      //const data = await response.json();
      
      
    } catch (err) {
      console.error('Failed to commit cycle', err);
    }
    finally
    {
      fetchSupplies();
    }
  };
  const commitCycle = async () => {
    
    if (activeSupplyType == 0) {
      console.warn("Invalid supply type selected. Aborting cycle commit.");
      return; // Stop function execution
    }
    try {
      const response = await fetch(`http://localhost:5062/Expedition/advanceCycle?expedition_id=${selectedExpedition}&cycle_days=${cycleLength}&template_id=${activeSupplyType}&stage_name="test"`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
    });
      
      //const data = await response.json();
      
      
    } catch (err) {
      console.error('Failed to commit cycle', err);
    }
    finally
    {
      fetchSupplies();
      setDaysCycles();
      const currentExpeditionArray = await fetchExpeditions();
      const filteredCurrentExpeditionArray = currentExpeditionArray.find(e => e.id === selectedExpedition);
      setTotalGoldCost(filteredCurrentExpeditionArray?.total_gold_cost?? 0);


      setCurrentCycle(currentCycle+1);
    }
  };


  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://localhost:5062/ObjectTemplate/getTemplates?');
      const data = await response.json();
      setTemplates(data);
      
    } catch (err) {
      console.error('Failed to fetch templates', err);
    }
  };
  const fetchInstances = async (types : string) => {
    
    try {
      const response = await fetch(`http://localhost:5062/ObjectInstance/get?expedition_id=${selectedExpedition}&passedObjectTypeS=${types}`);
      const data = await response.json();
      setInstances(data);

    } catch (err) {
      console.error('Failed to fetch templates', err);
    }
  };

  const fetchSupplies = async () => {
    
    try {
      const response = await fetch(`http://localhost:5062/ActiveSupply/get?expedition_id=${selectedExpedition}`);
      const data = await response.json();
      setActiveSupplies(data);

    } catch (err) {
      console.error('Failed to fetch templates', err);
    }
  };
  const fetchLogs = async (): Promise<ExpeditionLog[]> => {
    
    try {
      const response = await fetch(`http://localhost:5062/Expedition/getLogs?expedition_id=${selectedExpedition}`);
      const data = await response.json();
      setActiveLogs(data);
      return data;

    } catch (err) {
      console.error('Failed to fetch Logs', err);
       return [];
    }
    
  };
  
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    
    if (tab === 'templates') {
      fetchTemplates(); // Fetch only when Templates tab is clicked
    }
    if (tab === 'crew')
    {
      fetchInstances('npc')
    }
    if (tab === 'objects')
    {
      fetchInstances('other');
    }
    if(tab === 'manifest')
    {
      fetchLogs();
    }
  };

  function Counter() {
    const [count, setCount] = useState(0);
  }


  const insertObjectTemplate = async () => {

    if(insertionName === "" || insertionGC === "" || insertionWeight === "" || insertionObjectType === "")
    {
      alert("Please enter all values");
      return;
     
    }
    

    //insertedTemplate()
    //console.log('newObject:', newObject);
    //alert(usernameText + passwordText);
    try {
      //await new Promise(resolve => setTimeout(resolve, 500));
      const response = await fetch("http://localhost:5062/ObjectTemplate/Insert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: insertionName,
          gc: Number(insertionGC),
          weight: Number(insertionWeight),
          object_type: insertionObjectType
        }),
        credentials: "include"
      });

      if (response.ok) {
        alert("Login successful");
        await fetchTemplates();
        setInsertionName("");
        setInsertionGC("");
        setInsertionWeight("");
        setInsertionObjectType("");

      } else {
        alert("Login failed");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Network error");
    } finally {
      fetchTemplates();
    }

  };
  const createObjectInstance = async () => {

    if( insertionID == null || insertionModifier === "" || insertionQuantity === "" )
    {
      alert("Please enter all values");
      return;
     
    }
    
    const currentExpedition = expeditions.find(exp => exp.id === selectedExpedition);
    alert(selectedExpedition + " " + insertionID + " " + insertionQuantity + " " + insertionModifier)
    //insertedTemplate()
    //console.log('newObject:', newObject);
    //alert(usernameText + passwordText);
    try {
      //await new Promise(resolve => setTimeout(resolve, 500));
      const response = await fetch("http://localhost:5062/ObjectInstance/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          expedition_id: selectedExpedition,
          template_id: insertionID,
          quantity: Number(insertionQuantity),
          modifier: Number(insertionModifier),
          notes: "",
          cycle_number: currentExpedition?.current_cycle_number ?? null
  
        }),
        credentials: "include"
      });

      if (response.ok) {
        alert("Object Insertion Sucessful");
        await fetchInstances("npc, actor");
        setInsertionID(undefined);
        setInsertionQuantity('');
        setInsertionModifier('');
        setSelectedValue('')

      } else {
        alert("Object Insertion Failure");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Network error");
    } 

  };





  return (
    <div className="flex min-h-screen bg-gray-700 max-h-screen">

      {/* Left Column with margin */}
      <div className="flex-1 bg-gray-100 m-2  p-1 border-2 border-red-900 min-h-[300px]"
      style={{
        backgroundImage: "url('/textures/goldspeckled.png')",
        backgroundBlendMode: 'multiply',
        backgroundColor: '#f1f1f1', // to tint the texture
      }}
      >
        <div className="flex items-center justify-center bg-red-300 p-6  shadow w-full text-black font-imperator" >
          <h1 className="text-2xl font mb-4">Expeditions</h1>

        </div>

        <div className="space-y-2">
        {expeditions.map((t) => (
          <div
            key={t.id}
            onClick={() => {setSelectedExpedition(t.id); handleTabClick('');  reset(); 
              setCurrentCycle(t.current_cycle_number?? 0); setTotalGoldCost(t.total_gold_cost?? 0); setCurrentDay(0);}}
            className={`flex items-center justify-center px-6 py-3 shadow border-red-500 border-[3px] font-imperator cursor-pointer transition-colors duration-200
              ${selectedExpedition === t.id ? 'bg-green-500 text-black' : 'bg-white text-gray-900 hover:bg-gray-200'}
        
            `}
            
          >
            {t.name}
          </div>
        ))}

        <button 
              className="w-full mt-4 bg-green-500 text-white py-2 rounded hover:bg-green-600"

              onClick={() => setShowCreateExpedition(true)}
            >
              New Expedition
        </button>
        </div>
        {showCreateExpedition && (
            
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
              <h2 className="text-xl font-bold mb-4">Insert Object</h2>

              {/* 4 Input Fields */}
              
              
              <input
                type="text"
                placeholder="Object Type"
                className="w-full mb-4 p-2 border rounded"
                value={newExpeditionName}
                onChange={(e) => setNewExpeditionName(e.target.value)}
              />

              <div className="flex justify-end">
                <button
                  className="mr-2 bg-gray-300 px-4 py-2 rounded"
                  onClick={() => {setShowCreateExpedition(false);}}
                >
                  Cancel
                </button>
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            
                  onClick={() => {handleCreateExpeditionClick(newExpeditionName); }}
                >
                  Submit
                </button>
              </div>
            </div>
          
        )} 
      </div>

      {/* Right Black Box */}
      <div className="w-5/6 relative bg-black text-white font-bold m-2 shadow-lg flex justify-center items-center border-2 border-red-900 mt-50 p-5 mr-100">

        {/* Tabs attached to top-left of black box */}
        <div className="flex absolute -top-20 left-5 z-10">

          {/* First Tab */}
          <div className={`flex items-center justify-center px-8 py-5 shadow border-red-500 border-[5px] rounded-tl w-50 h-20 font-imperator hover:bg-gray-200 ${
              activeTab === 'crew' ? 'bg-green-500 text-black' : 'bg-white text-gray-900' 
              }`}
              
              onClick={() => {handleTabClick('crew'); reset();}}
              >
            Crew Manifest
          </div>

          {/* Second Tab (attached to the right) */}
          <div 
            className={`flex items-center justify-center px-8 py-5 shadow border-red-500 border-[5px] border-l-0 w-50 h-20 font-imperator cursor-pointer hover:bg-gray-200 ${
              activeTab === 'objects' ? 'bg-green-500 text-black' : 'bg-white text-gray-900'
            }`}

            onClick={() => {handleTabClick('objects'); reset();}}
          >
            <p className="font-imperator">Item</p>
          </div>
          
          {/* tHIRD Tab (attached to the right) */}
          <div 
            className={`flex items-center justify-center px-8 py-5 shadow border-red-500 border-[5px] border-l-0 w-50 h-20 font-imperator cursor-pointer hover:bg-gray-200 ${
              activeTab === 'manifest' ? 'bg-green-500 text-black' : 'bg-white text-gray-900'
            }`}

            onClick={() => {handleTabClick('manifest');  reset();}}
          
          >
            <p className="font-imperator">Manifest</p>
          </div>
          {/* Fourth (attached to the right) */}
          <div 
            className={`flex items-center justify-center px-8 py-5 shadow border-red-500 border-[5px] border-l-0 w-50 h-20 font-imperator cursor-pointer hover:bg-gray-200 ${
              activeTab === 'purchases' ? 'bg-green-500 text-black' : 'bg-white text-gray-900'
            }`}

            onClick={() => {handleTabClick('purchases');  reset();}}
          
          >
            <p className="font-imperator">Purchases</p>
          </div>
          
          {/* Fifth tAB (attached to the right) */}
          <div 
            className={`flex items-center justify-center px-8 py-5 shadow border-red-500 border-[5px] border-l-0 w-50 h-20 font-imperator cursor-pointer hover:bg-gray-200 ${
              activeTab === 'templates' ? 'bg-green-500 text-black' : 'bg-white text-gray-900'
            }`}

            onClick={() => {handleTabClick('templates');  reset();}}
          
          >
            <p className="font-imperator">Templates</p>
          </div>
    

        </div>
        {   }
        
        <div className= "flex-column w-full" >
          {/* white box */}
          <div className="bg-yellow-200 shadow w-full  text-black font-normal p-10 h-170 border-2  overflow-y-auto  ">

            {activeTab === 'manifest' && (
              activeLogs.map((t) => {
                const unescapedLog = t.log_text
                  .replace(/\\n/g, '\n')
                  .replace(/\\t/g, '\t');

                return (
                  <div key={t.id} className="p-2 border rounded bg-gray-100">
                    <pre className="whitespace-pre-wrap break-words text-sm font-mono">
                      {unescapedLog}
                    </pre>
                  </div>
                );
              })
            )}
            
            {(activeTab === 'crew' || activeTab === 'objects') && (
            <div className="mt-4 space-y-2">
              {addObjectField &&
                <div className="p-2 border rounded bg-gray-100">
                  <div className="">
                    {}
                    <div className="flex gap-2">
      
                      {/* Autocomplete input with dropdown list above */}
                      <div className="relative flex-1">
                        {/* Dropdown list */}
                        {showList && filteredOptions.length > 0 && (
                          <div className="absolute bottom-full mb-1 w-full bg-white border rounded shadow z-10 max-h-48 overflow-y-auto">
                            {activeTab === 'crew' && (filteredOptions.map((t) => (
                              <div
                                key={t.id}
                                className="p-2 hover:bg-gray-200 cursor-pointer"
                                onMouseDown={() => handleSelect(t)} // use onMouseDown to avoid blur conflict
                              >
                                {t.name}
                              </div>
                            )))}
                            {activeTab === 'objects' && (filteredOptionsObject.map((t) => (
                              <div
                                key={t.id}
                                className="p-2 hover:bg-gray-200 cursor-pointer"
                                onMouseDown={() => handleSelect(t)} // use onMouseDown to avoid blur conflict
                              >
                                {t.name}
                              </div>
                            )))}
                          </div>
                        )}

                        <input
                          type="text"
                          placeholder="Start typing..."
                          className="w-full p-2 border rounded"
                          value={selectedValue}
                          onChange={(e) => {
                            setSelectedValue(e.target.value);
                            setShowList(true);
                          }}
                          onFocus={() => setShowList(true)}
                          onBlur={() => setTimeout(() => setShowList(false), 150)}
                        />
                      </div>

                      
                    </div>
                      <div className="flex gap-2">
                        {/* Quantity */}
                        <input
                          type="text"
                          placeholder="Quantity"
                          className="w-full mb-2 p-2 border rounded"
                          value={insertionQuantity}
                          onChange={(e) => setInsertionQuantity(e.target.value)}
                        />

                        {/* Modifier */}
                        <input
                          type="text"
                          placeholder="Modifier"
                          className="w-full mb-2 p-2 border rounded"
                          value={insertionModifier}
                          onChange={(e) => setInsertionModifier(e.target.value)}
                        />
                      </div>
                  </div>
                  <div className="flex-col gap-2">
                      <button
                      className="mr-2 bg-gray-300 px-4 py-2 rounded"
                      onClick={() => {createObjectInstance();}}
                    >
                      Submit
                    </button>
                    <button 
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      onClick={() => {setAddObjectField(false); setAddObjectFieldPlus(true);}}
                    >
                      Cancel
                    </button>

                  </div>

                </div>
                } 
              {/* Clickable "+" button */ addObjectFieldPlus && 
                <button
                  
                  className="mt-2 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                  onClick={() => {setAddObjectField(true); setAddObjectFieldPlus(false); fetchTemplates();}}
                >
                  +
                </button>
              }
              {instances.map((t) => (
                <div key={t.id} className="p-2 border rounded bg-gray-100">
                  <p><strong>{t.template_name}</strong> ({t.object_type})</p>
                  <p>GC: {t.gc} | Weight: {t.weight} | Quantity | {t.quantity} Modifier | {t.modifier} Total GC | {t.total_GC} </p>
                </div>
              ))}
                
            </div>
            )}
            
            {activeTab === 'templates' && ( 
            <div className="mt-4 space-y-2">
              {addTemplateField &&
                <div className="p-2 border rounded bg-gray-100">
                  {/* Name */}
                  <div className="flex gap-2">
                    <h1>
                      Name: 
                    </h1>
                    <input
                      type="text"
                      placeholder="Name"
                      className="w-full mb-2 p-2 border rounded"
                      value={insertionName}
                      onChange={(e) => 
                        setInsertionName(e.target.value)
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <h1>
                      Gold Cost:
                    </h1>
                    <input
                    type="text"
                    inputMode='decimal'
                    placeholder="Gold Cost"
                    className="w-full mb-2 p-2 border rounded"
                    onBeforeInput={(e) => {
                      const input = (e.nativeEvent as InputEvent).data;
                      if (!input) return; // allow deletions, etc.

                      const el = e.target as HTMLInputElement;
                      const proposedValue =
                        el.value.slice(0, el.selectionStart!) +
                        input +
                        el.value.slice(el.selectionEnd!);

                      if (!/^\d+(\.\d{0,3})?$/.test(proposedValue)) {
                        e.preventDefault(); // block invalid format
                      }
                    }}
                    value={insertionGC}
                    onChange={(e) => 
                      setInsertionGC(e.target.value)
                      }
                  />
                  <h1>
                    Weight:
                  </h1>
                  <input
                    type="text"
                    placeholder="Weight"
                    className="w-full mb-2 p-2 border rounded"
                    value={insertionWeight}
                    onBeforeInput={(e) => {
                      const input = (e.nativeEvent as InputEvent).data;
                      if (!input) return;

                      const el = e.target as HTMLInputElement;
                      const proposedValue =
                        el.value.slice(0, el.selectionStart!) +
                        input +
                        el.value.slice(el.selectionEnd!);

                      if (!/^\d+$/.test(proposedValue)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                    
                      setInsertionWeight(e.target.value)
                      }
                    }
                    
                  />
                  <h1>
                    Object Type:
                  </h1>
                  <div className="relative flex-1">
                    <div
                      className="w-full p-2 border rounded bg-white cursor-pointer"
                      onClick={() => setShowList((prev) => !prev)}
                      onBlur={() => setTimeout(() => setShowList(false), 150)}
                      tabIndex={0}
                    >
                      {insertionObjectType || "Select a type"}
                    </div>
                  
                  {showList && (
                    <div className="absolute bottom-full mb-1 w-full bg-white border rounded shadow z-10">
                      {options.map((opt) => (
                        <div
                          key={opt}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={() => {
                            setInsertionObjectType(opt);
                            setShowList(false);
                          }}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                  
                  
                  </div>
                  
              
                  <div className="flex-col gap-2">
                      <button
                      className="mr-2 bg-gray-300 px-4 py-2 rounded"
                      onClick={(e) => insertObjectTemplate()}
                    >
                      Submit
                    </button>
                    <button 
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      onClick={() => {setAddTemplateField(false); setAddTemplateFieldPlus(true);
                        setInsertionName('');setInsertionGC('');setInsertionWeight('');setInsertionObjectType('');}}
                    >
                      Cancel
                    </button>

                  </div>

                </div>
                }  
            
              {/* Clickable "+" button */ addTemplateFieldPlus && 
                <button
                  
                  className="mt-2 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                  onClick={() => {setAddTemplateField(true); setAddTemplateFieldPlus(false); }}
                >
                  +
                </button>
              }
              {templates.map((t) => (
                <div key={t.id} className="p-2 border rounded bg-gray-100">
                  <p><strong>{t.name}</strong> ({t.object_type})</p>
                  <p>GC: {t.gc} | Weight: {t.weight}</p>
                </div>
              ))}
              
              
            </div>
            )}
            
            
            
          </div> 
          
          <div className="bg-white shadow w-full text-black font-normal p-2 h-full border-2 border-blue-500">
            
            
          </div>
        </div>
        <div className="bg-red-500 shadow w-1/2 text-black font-normal p-10 h-full border-2 border-red-500 ml-5">
          <div className="bg-white shadow w-full text-black font-normal p-2 h-1/2 border-2 border-blue-500">
            <div className="flex flex-row items-start gap-4">
              
              {/* LAND SUPPLY COLUMN */}
              <div className="flex flex-col items-center flex-1 max-w-[200px]">
                <div
                  className="w-full flex items-center justify-center min-h-[60px] bg-green-500 text-white py-2  border-2 border-purple-500"
                  
                >
                  Land Supply
                </div>

                {/* Render land supply items below */}
                {activeSupplies
                  .filter((t) => t.ration_type === 'land_supply')
                  .map((t) => (
                    <div key={t.template_id} className={`w-full bg-gray-100 text-center p-2 border mt-2
                      ${activeSupplyType === t.template_id ? 'bg-green-500 text-black' : 'bg-white text-gray-900 hover:bg-gray-200'

                      }`}
                      onClick={() => setActiveSupplyType(t.template_id)}
                    >
                      {t.name}: {t.quantity}
                    
                  </div>
                    
                ))}
              </div>

              {/* NAVAL SUPPLY COLUMN */}
              <div className="flex flex-col items-center flex-1 max-w-[200px]">
                <div
                  className="w-full flex items-center justify-center min-h-[60px] bg-green-500 text-white py-2 border-2 border-purple-500"
                  
                >
                  Naval Supply
                </div>

                {/* Render naval supply items below */}
                {activeSupplies
                .filter((t) => t.ration_type === 'naval_supply')
                .map((t) => (
                  
                  <div key={t.template_id} className={`w-full bg-gray-100 text-center p-2 border mt-2
                    ${activeSupplyType === t.template_id ? 'bg-green-500 text-black' : 'bg-white text-gray-900 hover:bg-gray-200'

                    }`}
                    onClick={() => setActiveSupplyType(t.template_id)}
                  >
                    {t.name}: {t.quantity}
                    
                  </div>
                  
                ))}
              </div>
              
            </div>
          </div>
          <div className="bg-white shadow w-full text-black font-normal p-2 h-1/2 border-2 border-blue-500 mt-2">
            <div className="flex flex-col items-center flex-1 max-w-[500px]">
                  <div className ="w-full flex items-center justify-center min-h-[60px] bg-green-500 text-white py-2" >

                  Day: {currentDay} Stage: {currentCycle} Total GC: {totalGoldCost}

                  </div>



            </div>
            <div className="flex flex-col items-center flex-1 max-w-[200px]">
                <button
                  className="w-full flex items-center justify-center min-h-[60px] bg-green-500 text-white py-2 hover:bg-green-600 border-2 border-purple-500"
                  onClick={() => commitCycle()}
                >
                  Next Cycle
                  
                </button>
                <input
                  type="number"
                  placeholder="Weight"
                  className="w-full mb-2 p-2 border rounded"
                  value={cycleLength}
                  min="1"
                  onChange={(e) => setCycleLength(Number(e.target.value))}
                  
                /> 
                    
            </div>  
          </div>
        </div>
      </div>
      
    </div>
  );
}


export default Travel
