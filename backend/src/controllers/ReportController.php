<?php
require_once __DIR__ . '/../../config/db.php';

class ReportController {
    public static function attendanceReport($class_id, $start_date, $end_date) {
        global $conn;
        $stmt = $conn->prepare('
            SELECT s.id AS student_id, s.roll_number, u.name, 
                SUM(a.status = "present") AS presents,
                SUM(a.status = "absent") AS absents,
                SUM(a.status = "late") AS lates,
                COUNT(a.id) AS total
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN attendance a ON a.student_id = s.id AND a.date BETWEEN ? AND ?
            WHERE s.class_id = ?
            GROUP BY s.id, u.name, s.roll_number
        ');
        $stmt->bind_param('ssi', $start_date, $end_date, $class_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $report = [];
        while ($row = $result->fetch_assoc()) {
            $report[] = $row;
        }
        return ['success' => true, 'attendance' => $report];
    }

    public static function examPerformanceReport($class_id, $exam_id) {
        global $conn;
        $stmt = $conn->prepare('
            SELECT sub.name AS subject, 
                AVG(r.marks_obtained) AS average_marks,
                MAX(r.marks_obtained) AS highest_marks,
                MIN(r.marks_obtained) AS lowest_marks
            FROM results r
            JOIN students s ON r.student_id = s.id
            JOIN subjects sub ON r.subject_id = sub.id
            WHERE s.class_id = ? AND r.exam_id = ?
            GROUP BY r.subject_id
        ');
        $stmt->bind_param('ii', $class_id, $exam_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $report = [];
        while ($row = $result->fetch_assoc()) {
            $report[] = $row;
        }
        return ['success' => true, 'performance' => $report];
    }
} 