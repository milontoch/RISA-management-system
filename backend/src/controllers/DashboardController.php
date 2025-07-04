<?php
require_once __DIR__ . '/../../config/db.php';

class DashboardController {
    public static function getAdminDashboard() {
        global $conn;
        $stats = [];
        // Count students
        $result = $conn->query('SELECT COUNT(*) as count FROM students');
        $stats['total_students'] = $result->fetch_assoc()['count'];
        // Count teachers
        $result = $conn->query('SELECT COUNT(*) as count FROM teachers');
        $stats['total_teachers'] = $result->fetch_assoc()['count'];
        // Count classes
        $result = $conn->query('SELECT COUNT(*) as count FROM classes');
        $stats['total_classes'] = $result->fetch_assoc()['count'];
        // Recent notifications
        $result = $conn->query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5');
        $recent_notifications = [];
        while ($row = $result->fetch_assoc()) $recent_notifications[] = $row;
        return ['success' => true, 'stats' => $stats, 'recent_notifications' => $recent_notifications];
    }

    public static function getTeacherDashboard($teacher_id) {
        global $conn;
        $stats = [];
        // Get teacher's subjects
        $stmt = $conn->prepare('SELECT s.name FROM teachers t JOIN subjects s ON t.subject_id = s.id WHERE t.id = ?');
        $stmt->bind_param('i', $teacher_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $subjects = [];
        while ($row = $result->fetch_assoc()) $subjects[] = $row['name'];
        // Count students in teacher's classes (simplified)
        $result = $conn->query('SELECT COUNT(*) as count FROM students');
        $stats['total_students'] = $result->fetch_assoc()['count'];
        // Recent attendance
        $result = $conn->query('SELECT * FROM attendance ORDER BY date DESC LIMIT 10');
        $recent_attendance = [];
        while ($row = $result->fetch_assoc()) $recent_attendance[] = $row;
        return ['success' => true, 'subjects' => $subjects, 'stats' => $stats, 'recent_attendance' => $recent_attendance];
    }

    public static function getStudentDashboard($student_id) {
        global $conn;
        $stats = [];
        // Get student info
        $stmt = $conn->prepare('SELECT s.*, u.name, c.name as class_name FROM students s JOIN users u ON s.user_id = u.id LEFT JOIN classes c ON s.class_id = c.id WHERE s.id = ?');
        $stmt->bind_param('i', $student_id);
        $stmt->execute();
        $student_info = $stmt->get_result()->fetch_assoc();
        // Recent attendance
        $stmt = $conn->prepare('SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 5');
        $stmt->bind_param('i', $student_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $recent_attendance = [];
        while ($row = $result->fetch_assoc()) $recent_attendance[] = $row;
        // Recent results
        $stmt = $conn->prepare('SELECT r.*, e.name as exam_name FROM results r JOIN exams e ON r.exam_id = e.id WHERE r.student_id = ? ORDER BY r.id DESC LIMIT 5');
        $stmt->bind_param('i', $student_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $recent_results = [];
        while ($row = $result->fetch_assoc()) $recent_results[] = $row;
        return ['success' => true, 'student_info' => $student_info, 'recent_attendance' => $recent_attendance, 'recent_results' => $recent_results];
    }

    public static function getParentDashboard($parent_id) {
        global $conn;
        // Get parent's students
        $stmt = $conn->prepare('SELECT s.*, u.name as student_name FROM parents p JOIN students s ON p.student_id = s.id JOIN users u ON s.user_id = u.id WHERE p.user_id = ?');
        $stmt->bind_param('i', $parent_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $students = [];
        while ($row = $result->fetch_assoc()) $students[] = $row;
        // Recent notifications
        $stmt = $conn->prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5');
        $stmt->bind_param('i', $parent_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $recent_notifications = [];
        while ($row = $result->fetch_assoc()) $recent_notifications[] = $row;
        return ['success' => true, 'students' => $students, 'recent_notifications' => $recent_notifications];
    }
} 