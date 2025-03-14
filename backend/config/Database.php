<?php
// backend/config/Database.php

class Database {
    // Change these values as needed for your MySQL setup.
    private $host = 'localhost';
    private $db_name = 'scandiweb_test';
    private $username = 'root'; // Adjust to your username
    private $password = 'Kakilo@1234';     // Adjust to your password
    public $conn;

    // This method establishes a connection and returns the PDO object.
    public function connect() {
        $this->conn = null;
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name}";
            $this->conn = new PDO($dsn, $this->username, $this->password);
            // Set error mode to exception for debugging purposes.
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
