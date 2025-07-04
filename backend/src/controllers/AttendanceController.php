<?php
require_once __DIR__ . '/../../config/db.php';

class AttendanceController {
    
    public static function markAttendance($student_id, $date, $status) {
        global $conn;
        
        try {
            // Input validation
            if (!is_numeric($student_id)) {
                return ['success' => false, 'message' => 'Invalid student ID'];
            }
            
            if (empty($date)) {
                return ['success' => false, 'message' => 'Date is required'];
            }
            
            if (!in_array($status, ['present', 'absent', 'late'])) {
                return ['success' => false, 'message' => 'Invalid status. Must be present, absent, or late'];
            }
            
            // Check if student exists
            $student_check = $conn->prepare("SELECT id FROM students WHERE id = ?");
            $student_check->bind_param("i", $student_id);
            $student_check->execute();
            if ($student_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Student not found'];
            }
            
            // Validate date format
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
                return ['success' => false, 'message' => 'Invalid date format. Use YYYY-MM-DD'];
            }
            
            $sql = "INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iss", $student_id, $date, $status);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Attendance marked successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to mark attendance: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function getAttendanceByStudent($student_id) {
        global $conn;
        
        try {
            if (!is_numeric($student_id)) {
                return ['success' => false, 'message' => 'Invalid student ID'];
            }
            
            $sql = "SELECT a.*, s.roll_number, u.name as student_name 
                    FROM attendance a 
                    LEFT JOIN students s ON a.student_id = s.id 
                    LEFT JOIN users u ON s.user_id = u.id 
                    WHERE a.student_id = ? 
                    ORDER BY a.date DESC";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $student_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $attendance = [];
            while ($row = $result->fetch_assoc()) {
                $attendance[] = $row;
            }
            
            return ['success' => true, 'data' => $attendance];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function getAttendanceByDate($date) {
        global $conn;
        
        try {
            if (empty($date)) {
                return ['success' => false, 'message' => 'Date is required'];
            }
            
            // Validate date format
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
                return ['success' => false, 'message' => 'Invalid date format. Use YYYY-MM-DD'];
            }
            
            $sql = "SELECT a.*, s.roll_number, u.name as student_name, c.name as class_name, sec.name as section_name 
                    FROM attendance a 
                    LEFT JOIN students s ON a.student_id = s.id 
                    LEFT JOIN users u ON s.user_id = u.id 
                    LEFT JOIN classes c ON s.class_id = c.id 
                    LEFT JOIN sections sec ON s.section_id = sec.id 
                    WHERE a.date = ? 
                    ORDER BY c.name, sec.name, s.roll_number";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $date);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $attendance = [];
            while ($row = $result->fetch_assoc()) {
                $attendance[] = $row;
            }
            
            return ['success' => true, 'data' => $attendance];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function getAttendanceByClassAndDate($class_id, $date) {
        global $conn;
        
        try {
            if (!is_numeric($class_id)) {
                return ['success' => false, 'message' => 'Invalid class ID'];
            }
            
            if (empty($date)) {
                return ['success' => false, 'message' => 'Date is required'];
            }
            
            // Validate date format
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
                return ['success' => false, 'message' => 'Invalid date format. Use YYYY-MM-DD'];
            }
            
            $sql = "SELECT a.*, s.roll_number, u.name as student_name, sec.name as section_name 
                    FROM attendance a 
                    LEFT JOIN students s ON a.student_id = s.id 
                    LEFT JOIN users u ON s.user_id = u.id 
                    LEFT JOIN sections sec ON s.section_id = sec.id 
                    WHERE s.class_id = ? AND a.date = ? 
                    ORDER BY sec.name, s.roll_number";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("is", $class_id, $date);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $attendance = [];
            while ($row = $result->fetch_assoc()) {
                $attendance[] = $row;
            }
            
            return ['success' => true, 'data' => $attendance];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
} 