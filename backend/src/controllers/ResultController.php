<?php
require_once __DIR__ . '/../../config/db.php';

class ResultController {
    
    public static function getResultsByStudent($student_id) {
        global $conn;
        
        try {
            if (!is_numeric($student_id)) {
                return ['success' => false, 'message' => 'Invalid student ID'];
            }
            
            $sql = "SELECT r.*, s.roll_number, u.name as student_name, e.name as exam_name, sub.name as subject_name 
                    FROM results r 
                    LEFT JOIN students s ON r.student_id = s.id 
                    LEFT JOIN users u ON s.user_id = u.id 
                    LEFT JOIN exams e ON r.exam_id = e.id 
                    LEFT JOIN subjects sub ON r.subject_id = sub.id 
                    WHERE r.student_id = ? 
                    ORDER BY e.date DESC, sub.name ASC";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $student_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $results = [];
            while ($row = $result->fetch_assoc()) {
                $results[] = $row;
            }
            
            return ['success' => true, 'data' => $results];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function getResultById($id) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid result ID'];
            }
            
            $sql = "SELECT r.*, s.roll_number, u.name as student_name, e.name as exam_name, sub.name as subject_name 
                    FROM results r 
                    LEFT JOIN students s ON r.student_id = s.id 
                    LEFT JOIN users u ON s.user_id = u.id 
                    LEFT JOIN exams e ON r.exam_id = e.id 
                    LEFT JOIN subjects sub ON r.subject_id = sub.id 
                    WHERE r.id = ?";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                return ['success' => false, 'message' => 'Result not found'];
            }
            
            $result_data = $result->fetch_assoc();
            return ['success' => true, 'data' => $result_data];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function createResult($student_id, $exam_id, $subject_id, $marks_obtained, $total_marks) {
        global $conn;
        
        try {
            // Input validation
            if (!is_numeric($student_id)) {
                return ['success' => false, 'message' => 'Invalid student ID'];
            }
            
            if (!is_numeric($exam_id)) {
                return ['success' => false, 'message' => 'Invalid exam ID'];
            }
            
            if (!is_numeric($subject_id)) {
                return ['success' => false, 'message' => 'Invalid subject ID'];
            }
            
            if (!is_numeric($marks_obtained) || $marks_obtained < 0) {
                return ['success' => false, 'message' => 'Invalid marks obtained'];
            }
            
            if (!is_numeric($total_marks) || $total_marks <= 0) {
                return ['success' => false, 'message' => 'Invalid total marks'];
            }
            
            if ($marks_obtained > $total_marks) {
                return ['success' => false, 'message' => 'Marks obtained cannot be greater than total marks'];
            }
            
            // Check if student exists
            $student_check = $conn->prepare("SELECT id FROM students WHERE id = ?");
            $student_check->bind_param("i", $student_id);
            $student_check->execute();
            if ($student_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Student not found'];
            }
            
            // Check if exam exists
            $exam_check = $conn->prepare("SELECT id FROM exams WHERE id = ?");
            $exam_check->bind_param("i", $exam_id);
            $exam_check->execute();
            if ($exam_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Exam not found'];
            }
            
            // Check if subject exists
            $subject_check = $conn->prepare("SELECT id FROM subjects WHERE id = ?");
            $subject_check->bind_param("i", $subject_id);
            $subject_check->execute();
            if ($subject_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Subject not found'];
            }
            
            // Check if result already exists for this student, exam, and subject
            $duplicate_check = $conn->prepare("SELECT id FROM results WHERE student_id = ? AND exam_id = ? AND subject_id = ?");
            $duplicate_check->bind_param("iii", $student_id, $exam_id, $subject_id);
            $duplicate_check->execute();
            if ($duplicate_check->get_result()->num_rows > 0) {
                return ['success' => false, 'message' => 'Result already exists for this student, exam, and subject'];
            }
            
            $sql = "INSERT INTO results (student_id, exam_id, subject_id, marks_obtained, total_marks) VALUES (?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iiidd", $student_id, $exam_id, $subject_id, $marks_obtained, $total_marks);
            
            if ($stmt->execute()) {
                $result_id = $conn->insert_id;
                return ['success' => true, 'message' => 'Result created successfully', 'id' => $result_id];
            } else {
                return ['success' => false, 'message' => 'Failed to create result: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function updateResult($id, $marks_obtained, $total_marks) {
        global $conn;
        
        try {
            // Input validation
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid result ID'];
            }
            
            if (!is_numeric($marks_obtained) || $marks_obtained < 0) {
                return ['success' => false, 'message' => 'Invalid marks obtained'];
            }
            
            if (!is_numeric($total_marks) || $total_marks <= 0) {
                return ['success' => false, 'message' => 'Invalid total marks'];
            }
            
            if ($marks_obtained > $total_marks) {
                return ['success' => false, 'message' => 'Marks obtained cannot be greater than total marks'];
            }
            
            // Check if result exists
            $result_check = $conn->prepare("SELECT id FROM results WHERE id = ?");
            $result_check->bind_param("i", $id);
            $result_check->execute();
            if ($result_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Result not found'];
            }
            
            $sql = "UPDATE results SET marks_obtained = ?, total_marks = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ddi", $marks_obtained, $total_marks, $id);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Result updated successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to update result: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function deleteResult($id) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid result ID'];
            }
            
            // Check if result exists
            $result_check = $conn->prepare("SELECT id FROM results WHERE id = ?");
            $result_check->bind_param("i", $id);
            $result_check->execute();
            if ($result_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Result not found'];
            }
            
            $sql = "DELETE FROM results WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Result deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to delete result: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function getResultsByExam($exam_id) {
        global $conn;
        
        try {
            if (!is_numeric($exam_id)) {
                return ['success' => false, 'message' => 'Invalid exam ID'];
            }
            
            $sql = "SELECT r.*, s.roll_number, u.name as student_name, e.name as exam_name, sub.name as subject_name 
                    FROM results r 
                    LEFT JOIN students s ON r.student_id = s.id 
                    LEFT JOIN users u ON s.user_id = u.id 
                    LEFT JOIN exams e ON r.exam_id = e.id 
                    LEFT JOIN subjects sub ON r.subject_id = sub.id 
                    WHERE r.exam_id = ? 
                    ORDER BY s.roll_number ASC, sub.name ASC";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $exam_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $results = [];
            while ($row = $result->fetch_assoc()) {
                $results[] = $row;
            }
            
            return ['success' => true, 'data' => $results];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function getAllResults() {
        global $conn;
        
        try {
            $sql = "SELECT r.*, s.roll_number, u.name as student_name, e.name as exam_name, sub.name as subject_name 
                    FROM results r 
                    LEFT JOIN students s ON r.student_id = s.id 
                    LEFT JOIN users u ON s.user_id = u.id 
                    LEFT JOIN exams e ON r.exam_id = e.id 
                    LEFT JOIN subjects sub ON r.subject_id = sub.id 
                    ORDER BY e.date DESC, s.roll_number ASC";
            
            $result = $conn->query($sql);
            
            if (!$result) {
                return ['success' => false, 'message' => 'Database error: ' . $conn->error];
            }
            
            $results = [];
            while ($row = $result->fetch_assoc()) {
                $results[] = $row;
            }
            
            return ['success' => true, 'data' => $results];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
} 