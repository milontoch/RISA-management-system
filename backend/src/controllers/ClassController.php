<?php
require_once __DIR__ . '/../../config/db.php';

class ClassController {
    
    // Class methods
    public static function getAllClasses() {
        global $conn;
        
        try {
            $sql = "SELECT * FROM classes ORDER BY name ASC";
            $result = $conn->query($sql);
            
            if (!$result) {
                return ['success' => false, 'message' => 'Database error: ' . $conn->error];
            }
            
            $classes = [];
            while ($row = $result->fetch_assoc()) {
                $classes[] = $row;
            }
            
            return ['success' => true, 'data' => $classes];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function getClassById($id) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid class ID'];
            }
            
            $sql = "SELECT * FROM classes WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                return ['success' => false, 'message' => 'Class not found'];
            }
            
            $class = $result->fetch_assoc();
            return ['success' => true, 'data' => $class];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function createClass($name) {
        global $conn;
        
        try {
            if (empty(trim($name))) {
                return ['success' => false, 'message' => 'Class name is required'];
            }
            
            // Check if class already exists
            $check_sql = "SELECT id FROM classes WHERE name = ?";
            $check_stmt = $conn->prepare($check_sql);
            $check_stmt->bind_param("s", $name);
            $check_stmt->execute();
            if ($check_stmt->get_result()->num_rows > 0) {
                return ['success' => false, 'message' => 'Class already exists'];
            }
            
            $sql = "INSERT INTO classes (name) VALUES (?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('s', $name);
            
            if ($stmt->execute()) {
                $class_id = $conn->insert_id;
                return ['success' => true, 'message' => 'Class created successfully', 'id' => $class_id];
            } else {
                return ['success' => false, 'message' => 'Failed to create class: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function updateClass($id, $name) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid class ID'];
            }
            
            if (empty(trim($name))) {
                return ['success' => false, 'message' => 'Class name is required'];
            }
            
            // Check if class exists
            $class_check = $conn->prepare("SELECT id FROM classes WHERE id = ?");
            $class_check->bind_param("i", $id);
            $class_check->execute();
            if ($class_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Class not found'];
            }
            
            // Check if name already exists (excluding current class)
            $name_check = $conn->prepare("SELECT id FROM classes WHERE name = ? AND id != ?");
            $name_check->bind_param("si", $name, $id);
            $name_check->execute();
            if ($name_check->get_result()->num_rows > 0) {
                return ['success' => false, 'message' => 'Class name already exists'];
            }
            
            $sql = "UPDATE classes SET name = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('si', $name, $id);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Class updated successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to update class: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function deleteClass($id) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid class ID'];
            }
            
            // Check if class exists
            $class_check = $conn->prepare("SELECT id FROM classes WHERE id = ?");
            $class_check->bind_param("i", $id);
            $class_check->execute();
            if ($class_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Class not found'];
            }
            
            // Check if class has students
            $student_check = $conn->prepare("SELECT id FROM students WHERE class_id = ?");
            $student_check->bind_param("i", $id);
            $student_check->execute();
            if ($student_check->get_result()->num_rows > 0) {
                return ['success' => false, 'message' => 'Cannot delete class: It has enrolled students'];
            }
            
            // Check if class has exams
            $exam_check = $conn->prepare("SELECT id FROM exams WHERE class_id = ?");
            $exam_check->bind_param("i", $id);
            $exam_check->execute();
            if ($exam_check->get_result()->num_rows > 0) {
                return ['success' => false, 'message' => 'Cannot delete class: It has scheduled exams'];
            }
            
            $sql = "DELETE FROM classes WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $id);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Class deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to delete class: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    // Section methods
    public static function getAllSections() {
        global $conn;
        
        try {
            $sql = "SELECT s.*, c.name as class_name 
                    FROM sections s 
                    LEFT JOIN classes c ON s.class_id = c.id 
                    ORDER BY c.name ASC, s.name ASC";
            
            $result = $conn->query($sql);
            
            if (!$result) {
                return ['success' => false, 'message' => 'Database error: ' . $conn->error];
            }
            
            $sections = [];
            while ($row = $result->fetch_assoc()) {
                $sections[] = $row;
            }
            
            return ['success' => true, 'data' => $sections];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function getSectionById($id) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid section ID'];
            }
            
            $sql = "SELECT s.*, c.name as class_name 
                    FROM sections s 
                    LEFT JOIN classes c ON s.class_id = c.id 
                    WHERE s.id = ?";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                return ['success' => false, 'message' => 'Section not found'];
            }
            
            $section = $result->fetch_assoc();
            return ['success' => true, 'data' => $section];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function getSectionsByClass($class_id) {
        global $conn;
        
        try {
            if (!is_numeric($class_id)) {
                return ['success' => false, 'message' => 'Invalid class ID'];
            }
            
            $sql = "SELECT s.*, c.name as class_name 
                    FROM sections s 
                    LEFT JOIN classes c ON s.class_id = c.id 
                    WHERE s.class_id = ? 
                    ORDER BY s.name ASC";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $class_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $sections = [];
            while ($row = $result->fetch_assoc()) {
                $sections[] = $row;
            }
            
            return ['success' => true, 'data' => $sections];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function createSection($class_id, $name) {
        global $conn;
        
        try {
            if (!is_numeric($class_id)) {
                return ['success' => false, 'message' => 'Invalid class ID'];
            }
            
            if (empty(trim($name))) {
                return ['success' => false, 'message' => 'Section name is required'];
            }
            
            // Check if class exists
            $class_check = $conn->prepare("SELECT id FROM classes WHERE id = ?");
            $class_check->bind_param("i", $class_id);
            $class_check->execute();
            if ($class_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Class not found'];
            }
            
            // Check if section already exists in this class
            $section_check = $conn->prepare("SELECT id FROM sections WHERE name = ? AND class_id = ?");
            $section_check->bind_param("si", $name, $class_id);
            $section_check->execute();
            if ($section_check->get_result()->num_rows > 0) {
                return ['success' => false, 'message' => 'Section already exists in this class'];
            }
            
            $sql = "INSERT INTO sections (class_id, name) VALUES (?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('is', $class_id, $name);
            
            if ($stmt->execute()) {
                $section_id = $conn->insert_id;
                return ['success' => true, 'message' => 'Section created successfully', 'id' => $section_id];
            } else {
                return ['success' => false, 'message' => 'Failed to create section: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function updateSection($id, $name) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid section ID'];
            }
            
            if (empty(trim($name))) {
                return ['success' => false, 'message' => 'Section name is required'];
            }
            
            // Check if section exists
            $section_check = $conn->prepare("SELECT id, class_id FROM sections WHERE id = ?");
            $section_check->bind_param("i", $id);
            $section_check->execute();
            $section_result = $section_check->get_result();
            
            if ($section_result->num_rows === 0) {
                return ['success' => false, 'message' => 'Section not found'];
            }
            
            $section_data = $section_result->fetch_assoc();
            $class_id = $section_data['class_id'];
            
            // Check if name already exists in the same class (excluding current section)
            $name_check = $conn->prepare("SELECT id FROM sections WHERE name = ? AND class_id = ? AND id != ?");
            $name_check->bind_param("sii", $name, $class_id, $id);
            $name_check->execute();
            if ($name_check->get_result()->num_rows > 0) {
                return ['success' => false, 'message' => 'Section name already exists in this class'];
            }
            
            $sql = "UPDATE sections SET name = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('si', $name, $id);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Section updated successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to update section: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function deleteSection($id) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid section ID'];
            }
            
            // Check if section exists
            $section_check = $conn->prepare("SELECT id FROM sections WHERE id = ?");
            $section_check->bind_param("i", $id);
            $section_check->execute();
            if ($section_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Section not found'];
            }
            
            // Check if section has students
            $student_check = $conn->prepare("SELECT id FROM students WHERE section_id = ?");
            $student_check->bind_param("i", $id);
            $student_check->execute();
            if ($student_check->get_result()->num_rows > 0) {
                return ['success' => false, 'message' => 'Cannot delete section: It has enrolled students'];
            }
            
            $sql = "DELETE FROM sections WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $id);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Section deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to delete section: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
} 