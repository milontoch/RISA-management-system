<?php
require_once __DIR__ . '/../../config/db.php';

class TimetableController {
    public static function getAllTimetables() {
        global $conn;
        $sql = 'SELECT * FROM timetable';
        $result = $conn->query($sql);
        $timetables = [];
        while ($row = $result->fetch_assoc()) {
            $timetables[] = $row;
        }
        return ['success' => true, 'timetables' => $timetables];
    }

    public static function getTimetable($id) {
        global $conn;
        $stmt = $conn->prepare('SELECT * FROM timetable WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            return ['success' => true, 'timetable' => $row];
        }
        return ['success' => false, 'message' => 'Timetable entry not found'];
    }

    public static function getTimetableByClass($class_id) {
        global $conn;
        $stmt = $conn->prepare('SELECT * FROM timetable WHERE class_id = ?');
        $stmt->bind_param('i', $class_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $timetables = [];
        while ($row = $result->fetch_assoc()) {
            $timetables[] = $row;
        }
        return ['success' => true, 'timetables' => $timetables];
    }

    public static function createTimetable($class_id, $subject_id, $teacher_id, $day_of_week, $start_time, $end_time) {
        global $conn;
        $stmt = $conn->prepare('INSERT INTO timetable (class_id, subject_id, teacher_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->bind_param('iiisss', $class_id, $subject_id, $teacher_id, $day_of_week, $start_time, $end_time);
        if ($stmt->execute()) {
            return ['success' => true, 'id' => $conn->insert_id];
        }
        return ['success' => false, 'message' => 'Failed to create timetable entry'];
    }

    public static function updateTimetable($id, $class_id, $subject_id, $teacher_id, $day_of_week, $start_time, $end_time) {
        global $conn;
        $stmt = $conn->prepare('UPDATE timetable SET class_id = ?, subject_id = ?, teacher_id = ?, day_of_week = ?, start_time = ?, end_time = ? WHERE id = ?');
        $stmt->bind_param('iiisssi', $class_id, $subject_id, $teacher_id, $day_of_week, $start_time, $end_time, $id);
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Timetable entry updated'];
        }
        return ['success' => false, 'message' => 'Failed to update timetable entry'];
    }

    public static function deleteTimetable($id) {
        global $conn;
        $stmt = $conn->prepare('DELETE FROM timetable WHERE id = ?');
        $stmt->bind_param('i', $id);
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Timetable entry deleted'];
        }
        return ['success' => false, 'message' => 'Failed to delete timetable entry'];
    }
} 