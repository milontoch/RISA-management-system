<?php
require_once __DIR__ . '/../../config/db.php';

class DocumentController {
    public static function uploadDocument($file, $user_id = null, $class_id = null, $subject_id = null, $type = null, $description = null) {
        global $conn;
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => 'File upload error'];
        }
        $uploadDir = __DIR__ . '/../../public/uploads/documents/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        $filename = uniqid('doc_', true) . '_' . basename($file['name']);
        $targetPath = $uploadDir . $filename;
        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            return ['success' => false, 'message' => 'Failed to move uploaded file'];
        }
        $file_path = 'uploads/documents/' . $filename;
        $stmt = $conn->prepare('INSERT INTO documents (user_id, class_id, subject_id, file_path, file_name, type, description) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $stmt->bind_param('iiissss', $user_id, $class_id, $subject_id, $file_path, $file['name'], $type, $description);
        if ($stmt->execute()) {
            return ['success' => true, 'id' => $conn->insert_id, 'file_path' => $file_path];
        }
        return ['success' => false, 'message' => 'Failed to save document record'];
    }

    public static function listDocuments($user_id = null, $class_id = null, $subject_id = null) {
        global $conn;
        $where = [];
        $params = [];
        $types = '';
        if ($user_id) { $where[] = 'user_id = ?'; $params[] = $user_id; $types .= 'i'; }
        if ($class_id) { $where[] = 'class_id = ?'; $params[] = $class_id; $types .= 'i'; }
        if ($subject_id) { $where[] = 'subject_id = ?'; $params[] = $subject_id; $types .= 'i'; }
        $sql = 'SELECT * FROM documents';
        if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
        $stmt = $conn->prepare($sql);
        if ($where) $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        $docs = [];
        while ($row = $result->fetch_assoc()) $docs[] = $row;
        return ['success' => true, 'documents' => $docs];
    }

    public static function downloadDocument($id) {
        global $conn;
        $stmt = $conn->prepare('SELECT file_path, file_name FROM documents WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            $fullPath = __DIR__ . '/../../public/' . $row['file_path'];
            if (file_exists($fullPath)) {
                header('Content-Description: File Transfer');
                header('Content-Type: application/octet-stream');
                header('Content-Disposition: attachment; filename="' . basename($row['file_name']) . '"');
                header('Expires: 0');
                header('Cache-Control: must-revalidate');
                header('Pragma: public');
                header('Content-Length: ' . filesize($fullPath));
                readfile($fullPath);
                exit;
            }
        }
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'File not found']);
        exit;
    }

    public static function deleteDocument($id) {
        global $conn;
        $stmt = $conn->prepare('SELECT file_path FROM documents WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            $fullPath = __DIR__ . '/../../public/' . $row['file_path'];
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }
        }
        $stmt2 = $conn->prepare('DELETE FROM documents WHERE id = ?');
        $stmt2->bind_param('i', $id);
        if ($stmt2->execute()) {
            return ['success' => true, 'message' => 'Document deleted'];
        }
        return ['success' => false, 'message' => 'Failed to delete document'];
    }
} 