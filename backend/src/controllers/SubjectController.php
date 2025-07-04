<?php
require_once __DIR__ . '/../../config/db.php';

class SubjectController {
    
    public static function getAllSubjects() {
        global $conn;
        
        try {
            $sql = "SELECT * FROM subjects ORDER BY name ASC";
            $result = $conn->query($sql);
            
            if (!$result) {
                return ['success' => false, 'message' => 'Database error: ' . $conn->error];
            }
            
            $subjects = [];
            while ($row = $result->fetch_assoc()) {
                $subjects[] = $row;
            }
            
            return ['success' => true, 'data' => $subjects];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function getSubjectById($id) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid subject ID'];
            }
            
            $sql = "SELECT * FROM subjects WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                return ['success' => false, 'message' => 'Subject not found'];
            }
            
            $subject = $result->fetch_assoc();
            return ['success' => true, 'data' => $subject];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function createSubject($name) {
        global $conn;
        
        try {
            if (empty(trim($name))) {
                return ['success' => false, 'message' => 'Subject name is required'];
            }
            
            // Check if subject already exists
            $check_sql = "SELECT id FROM subjects WHERE name = ?";
            $check_stmt = $conn->prepare($check_sql);
            $check_stmt->bind_param("s", $name);
            $check_stmt->execute();
            if ($check_stmt->get_result()->num_rows > 0) {
                return ['success' => false, 'message' => 'Subject already exists'];
            }
            
            $sql = "INSERT INTO subjects (name) VALUES (?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $name);
            
            if ($stmt->execute()) {
                $subject_id = $conn->insert_id;
                return ['success' => true, 'message' => 'Subject created successfully', 'id' => $subject_id];
            } else {
                return ['success' => false, 'message' => 'Failed to create subject: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function updateSubject($id, $name) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid subject ID'];
            }
            
            if (empty(trim($name))) {
                return ['success' => false, 'message' => 'Subject name is required'];
            }
            
            // Check if subject exists
            $subject_check = $conn->prepare("SELECT id FROM subjects WHERE id = ?");
            $subject_check->bind_param("i", $id);
            $subject_check->execute();
            if ($subject_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Subject not found'];
            }
            
            // Check if name already exists (excluding current subject)
            $name_check = $conn->prepare("SELECT id FROM subjects WHERE name = ? AND id != ?");
            $name_check->bind_param("si", $name, $id);
            $name_check->execute();
            if ($name_check->get_result()->num_rows > 0) {
                return ['success' => false, 'message' => 'Subject name already exists'];
            }
            
            $sql = "UPDATE subjects SET name = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("si", $name, $id);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Subject updated successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to update subject: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function deleteSubject($id) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid subject ID'];
            }
            
            // Check if subject exists
            $subject_check = $conn->prepare("SELECT id FROM subjects WHERE id = ?");
            $subject_check->bind_param("i", $id);
            $subject_check->execute();
            if ($subject_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Subject not found'];
            }
            
            // Check if subject is being used by teachers
            $teacher_check = $conn->prepare("SELECT id FROM teachers WHERE subject_id = ?");
            $teacher_check->bind_param("i", $id);
            $teacher_check->execute();
            if ($teacher_check->get_result()->num_rows > 0) {
                return ['success' => false, 'message' => 'Cannot delete subject: It is assigned to teachers'];
            }
            
            // Check if subject is being used in results
            $result_check = $conn->prepare("SELECT id FROM results WHERE subject_id = ?");
            $result_check->bind_param("i", $id);
            $result_check->execute();
            if ($result_check->get_result()->num_rows > 0) {
                return ['success' => false, 'message' => 'Cannot delete subject: It has associated results'];
            }
            
            $sql = "DELETE FROM subjects WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Subject deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to delete subject: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
} 