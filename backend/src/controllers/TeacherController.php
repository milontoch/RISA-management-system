<?php
require_once __DIR__ . '/../../config/db.php';

class TeacherController {
    
    public static function getAllTeachers() {
        global $conn;
        
        try {
            $sql = "SELECT DISTINCT t.id, t.user_id, u.name, u.email, u.role, u.created_at,
                           GROUP_CONCAT(s.name ORDER BY s.name SEPARATOR ', ') as subjects,
                           GROUP_CONCAT(s.id ORDER BY s.id SEPARATOR ',') as subject_ids
                    FROM teachers t 
                    LEFT JOIN users u ON t.user_id = u.id 
                    LEFT JOIN teacher_subjects ts ON t.id = ts.teacher_id 
                    LEFT JOIN subjects s ON ts.subject_id = s.id 
                    GROUP BY t.id, t.user_id, u.name, u.email, u.role, u.created_at
                    ORDER BY t.id DESC";
            
            $result = $conn->query($sql);
            
            if (!$result) {
                return ['success' => false, 'message' => 'Database error: ' . $conn->error];
            }
            
            $teachers = [];
            while ($row = $result->fetch_assoc()) {
                // Convert subject_ids string to array
                $row['subject_ids'] = $row['subject_ids'] ? explode(',', $row['subject_ids']) : [];
                $teachers[] = $row;
            }
            
            return ['success' => true, 'data' => $teachers];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function getTeacherById($id) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid teacher ID'];
            }
            
            $sql = "SELECT t.id, t.user_id, u.name, u.email, u.role, u.created_at,
                           GROUP_CONCAT(s.name ORDER BY s.name SEPARATOR ', ') as subjects,
                           GROUP_CONCAT(s.id ORDER BY s.id SEPARATOR ',') as subject_ids
                    FROM teachers t 
                    LEFT JOIN users u ON t.user_id = u.id 
                    LEFT JOIN teacher_subjects ts ON t.id = ts.teacher_id 
                    LEFT JOIN subjects s ON ts.subject_id = s.id 
                    WHERE t.id = ?
                    GROUP BY t.id, t.user_id, u.name, u.email, u.role, u.created_at";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                return ['success' => false, 'message' => 'Teacher not found'];
            }
            
            $teacher = $result->fetch_assoc();
            // Convert subject_ids string to array
            $teacher['subject_ids'] = $teacher['subject_ids'] ? explode(',', $teacher['subject_ids']) : [];
            
            return ['success' => true, 'data' => $teacher];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function createTeacher($user_id, $subject_ids = []) {
        global $conn;
        
        try {
            // Input validation
            if (!is_numeric($user_id)) {
                return ['success' => false, 'message' => 'Invalid user ID'];
            }
            
            if (empty($subject_ids) || !is_array($subject_ids)) {
                return ['success' => false, 'message' => 'At least one subject ID is required'];
            }
            
            // Check if user exists and is a teacher
            $user_check = $conn->prepare("SELECT id FROM users WHERE id = ? AND role = 'teacher'");
            $user_check->bind_param("i", $user_id);
            $user_check->execute();
            if ($user_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'User not found or not a teacher'];
            }
            
            // Check if all subjects exist
            foreach ($subject_ids as $subject_id) {
                if (!is_numeric($subject_id) || $subject_id <= 0) {
                    return ['success' => false, 'message' => 'Invalid subject ID: ' . $subject_id];
                }
                
                $subject_check = $conn->prepare("SELECT id FROM subjects WHERE id = ?");
                $subject_check->bind_param("i", $subject_id);
                $subject_check->execute();
                if ($subject_check->get_result()->num_rows === 0) {
                    return ['success' => false, 'message' => 'Subject not found: ' . $subject_id];
                }
            }
            
            // Check if teacher already exists for this user
            $teacher_check = $conn->prepare("SELECT id FROM teachers WHERE user_id = ?");
            $teacher_check->bind_param("i", $user_id);
            $teacher_check->execute();
            if ($teacher_check->get_result()->num_rows > 0) {
                return ['success' => false, 'message' => 'Teacher record already exists for this user'];
            }
            
            // Start transaction
            $conn->begin_transaction();
            
            // Create teacher record
            $sql = "INSERT INTO teachers (user_id) VALUES (?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $user_id);
            
            if (!$stmt->execute()) {
                $conn->rollback();
                return ['success' => false, 'message' => 'Failed to create teacher: ' . $conn->error];
            }
            
            $teacher_id = $conn->insert_id;
            
            // Add subject assignments
            foreach ($subject_ids as $subject_id) {
                $sql = "INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES (?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ii", $teacher_id, $subject_id);
                
                if (!$stmt->execute()) {
                    $conn->rollback();
                    return ['success' => false, 'message' => 'Failed to assign subject: ' . $conn->error];
                }
            }
            
