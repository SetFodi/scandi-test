<?php
// backend/config/Database.php

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port; // Adding port for Railway
    public $conn;

    public function __construct() {
        // Use environment variables from Railway
        $this->host = getenv('MYSQLHOST') ?: 'localhost';
        $this->port = getenv('MYSQLPORT') ?: '3306';
        $this->db_name = getenv('MYSQLDATABASE') ?: 'railway';
        $this->username = getenv('MYSQLUSER') ?: 'root';
        $this->password = getenv('MYSQLPASSWORD') ?: 'aaBxMTHUBqaochHwHiMFJJOXCSbBJCHN';
    }

    // This method establishes a connection and returns the PDO object.
    public function connect() {
        $this->conn = null;
        try {
            // Include port in the DSN for Railway
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->db_name}";
            $this->conn = new PDO($dsn, $this->username, $this->password);
            // Set error mode to exception for debugging purposes.
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            // Optional: Confirm connection (remove after testing)
            // echo "Connected to MySQL successfully!";
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
