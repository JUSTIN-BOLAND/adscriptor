<?php
  // Unlimited execution time & display all errors
  set_time_limit(0);
  ini_set('display_errors', 1);
  ini_set('display_startup_errors', 1);
  error_reporting(E_ALL);
  
  // Parses a Google Auto-completion File and returns its contents as JSON.
  function parseGoogleFile($filename)
  {
    // Retrieve File Contents
    $contents = file_get_contents($filename);
    if( $contents === FALSE ||
        ($json = json_decode($contents, true)) === NULL)
    {
      print("Failed to parse File $filename, ignoring contents...\n");
      return false;
    }
    return $json;
  }
  
  // Load Resource List
  file_exists('./api-responses/resources.json') or die('Please provide the resources.json File in /api-responses/');
  $resources_json = parseGoogleFile('./api-responses/resources.json') or die("resources.json couldn't be parsed!");
  $num_files = count($resources_json) or die('resources.json doesn\'t contain any Library Definitions, stopping...');
  print("Parsing $num_files API files (" . implode(', ', array_keys($resources_json)) . ")\n");
  
  $files = array();
  $file_blacklist = array( 'JSON', 'Math', '[]', 'Object' );
  $files_parsed = 0; $files_skipped = 0; $files_blacklisted = 0;
  // Load all Files
  foreach($resources_json as $filename => $url)
  {
    if(in_array($filename, $file_blacklist))
    {
      print("Skipping API '$filename', because it is blacklisted.\n");
      $files_blacklisted++;
      continue;
    }
    if(!file_exists("./api-responses/$filename.json"))
    {
      print("Skipping API '$filename', because the File './api-responses/$filename.json' does not exist.\n");
      $files_skipped++;
      continue;
    }
    print("Loading API $filename...\n");
    $result = parseGoogleFile("./api-responses/$filename.json");
    if($result !== false)
      $files[$filename] = $result;
    $files_parsed++;
  }
  print("Parsing Results: $num_files Files: $files_parsed parsed, $files_skipped skipped, $files_blacklisted blacklisted.\n");
  
  /*
    Google Auto-Complete File Layout:
    
    [
      unknown,
      public-type-definition,
      private-type-defintion-array,
      internal-flag,
      unknown,
      unknown
    ]
  
    type-definition = [
      unknown,
      name,
      member-definitions,
      function-definitions
    ]
    
    member-definition = [
      unknown,
      name,
      type,
      unknown,
      unknown,
      unknown,
      doc_comment
    ]
    
    function-definition = [
      unknown,
      name,
      return_type,
      argument-array,
      unknown,
      unknown,
      doc_comment,
      return_comment
    ]
    
    argument-array-type = [
      unknown,
      name,
      type,
      doc_comment
    ]
  */
  
  // Rename Rules for processName()
  $rename_table = array(
    'M3FP42KoRcF-9_xxV3CJQtbK_KCzEej_I_bucket8' => 'AdWordsApp',
    'Analytics_v3.Analytics.V3.Https___www_googleapis_com_' => 'Analytics',
    'Analytics_v3' => 'Analytics',
    'Analytics.V3.Https___www_googleapis_com_' => 'Analytics',
    'Bigquery_v2.Bigquery.V2.Https___www_googleapis_com_' => 'Bigquery',
    'Bigquery_v2' => 'Bigquery',
    'Bigquery.V2.Https___www_googleapis_com_' => 'Bigquery',
    'Calendar_v3.Calendar.V3.Https___www_googleapis_com_' => 'Calendar',
    'Calendar_v3' => 'Calendar',
    'Calendar.V3.Https___www_googleapis_com_' => 'Calendar',
    'Fusiontables_v1.Fusiontables.V1.Https___www_googleapis_com_' => 'Fusiontables',
    'Fusiontables_v1' => 'Fusiontables',
    'Fusiontables.V1.Https___www_googleapis_com_' => 'Fusiontables',
    'MAUKQdvqkJRGmALD85K5127K_KCzEej_I_bucket8' => 'MccApp',
    'Prediction_v1_6.Prediction.V1_6.Https___www_googleapis_com_' => 'Prediction',
    'Prediction_v1_6' => 'Prediction',
    'Prediction.V1_6.Https___www_googleapis_com_' => 'Prediction',
    'Content_v2.Content.V2.Https___www_googleapis_com_' => 'ShoppingContent',
    'Content_v2' => 'ShoppingContent',
    'Content.V2.Https___www_googleapis_com_' => 'ShoppingContent',
    'Tasks_v1.Tasks.V1.Https___www_googleapis_com_' => 'Tasks',
    'Tasks_v1' => 'Tasks',
    'Tasks.V1.Https___www_googleapis_com_' => 'Tasks',
    'Youtube_v3.Youtube.V3.Https___www_googleapis_com_' => 'Youtube',
    'Youtube_v3' => 'Youtube',
    'Youtube.V3.Https___www_googleapis_com_' => 'Youtube',
    'YoutubeAnalytics_v1.YoutubeAnalytics.V1.Https___www_googleapis_com_' => 'YoutubeAnalytics',
    'YoutubeAnalytics_v1' => 'YoutubeAnalytics',
    'YoutubeAnalytics.V1.Https___www_googleapis_com_' => 'YoutubeAnalytics'
  );
  
  // List of already warned possible simple types
  $maybe_simple_types = array();
  
  // Blacklist for Object Names (This Objects will get dropped)
  $blacklist_objects = array(
    'AdWordsApp.String',
    'AdWordsApp.Array',
    'MccApp.String',
    'MccApp.Array'
  );
  
  // Processes an Object / Class / Function Name and renames it according to the renaming-rules
  // defined aboce.
  function processName($name)
  {
    global $rename_table;
    foreach($rename_table as $value => $replacement)
    {
      $name = str_replace($value, $replacement, $name);
    }
    
    // Remove '-', because tern doesn't like them in function-definitions
    $name = str_replace('-', '', $name);
    
    return $name;  
  }
  
  // Processes a Type (Function Parameter or Return Value)
  function processType($type)
  {
    global $maybe_simple_types;
    // Transform Arrays
    if(substr($type, -2) === '[]')
      return '[' . processType(substr($type, 0, -2)) . ']';
    
    // Simple Types
    if(strcasecmp($type, 'byte') == 0 ||
       strcasecmp($type, 'int')  == 0 ||
       strcasecmp($type, 'integer') == 0 ||
       strcasecmp($type, 'long') == 0 ||
       strcasecmp($type, 'short') == 0 ||
       strcasecmp($type, 'float') == 0 ||
       strcasecmp($type, 'double') == 0 ||
       strcasecmp($type, 'numeric') == 0 ||
       strcasecmp($type, 'number') == 0)
    {
      return 'number';
    }
    else if(strcasecmp($type, 'string') == 0 ||
            strcasecmp(substr($type, -7), '.string') == 0) // AdWordsApp and MccApp both have a custom string type... (AdWordsApp.String, MccApp.String)
    {
      return 'string';
    }
    else if(strcasecmp(substr($type, -6), '.array') == 0) // Same for arrays...
    {
      return '[object]';
    }
    else if(strcasecmp($type, 'boolean') == 0 ||
            strcasecmp($type, 'bool') == 0)
    {
      return 'bool';
    }
    else if(strcasecmp($type, 'object') == 0)
    {
      return 'object';
    }
    else if(strcasecmp($type, 'void') == 0 ||
            strcasecmp($type, 'null') == 0)
    {
      return false;
    }   
    else
    {
      // Resolve Complex Types
      $type = processName($type);
      
      // Check if the Type has a dot (otherwise it is maybe a non-matched simple-type)
      if(strpos($type, '.') === false)
      {
        if(!array_key_exists($type, $maybe_simple_types))
        {
          $maybe_simple_types[$type] = true;
          print("Warning: Type '$type' could be a simple Type...\n");
        }  
      }
      
      // return the complex type
      return $type;
    }
  }
  
  // Pad Spaces to the End of the Member Name until it is unique in this Object (kinda hacky)
  function processMemberName(&$def_object, $name)
  {
    while(array_key_exists($name, $def_object))
      $name .= ' ';
    return $name;
  }
  
  // Appends the Member to the definition object
  function appendMember(&$def_object, $member)
  {
    // Check if Member Name and Type are available
    if(array_key_exists(1, $member) && is_string($member[1]) &&
       array_key_exists(2, $member) && is_string($member[2]))
    {
      $member_name = $member[1];
      $member_type = $member[2];
      
      // Modify Name & Type
      $member_name = processMemberName($def_object, processName($member_name));
      $member_type = processType($member_type) or 'object';
      
      // Create the Member Definition
      $member_def = array( '!type' => $member_type);
      
      // Check if a Comment is available
      if(array_key_exists(6, $member) && is_string($member[6]))
      {
        $member_def['!doc'] = strip_tags($member[6]);
      }
      
      // Append the Member to the Parent
      $def_object[$member_name] = $member_def;
    }
  }
  
  // Appends the Member Function to the definition object
  function appendMemberFunction(&$def_object, $member_fn)
  {
    // Check if Member Function Name and Return Type are available
    if(array_key_exists(1, $member_fn) && is_string($member_fn[1]) &&
       array_key_exists(2, $member_fn))
    {
      $member_name = $member_fn[1];
      
      // Assemble the Function Signature
      $member_sig = 'fn(';
      // Append Parameters
      if(array_key_exists(3, $member_fn) && is_array($member_fn[3]))
      {
        $argument_list = array();
        foreach($member_fn[3] as $argument)
        {
          if( is_array($argument) &&
              array_key_exists(1, $argument) && is_string($argument[1]) &&
              array_key_exists(2, $argument) && is_string($argument[2]))
          {
            $argument_name = processName($argument[1]);
            $argument_type = processType($argument[2]) or 'object';
            
            $argument_list[] = "$argument_name: $argument_type";
          } 
        }
        
        // Add Function Arguments to Function Signature
        $member_sig .= implode(', ', $argument_list);
      }
      $member_sig .= ')';
      
      // Check if Return Type is valid
      $return_type = $member_fn[2];
      if(!is_null($return_type) && ($return_type = processType($return_type)) !== false)
      {
        $member_sig .= " -> $return_type";
      }
      
      // Fix the Function Name
      $member_name = processMemberName($def_object, processName($member_name));
      
      // Create the Member Definition
      $member_def = array( '!type' => $member_sig );
      
      // Check if a Comment is available
      if(array_key_exists(6, $member_fn) && is_string($member_fn[6]))
      {
        $member_def['!doc'] = strip_tags($member_fn[6]);
      }
      
      // Append the Member to the Parent
      $def_object[$member_name] = $member_def;
       
    }
  }
  
  // Appends an Api-Object to a Type-Definition
  function appendObject(&$def_object, $obj)
  {
    global $blacklist_objects;
    
    // Check if Object Name is available
    if(array_key_exists(1, $obj) && is_string($obj[1]))
    {
      $obj_name = processMemberName($def_object, processName($obj[1]));
      
      // Drop blacklisted Objects
      if(in_array(strtolower($obj_name), array_map('strtolower', $blacklist_objects)))
      {
        return;
      }
      
      // Create the Obeject Signature (Members, Functions)
      $obj_sig = array();
      
      // Append Members
      if(array_key_exists(2, $obj) && is_array($obj[2]))
      {
        $members = $obj[2];
        foreach($members as $member_def)
        {
          if(is_array($member_def))
            appendMember($obj_sig, $member_def);
        }
      }
      // Append Member Functions
      if(array_key_exists(3, $obj) && is_array($obj[3]))
      {
        $member_fns = $obj[3];
        foreach($member_fns as $member_fn_def)
        {
          if(is_array($member_fn_def))
            appendMemberFunction($obj_sig, $member_fn_def);
        }
      }
      
      // Add the Object to the definition
      $def_object[$obj_name] = $obj_sig;
    } 
    
               
  }
  
  
  
  // Convert the Files into the Tern layout
  $definition = array( '!name' => 'AdWordsAPI', '!define' => array() );
  
  // Loop over all APIs
  foreach($files as $filename => $data)
  {
    print("Processing File $filename...\n");
    
    $public_defs = array();
    $private_defs = array();
    
    // Check if the API has a Public Type Definition
    if(array_key_exists(1, $data) && is_array($data[1]))
    {
      // Check if it is an internal API
      if(array_key_exists(3, $data) && is_int($data[3]) && $data[3] > 0)
        $private_defs[] = $data[1];
      else
        $public_defs[] = $data[1];
    }
    
    /*
      [
      unknown,
      public-type-definition,
      private-type-defintion-array,
      internal-flag,
      unknown,
      unknown
    ]
    */
    
    // Add the private Types
    if(array_key_exists(2, $data) && is_array($data[2]))
    {
      $private_types = $data[2];
      foreach($private_types as $private_type)
      {
        if(is_array($private_type))
          $private_defs[] = $private_type;
      }  
    }
    
    // Append the Public Types directly to the definition
    foreach($public_defs as $public_object)
    {
      appendObject($definition, $public_object);  
    }
    // Append the Private Types under the !define Section
    foreach($private_defs as $private_object)
    {
      appendObject($definition['!define'], $private_object);  
    }
    
    $public_count = count($public_defs);
    $private_count = count($private_defs);
    print("Processed $public_count public, $private_count private objects for API $filename...\n");
  }
  
  // Sorts an Array and it's subarrays based on the keys
  function recursiveSort(&$arr)
  {
    ksort($arr);
    foreach($arr as &$value)
    {
      if(is_array($value))
        recursiveSort($value);
    }
    unset($value);
  }
  
  recursiveSort($definition);
  
  
  
  print("Finished processing, generating API Definition File for tern...\n");
  
  $json_data = json_encode($definition, JSON_PRETTY_PRINT);
  
  $date = date('y-m-d H-i-s');
  $output_filename = "output/$date AdWordsApi.json";
  file_put_contents($output_filename, $json_data);
  
  print("Finished!\n");
?>