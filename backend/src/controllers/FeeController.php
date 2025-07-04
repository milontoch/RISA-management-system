<?php
require_once __DIR__ . '/../../config/db.php';

class FeeController {
    
    public static function getFeesByStudent($student_id) {
        global $conn;
        
        try {
            if (!is_numeric($student_id)) {
                return ['success' => false, 'message' => 'Invalid student ID'];
            }
            
            $sql = "SELECT f.*, s.roll_number, u.name as student_name, c.name as class_name 
                    FROM fees f 
                    LEFT JOIN students s ON f.student_id = s.id 
                    LEFT JOIN users u ON s.user_id = u.id 
                    LEFT JOIN classes c ON s.class_id = c.id 
                    WHERE f.student_id = ? 
                    ORDER BY f.due_date ASC";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $student_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $fees = [];
            while ($row = $result->fetch_assoc()) {
                $fees[] = $row;
            }
            
            return ['success' => true, 'data' => $fees];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function getFeeById($id) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid fee ID'];
            }
            
            $sql = "SELECT f.*, s.roll_number, u.name as student_name, c.name as class_name 
                    FROM fees f 
                    LEFT JOIN students s ON f.student_id = s.id 
                    LEFT JOIN users u ON s.user_id = u.id 
                    LEFT JOIN classes c ON s.class_id = c.id 
                    WHERE f.id = ?";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                return ['success' => false, 'message' => 'Fee not found'];
            }
            
            $fee = $result->fetch_assoc();
            return ['success' => true, 'data' => $fee];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function createFee($student_id, $amount, $due_date, $status) {
        global $conn;
        
        try {
            // Input validation
            if (!is_numeric($student_id)) {
                return ['success' => false, 'message' => 'Invalid student ID'];
            }
            
            if (!is_numeric($amount) || $amount <= 0) {
                return ['success' => false, 'message' => 'Invalid amount. Must be a positive number'];
            }
            
            if (empty($due_date)) {
                return ['success' => false, 'message' => 'Due date is required'];
            }
            
            if (!in_array($status, ['unpaid', 'paid', 'partial'])) {
                return ['success' => false, 'message' => 'Invalid status. Must be unpaid, paid, or partial'];
            }
            
            // Validate date format
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $due_date)) {
                return ['success' => false, 'message' => 'Invalid date format. Use YYYY-MM-DD'];
            }
            
            // Check if student exists
            $student_check = $conn->prepare("SELECT id FROM students WHERE id = ?");
            $student_check->bind_param("i", $student_id);
            $student_check->execute();
            if ($student_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Student not found'];
            }
            
            $sql = "INSERT INTO fees (student_id, amount, due_date, status) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("idss", $student_id, $amount, $due_date, $status);
            
            if ($stmt->execute()) {
                $fee_id = $conn->insert_id;
                return ['success' => true, 'message' => 'Fee created successfully', 'id' => $fee_id];
            } else {
                return ['success' => false, 'message' => 'Failed to create fee: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function updateFee($id, $amount, $due_date, $status) {
        global $conn;
        
        try {
            // Input validation
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid fee ID'];
            }
            
            if (!is_numeric($amount) || $amount <= 0) {
                return ['success' => false, 'message' => 'Invalid amount. Must be a positive number'];
            }
            
            if (empty($due_date)) {
                return ['success' => false, 'message' => 'Due date is required'];
            }
            
            if (!in_array($status, ['unpaid', 'paid', 'partial'])) {
                return ['success' => false, 'message' => 'Invalid status. Must be unpaid, paid, or partial'];
            }
            
            // Validate date format
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $due_date)) {
                return ['success' => false, 'message' => 'Invalid date format. Use YYYY-MM-DD'];
            }
            
            // Check if fee exists
            $fee_check = $conn->prepare("SELECT id FROM fees WHERE id = ?");
            $fee_check->bind_param("i", $id);
            $fee_check->execute();
            if ($fee_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Fee not found'];
            }
            
            $sql = "UPDATE fees SET amount = ?, due_date = ?, status = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("dssi", $amount, $due_date, $status, $id);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Fee updated successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to update fee: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function deleteFee($id) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid fee ID'];
            }
            
            // Check if fee exists
            $fee_check = $conn->prepare("SELECT id FROM fees WHERE id = ?");
            $fee_check->bind_param("i", $id);
            $fee_check->execute();
            if ($fee_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Fee not found'];
            }
            
            $sql = "DELETE FROM fees WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Fee deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to delete fee: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function getAllFees() {
        global $conn;
        
        try {
            $sql = "SELECT f.*, s.roll_number, u.name as student_name, c.name as class_name 
                    FROM fees f 
                    LEFT JOIN students s ON f.student_id = s.id 
                    LEFT JOIN users u ON s.user_id = u.id 
                    LEFT JOIN classes c ON s.class_id = c.id 
                    ORDER BY f.due_date ASC";
            
            $result = $conn->query($sql);
            
            if (!$result) {
                return ['success' => false, 'message' => 'Database error: ' . $conn->error];
            }
            
            $fees = [];
            while ($row = $result->fetch_assoc()) {
                $fees[] = $row;
            }
            
            return ['success' => true, 'data' => $fees];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
} 