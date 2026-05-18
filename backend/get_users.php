<?php
// backend/get_users.php
require_once 'db.php';

header("Content-Type: application/json");

// Example HTTP GET request to fetch users
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // If Supabase is configured, use its REST API
        if (isset($use_supabase) && $use_supabase) {
            $res = supabase_request('voters', 'GET');
            if ($res['status'] >= 200 && $res['status'] < 300) {
                echo json_encode(array(
                    "success" => true,
                    "data" => $res['body']
                ));
            } else {
                echo json_encode(array(
                    "success" => false,
                    "message" => "Supabase error: " . $res['status']
                ));
            }
            exit();
        }

        // Fallback: Prepare the SQL statement via PDO
        $stmt = $conn->prepare("SELECT epic, name, aadhaar, faceRegistered FROM voters");
        $stmt->execute();

        // Fetch all rows
        $voters = $stmt->fetchAll();

        // Return JSON response
        echo json_encode(array(
            "success" => true,
            "data" => $voters
        ));
    } catch(PDOException $e) {
        echo json_encode(array(
            "success" => false,
            "message" => "Database error: " . $e->getMessage()
        ));
    }
} else {
    echo json_encode(array(
        "success" => false,
        "message" => "Invalid request method"
    ));
}
?>
