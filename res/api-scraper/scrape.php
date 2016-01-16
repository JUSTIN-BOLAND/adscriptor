<?php
  // Unlimited execution time & display errors
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
      return array();
    }
    return $json;
  }
  
  // Load Resource List
  file_exists('./api-responses/resources.json') or die('Please provide the resources.json File in /api-responses/');
  $resources_json = parseGoogleFile('./api-responses/resources.json');
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
    $files[$filename] = parseGoogleFile("./api-responses/$filename.json");
    $files_parsed++;
  }
  print("Parsing Results: $num_files Files: $files_parsed parsed, $files_skipped skipped, $files_blacklisted blacklisted.");
  
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
  
  
  // Convert the Files into the Tern layout
  $definition = array( "!name" => "AdWordsAPI", "!define" => array() );
  
  
?>