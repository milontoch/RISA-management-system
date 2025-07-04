<?php
require_once __DIR__ . '/../../config/db.php';

class StudentController {
    
    public static function getAllStudents() {
        global $conn;
        
        try {
            $sql = "SELECT s.*, u.name, u.email, c.name as class_name, sec.name as section_name 
                    FROM students s 
                    LEFT JOIN users u ON s.user_id = u.id 
                    LEFT JOIN classes c ON s.class_id = c.id 
                    LEFT JOIN sections sec ON s.section_id = sec.id 
                    ORDER BY s.id DESC";
            
            $result = $conn->query($sql);
            
            if (!$result) {
                return ['success' => false, 'message' => 'Database error: ' . $conn->error];
            }
            
            $students = [];
            while ($row = $result->fetch_assoc()) {
                $students[] = $row;
            }
            
            return ['success' => true, 'data' => $students];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function getStudentById($id) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid student ID'];
            }
            
            $sql = "SELECT s.*, u.name, u.email, c.name as class_name, sec.name as section_name 
                    FROM students s 
                    LEFT JOIN users u ON s.user_id = u.id 
                    LEFT JOIN classes c ON s.class_id = c.id 
                    LEFT JOIN sections sec ON s.section_id = sec.id 
                    WHERE s.id = ?";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                return ['success' => false, 'message' => 'Student not found'];
            }
            
            $student = $result->fetch_assoc();
            return ['success' => true, 'data' => $student];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function createStudent($user_id, $class_id, $section_id, $roll_number) {
        global $conn;
        
        try {
            // Input validation
            if (!is_numeric($user_id) || !is_numeric($class_id) || !is_numeric($section_id)) {
                return ['success' => false, 'message' => 'Invalid input parameters'];
            }
            
            if (empty($roll_number)) {
                return ['success' => false, 'message' => 'Roll number is required'];
            }
            
            // Check if user exists
            $user_check = $conn->prepare("SELECT id FROM users WHERE id = ? AND role = 'student'");
            $user_check->bind_param("i", $user_id);
            $user_check->execute();
            if ($user_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'User not found or not a student'];
            }
            
            // Check if class exists
            $class_check = $conn->prepare("SELECT id FROM classes WHERE id = ?");
            $class_check->bind_param("i", $class_id);
            $class_check->execute();
            if ($class_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Class not found'];
            }
            
            // Check if section exists
            $section_check = $conn->prepare("SELECT id FROM sections WHERE id = ?");
            $section_check->bind_param("i", $section_id);
            $section_check->execute();
            if ($section_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Section not found'];
            }
            
            // Check if roll number already exists in the same class and section
            $roll_check = $conn->prepare("SELECT id FROM students WHERE roll_number = ? AND class_id = ? AND section_id = ?");
            $roll_check->bind_param("sii", $roll_number, $class_id, $section_id);
            $roll_check->execute();
            if ($roll_check->get_result()->num_rows > 0) {
                return ['success' => false, 'message' => 'Roll number already exists in this class and section'];
            }
            
            $sql = "INSERT INTO students (user_id, class_id, section_id, roll_number, created_at) VALUES (?, ?, ?, ?, NOW())";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iiis", $user_id, $class_id, $section_id, $roll_number);
            
            if ($stmt->execute()) {
                $student_id = $conn->insert_id;
                return ['success' => true, 'message' => 'Student created successfully', 'id' => $student_id];
            } else {
                return ['success' => false, 'message' => 'Failed to create student: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function updateStudent($id, $class_id, $section_id, $roll_number) {
        global $conn;
        
        try {
            // Input validation
            if (!is_numeric($id) || !is_numeric($class_id) || !is_numeric($section_id)) {
                return ['success' => false, 'message' => 'Invalid input parameters'];
            }
            
            if (empty($roll_number)) {
                return ['success' => false, 'message' => 'Roll number is required'];
            }
            
            // Check if student exists
            $student_check = $conn->prepare("SELECT id FROM students WHERE id = ?");
            $student_check->bind_param("i", $id);
            $student_check->execute();
            if ($student_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Student not found'];
            }
            
            // Check if class exists
            $class_check = $conn->prepare("SELECT id FROM classes WHERE id = ?");
            $class_check->bind_param("i", $class_id);
            $class_check->execute();
            if ($class_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Class not found'];
            }
            
            // Check if section exists
            $section_check = $conn->prepare("SELECT id FROM sections WHERE id = ?");
            $section_check->bind_param("i", $section_id);
            $section_check->execute();
            if ($section_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Section not found'];
            }
            
            // Check if roll number already exists in the same class and section (excluding current student)
            $roll_check = $conn->prepare("SELECT id FROM students WHERE roll_number = ? AND class_id = ? AND section_id = ? AND id != ?");
            $roll_check->bind_param("siii", $roll_number, $class_id, $section_id, $id);
            $roll_check->execute();
            if ($roll_check->get_result()->num_rows > 0) {
                return ['success' => false, 'message' => 'Roll number already exists in this class and section'];
            }
            
            $sql = "UPDATE students SET class_id = ?, section_id = ?, roll_number = ?, updated_at = NOW() WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iisi", $class_id, $section_id, $roll_number, $id);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Student updated successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to update student: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function deleteStudent($id) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid student ID'];
            }
            
            // Check if student exists
            $student_check = $conn->prepare("SELECT id FROM students WHERE id = ?");
            $student_check->bind_param("i", $id);
            $student_check->execute();
            if ($student_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Student not found'];
            }
            
            $sql = "DELETE FROM students WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Student deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to delete student: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function getStudentsByClass($class_id) {
        global $conn;
        
        try {
            if (!is_numeric($class_id)) {
                return ['success' => false, 'message' => 'Invalid class ID'];
            }
            
            $sql = "SELECT s.*, u.name, u.email, c.name as class_name, sec.name as section_name 
                    FROM students s 
                    LEFT JOIN users u ON s.user_id = u.id 
                    LEFT JOIN classes c ON s.class_id = c.id 
                    LEFT JOIN sections sec ON s.section_id = sec.id 
                    WHERE s.class_id = ? 
                    ORDER BY s.roll_number ASC";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $class_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $students = [];
            while ($row = $result->fetch_assoc()) {
                $students[] = $row;
            }
            
            return ['success' => true, 'data' => $students];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
} 