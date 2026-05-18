<?php
// backend/db.php

// CORS headers to allow requests from your Vite React frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Supabase or PostgreSQL configuration
$supabase_url = getenv('SUPABASE_URL') ?: null;
$supabase_key = getenv('SUPABASE_KEY') ?: null;

if ($supabase_url && $supabase_key) {
    // Use Supabase REST API for DB operations
    $use_supabase = true;
    $supabase = [
        'url' => rtrim($supabase_url, '/'),
        'key' => $supabase_key
    ];

    function supabase_request($resource, $method = 'GET', $body = null, $query = null)
    {
        global $supabase;
        $url = $supabase['url'] . '/rest/v1/' . $resource;
        if ($query) {
            $url .= '?' . $query;
        }

        $ch = curl_init($url);
        $headers = [
            'apikey: ' . $supabase['key'],
            'Authorization: Bearer ' . $supabase['key'],
            'Accept: application/json',
            'Content-Type: application/json'
        ];

        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $method = strtoupper($method);
        if (in_array($method, ['POST', 'PATCH', 'PUT', 'DELETE'])) {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
            if ($body !== null) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
            }
        }

        $resp = curl_exec($ch);
        if ($resp === false) {
            $err = curl_error($ch);
            curl_close($ch);
            throw new Exception($err);
        }
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return ['status' => $httpcode, 'body' => json_decode($resp, true), 'raw' => $resp];
    }

} else {
    // Fallback to direct PostgreSQL connection via PDO
    $host = getenv('DB_HOST') ?: 'localhost';
    $port = getenv('DB_PORT') ?: '5432';
    $db_name = getenv('DB_NAME') ?: 'mobile_voting';
    $username = getenv('DB_USER') ?: 'postgres';
    $password = getenv('DB_PASS') ?: '';

    try {
        // Create PDO connection for PostgreSQL
        $dsn = "pgsql:host={$host};port={$port};dbname={$db_name}";
        $conn = new PDO($dsn, $username, $password);

        // Set PDO error mode to exception for better debugging
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Set default fetch mode to associative array
        $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    } catch (PDOException $exception) {
        // Return connection error as JSON
        header('Content-Type: application/json');
        echo json_encode(array(
            "success" => false,
            "message" => "Connection error: " . $exception->getMessage()
        ));
        exit();
    }
}
?>
