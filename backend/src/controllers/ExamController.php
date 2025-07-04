<?php
require_once __DIR__ . '/../../config/db.php';

class ExamController {
    
    public static function getAllExams() {
        global $conn;
        
        try {
            $sql = "SELECT e.*, c.name as class_name 
                    FROM exams e 
                    LEFT JOIN classes c ON e.class_id = c.id 
                    ORDER BY e.date DESC, e.name ASC";
            
            $result = $conn->query($sql);
            
            if (!$result) {
                return ['success' => false, 'message' => 'Database error: ' . $conn->error];
            }
            
            $exams = [];
            while ($row = $result->fetch_assoc()) {
                $exams[] = $row;
            }
            
            return ['success' => true, 'data' => $exams];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function getExamById($id) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid exam ID'];
            }
            
            $sql = "SELECT e.*, c.name as class_name 
                    FROM exams e 
                    LEFT JOIN classes c ON e.class_id = c.id 
                    WHERE e.id = ?";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                return ['success' => false, 'message' => 'Exam not found'];
            }
            
            $exam = $result->fetch_assoc();
            return ['success' => true, 'data' => $exam];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function createExam($name, $class_id, $date) {
        global $conn;
        
        try {
            // Input validation
            if (empty(trim($name))) {
                return ['success' => false, 'message' => 'Exam name is required'];
            }
            
            if (!is_numeric($class_id)) {
                return ['success' => false, 'message' => 'Invalid class ID'];
            }
            
            if (empty($date)) {
                return ['success' => false, 'message' => 'Exam date is required'];
            }
            
            // Validate date format
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
                return ['success' => false, 'message' => 'Invalid date format. Use YYYY-MM-DD'];
            }
            
            // Check if class exists
            $class_check = $conn->prepare("SELECT id FROM classes WHERE id = ?");
            $class_check->bind_param("i", $class_id);
            $class_check->execute();
            if ($class_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Class not found'];
            }
            
            // Check if exam already exists for this class on the same date
            $exam_check = $conn->prepare("SELECT id FROM exams WHERE name = ? AND class_id = ? AND date = ?");
            $exam_check->bind_param("sis", $name, $class_id, $date);
            $exam_check->execute();
            if ($exam_check->get_result()->num_rows > 0) {
                return ['success' => false, 'message' => 'Exam already exists for this class on the specified date'];
            }
            
            $sql = "INSERT INTO exams (name, class_id, date) VALUES (?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sis", $name, $class_id, $date);
            
            if ($stmt->execute()) {
                $exam_id = $conn->insert_id;
                return ['success' => true, 'message' => 'Exam created successfully', 'id' => $exam_id];
            } else {
                return ['success' => false, 'message' => 'Failed to create exam: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function updateExam($id, $name, $class_id, $date) {
        global $conn;
        
        try {
            // Input validation
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid exam ID'];
            }
            
            if (empty(trim($name))) {
                return ['success' => false, 'message' => 'Exam name is required'];
            }
            
            if (!is_numeric($class_id)) {
                return ['success' => false, 'message' => 'Invalid class ID'];
            }
            
            if (empty($date)) {
                return ['success' => false, 'message' => 'Exam date is required'];
            }
            
            // Validate date format
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
                return ['success' => false, 'message' => 'Invalid date format. Use YYYY-MM-DD'];
            }
            
            // Check if exam exists
            $exam_check = $conn->prepare("SELECT id FROM exams WHERE id = ?");
            $exam_check->bind_param("i", $id);
            $exam_check->execute();
            if ($exam_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Exam not found'];
            }
            
            // Check if class exists
            $class_check = $conn->prepare("SELECT id FROM classes WHERE id = ?");
            $class_check->bind_param("i", $class_id);
            $class_check->execute();
            if ($class_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Class not found'];
            }
            
            // Check if exam already exists for this class on the same date (excluding current exam)
            $duplicate_check = $conn->prepare("SELECT id FROM exams WHERE name = ? AND class_id = ? AND date = ? AND id != ?");
            $duplicate_check->bind_param("sisi", $name, $class_id, $date, $id);
            $duplicate_check->execute();
            if ($duplicate_check->get_result()->num_rows > 0) {
                return ['success' => false, 'message' => 'Exam already exists for this class on the specified date'];
            }
            
            $sql = "UPDATE exams SET name = ?, class_id = ?, date = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sisi", $name, $class_id, $date, $id);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Exam updated successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to update exam: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function deleteExam($id) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid exam ID'];
            }
            
            // Check if exam exists
            $exam_check = $conn->prepare("SELECT id FROM exams WHERE id = ?");
            $exam_check->bind_param("i", $id);
            $exam_check->execute();
            if ($exam_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Exam not found'];
            }
            
            // Check if exam has associated results
            $result_check = $conn->prepare("SELECT id FROM results WHERE exam_id = ?");
            $result_check->bind_param("i", $id);
            $result_check->execute();
            if ($result_check->get_result()->num_rows > 0) {
                return ['success' => false, 'message' => 'Cannot delete exam: It has associated results'];
            }
            
            $sql = "DELETE FROM exams WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Exam deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to delete exam: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function getExamsByClass($class_id) {
        global $conn;
        
        try {
            if (!is_numeric($class_id)) {
                return ['success' => false, 'message' => 'Invalid class ID'];
            }
            
            $sql = "SELECT e.*, c.name as class_name 
                    FROM exams e 
                    LEFT JOIN classes c ON e.class_id = c.id 
                    WHERE e.class_id = ? 
                    ORDER BY e.date DESC, e.name ASC";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $class_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $exams = [];
            while ($row = $result->fetch_assoc()) {
                $exams[] = $row;
            }
            
            return ['success' => true, 'data' => $exams];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
} 