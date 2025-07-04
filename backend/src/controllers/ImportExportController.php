<?php
require_once __DIR__ . '/../../config/db.php';

class ImportExportController {
    // Students
    public static function importStudents($csvFile) {
        global $conn;
        $handle = fopen($csvFile, 'r');
        $header = fgetcsv($handle);
        $count = 0;
        while (($row = fgetcsv($handle)) !== false) {
            $data = array_combine($header, $row);
            $stmt = $conn->prepare('INSERT INTO students (user_id, class_id, section_id, roll_number) VALUES (?, ?, ?, ?)');
            $stmt->bind_param('iiis', $data['user_id'], $data['class_id'], $data['section_id'], $data['roll_number']);
            if ($stmt->execute()) $count++;
        }
        fclose($handle);
        return ['success' => true, 'imported' => $count];
    }
    public static function exportStudents() {
        global $conn;
        $result = $conn->query('SELECT * FROM students');
        $csv = fopen('php://temp', 'w+');
        $header = ['id', 'user_id', 'class_id', 'section_id', 'roll_number'];
        fputcsv($csv, $header);
        while ($row = $result->fetch_assoc()) fputcsv($csv, $row);
        rewind($csv);
        $data = stream_get_contents($csv);
        fclose($csv);
        return $data;
    }
    // Teachers
    public static function importTeachers($csvFile) {
        global $conn;
        $handle = fopen($csvFile, 'r');
        $header = fgetcsv($handle);
        $count = 0;
        while (($row = fgetcsv($handle)) !== false) {
            $data = array_combine($header, $row);
            $stmt = $conn->prepare('INSERT INTO teachers (user_id, subject_id) VALUES (?, ?)');
            $stmt->bind_param('ii', $data['user_id'], $data['subject_id']);
            if ($stmt->execute()) $count++;
        }
        fclose($handle);
        return ['success' => true, 'imported' => $count];
    }
    public static function exportTeachers() {
        global $conn;
        $result = $conn->query('SELECT * FROM teachers');
        $csv = fopen('php://temp', 'w+');
        $header = ['id', 'user_id', 'subject_id'];
        fputcsv($csv, $header);
        while ($row = $result->fetch_assoc()) fputcsv($csv, $row);
        rewind($csv);
        $data = stream_get_contents($csv);
        fclose($csv);
        return $data;
    }
    // Classes
    public static function importClasses($csvFile) {
        global $conn;
        $handle = fopen($csvFile, 'r');
        $header = fgetcsv($handle);
        $count = 0;
        while (($row = fgetcsv($handle)) !== false) {
            $data = array_combine($header, $row);
            $stmt = $conn->prepare('INSERT INTO classes (name) VALUES (?)');
            $stmt->bind_param('s', $data['name']);
            if ($stmt->execute()) $count++;
        }
        fclose($handle);
        return ['success' => true, 'imported' => $count];
    }
    public static function exportClasses() {
        global $conn;
        $result = $conn->query('SELECT * FROM classes');
        $csv = fopen('php://temp', 'w+');
        $header = ['id', 'name'];
        fputcsv($csv, $header);
        while ($row = $result->fetch_assoc()) fputcsv($csv, $row);
        rewind($csv);
        $data = stream_get_contents($csv);
        fclose($csv);
        return $data;
    }
    // Subjects
    public static function importSubjects($csvFile) {
        global $conn;
        $handle = fopen($csvFile, 'r');
        $header = fgetcsv($handle);
        $count = 0;
        while (($row = fgetcsv($handle)) !== false) {
            $data = array_combine($header, $row);
            $stmt = $conn->prepare('INSERT INTO subjects (name) VALUES (?)');
            $stmt->bind_param('s', $data['name']);
            if ($stmt->execute()) $count++;
        }
        fclose($handle);
        return ['success' => true, 'imported' => $count];
    }
    public static function exportSubjects() {
        global $conn;
        $result = $conn->query('SELECT * FROM subjects');
        $csv = fopen('php://temp', 'w+');
        $header = ['id', 'name'];
        fputcsv($csv, $header);
        while ($row = $result->fetch_assoc()) fputcsv($csv, $row);
        rewind($csv);
        $data = stream_get_contents($csv);
        fclose($csv);
        return $data;
    }
    // Parents
    public static function importParents($csvFile) {
        global $conn;
        $handle = fopen($csvFile, 'r');
        $header = fgetcsv($handle);
        $count = 0;
        while (($row = fgetcsv($handle)) !== false) {
            $data = array_combine($header, $row);
            $stmt = $conn->prepare('INSERT INTO parents (user_id, student_id) VALUES (?, ?)');
            $stmt->bind_param('ii', $data['user_id'], $data['student_id']);
            if ($stmt->execute()) $count++;
        }
        fclose($handle);
        return ['success' => true, 'imported' => $count];
    }
    public static function exportParents() {
        global $conn;
        $result = $conn->query('SELECT * FROM parents');
        $csv = fopen('php://temp', 'w+');
        $header = ['id', 'user_id', 'student_id'];
        fputcsv($csv, $header);
        while ($row = $result->fetch_assoc()) fputcsv($csv, $row);
        rewind($csv);
        $data = stream_get_contents($csv);
        fclose($csv);
        return $data;
    }
} 