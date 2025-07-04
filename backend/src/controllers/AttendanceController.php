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

    // Check if morning attendance is done for a class (all students have attendance for the date)
    public static function isMorningAttendanceDone($class_id, $date = null) {
        global $conn;
        if (!is_numeric($class_id)) {
            return ['success' => false, 'message' => 'Invalid class ID'];
        }
        if (!$date) {
            $date = date('Y-m-d');
        }
        // Count students in class
        $stmt = $conn->prepare('SELECT COUNT(*) as total FROM students WHERE class_id = ?');
        $stmt->bind_param('i', $class_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $total_students = $row ? (int)$row['total'] : 0;
        if ($total_students === 0) {
            return ['success' => false, 'message' => 'No students in class'];
        }
        // Count attendance records for the date
        $stmt = $conn->prepare('SELECT COUNT(DISTINCT a.student_id) as attended FROM attendance a LEFT JOIN students s ON a.student_id = s.id WHERE s.class_id = ? AND a.date = ?');
        $stmt->bind_param('is', $class_id, $date);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $attended = $row ? (int)$row['attended'] : 0;
        $done = ($attended >= $total_students);
        return ['success' => true, 'done' => $done, 'attended' => $attended, 'total_students' => $total_students];
    }

    // List classes for a teacher/class teacher/admin
    public static function getClassesForTeacher($user_id) {
        global $conn;
        // Get user info
        $stmt = $conn->prepare('SELECT id, role, is_class_teacher, class_teacher_of FROM users WHERE id = ?');
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();
        if (!$user) {
            return ['success' => false, 'message' => 'User not found'];
        }
        if ($user['role'] === 'admin') {
            // Admin: all classes
            $result = $conn->query('SELECT id, name FROM classes');
            $classes = [];
            while ($row = $result->fetch_assoc()) {
                $classes[] = $row;
            }
            return ['success' => true, 'classes' => $classes];
        } elseif ($user['is_class_teacher'] && $user['class_teacher_of']) {
            // Class teacher: their class
            $stmt = $conn->prepare('SELECT id, name FROM classes WHERE id = ?');
            $stmt->bind_param('i', $user['class_teacher_of']);
            $stmt->execute();
            $result = $stmt->get_result();
            $classes = [];
            while ($row = $result->fetch_assoc()) {
                $classes[] = $row;
            }
            return ['success' => true, 'classes' => $classes];
        } elseif ($user['role'] === 'teacher') {
            // Subject teacher: classes from timetable
            $stmt = $conn->prepare('SELECT t.id FROM teachers t WHERE t.user_id = ?');
            $stmt->bind_param('i', $user_id);
            $stmt->execute();
            $teacher = $stmt->get_result()->fetch_assoc();
            if (!$teacher) {
                return ['success' => false, 'message' => 'Teacher record not found'];
            }
            $teacher_id = $teacher['id'];
            $stmt = $conn->prepare('SELECT DISTINCT c.id, c.name FROM timetable tt LEFT JOIN classes c ON tt.class_id = c.id WHERE tt.teacher_id = ?');
            $stmt->bind_param('i', $teacher_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $classes = [];
            while ($row = $result->fetch_assoc()) {
                $classes[] = $row;
            }
            return ['success' => true, 'classes' => $classes];
        }
        return ['success' => false, 'message' => 'User is not a teacher or admin'];
    }
} 