            $conn->commit();
            return ['success' => true, 'message' => 'Teacher created successfully', 'id' => $teacher_id];
            
        } catch (Exception $e) {
            if ($conn->connect_errno === 0) {
                $conn->rollback();
            }
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function updateTeacher($id, $subject_ids = []) {
        global $conn;
        
        try {
            // Input validation
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid teacher ID'];
            }
            
            if (!is_array($subject_ids)) {
                return ['success' => false, 'message' => 'Subject IDs must be an array'];
            }
            
            // Check if teacher exists
            $teacher_check = $conn->prepare("SELECT id FROM teachers WHERE id = ?");
            $teacher_check->bind_param("i", $id);
            $teacher_check->execute();
            if ($teacher_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Teacher not found'];
            }
            
            // Check if all subjects exist
            foreach ($subject_ids as $subject_id) {
                if (!is_numeric($subject_id) || $subject_id <= 0) {
                    return ['success' => false, 'message' => 'Invalid subject ID: ' . $subject_id];
                }
                
                $subject_check = $conn->prepare("SELECT id FROM subjects WHERE id = ?");
                $subject_check->bind_param("i", $subject_id);
                $subject_check->execute();
                if ($subject_check->get_result()->num_rows === 0) {
                    return ['success' => false, 'message' => 'Subject not found: ' . $subject_id];
                }
            }
            
            // Start transaction
            $conn->begin_transaction();
            
            // Remove all existing subject assignments
            $sql = "DELETE FROM teacher_subjects WHERE teacher_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            
            // Add new subject assignments
            foreach ($subject_ids as $subject_id) {
                $sql = "INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES (?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ii", $id, $subject_id);
                
                if (!$stmt->execute()) {
                    $conn->rollback();
                    return ['success' => false, 'message' => 'Failed to assign subject: ' . $conn->error];
                }
            }
            
            $conn->commit();
            return ['success' => true, 'message' => 'Teacher updated successfully'];
            
        } catch (Exception $e) {
            if ($conn->connect_errno === 0) {
                $conn->rollback();
            }
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function deleteTeacher($id) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid teacher ID'];
            }
            
            // Check if teacher exists
            $teacher_check = $conn->prepare("SELECT id FROM teachers WHERE id = ?");
            $teacher_check->bind_param("i", $id);
            $teacher_check->execute();
            if ($teacher_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Teacher not found'];
            }
            
            // Start transaction
            $conn->begin_transaction();
            
            // Delete teacher_subjects records (cascade will handle this, but being explicit)
            $sql = "DELETE FROM teacher_subjects WHERE teacher_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            
            // Delete teacher record
            $sql = "DELETE FROM teachers WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            
            if (!$stmt->execute()) {
                $conn->rollback();
                return ['success' => false, 'message' => 'Failed to delete teacher: ' . $conn->error];
            }
            
            $conn->commit();
            return ['success' => true, 'message' => 'Teacher deleted successfully'];
            
        } catch (Exception $e) {
            if ($conn->connect_errno === 0) {
                $conn->rollback();
            }
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function getTeachersBySubject($subject_id) {
        global $conn;
        
        try {
            if (!is_numeric($subject_id)) {
                return ['success' => false, 'message' => 'Invalid subject ID'];
            }
            
            $sql = "SELECT t.id, t.user_id, u.name, u.email, u.role, u.created_at,
                           s.name as subject_name, s.id as subject_id
                    FROM teachers t 
                    LEFT JOIN users u ON t.user_id = u.id 
                    JOIN teacher_subjects ts ON t.id = ts.teacher_id 
                    JOIN subjects s ON ts.subject_id = s.id 
                    WHERE ts.subject_id = ? 
                    ORDER BY u.name ASC";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $subject_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $teachers = [];
            while ($row = $result->fetch_assoc()) {
                $teachers[] = $row;
            }
            
            return ['success' => true, 'data' => $teachers];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function addSubjectToTeacher($teacher_id, $subject_id) {
        global $conn;
        
        try {
            if (!is_numeric($teacher_id)) {
                return ['success' => false, 'message' => 'Invalid teacher ID'];
            }
            
            if (!is_numeric($subject_id) || $subject_id <= 0) {
                return ['success' => false, 'message' => 'Invalid subject ID'];
            }
            
            // Check if teacher exists
            $teacher_check = $conn->prepare("SELECT id FROM teachers WHERE id = ?");
            $teacher_check->bind_param("i", $teacher_id);
            $teacher_check->execute();
            if ($teacher_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Teacher not found'];
            }
            
            // Check if subject exists
            $subject_check = $conn->prepare("SELECT id FROM subjects WHERE id = ?");
            $subject_check->bind_param("i", $subject_id);
            $subject_check->execute();
            if ($subject_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Subject not found'];
            }
            
            // Check if assignment already exists
            $assignment_check = $conn->prepare("SELECT id FROM teacher_subjects WHERE teacher_id = ? AND subject_id = ?");
            $assignment_check->bind_param("ii", $teacher_id, $subject_id);
            $assignment_check->execute();
            if ($assignment_check->get_result()->num_rows > 0) {
                return ['success' => false, 'message' => 'Teacher is already assigned to this subject'];
            }
            
            // Add subject assignment
            $sql = "INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES (?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ii", $teacher_id, $subject_id);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Subject assigned to teacher successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to assign subject: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function removeSubjectFromTeacher($teacher_id, $subject_id) {
        global $conn;
        
        try {
            if (!is_numeric($teacher_id)) {
                return ['success' => false, 'message' => 'Invalid teacher ID'];
            }
            
            if (!is_numeric($subject_id) || $subject_id <= 0) {
                return ['success' => false, 'message' => 'Invalid subject ID'];
            }
            
            // Check if assignment exists
            $assignment_check = $conn->prepare("SELECT id FROM teacher_subjects WHERE teacher_id = ? AND subject_id = ?");
            $assignment_check->bind_param("ii", $teacher_id, $subject_id);
            $assignment_check->execute();
            if ($assignment_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Teacher is not assigned to this subject'];
            }
            
            // Remove subject assignment
            $sql = "DELETE FROM teacher_subjects WHERE teacher_id = ? AND subject_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ii", $teacher_id, $subject_id);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Subject removed from teacher successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to remove subject: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
} 