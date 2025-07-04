<?php
require_once __DIR__ . '/../../config/db.php';

class ParentController {
    public static function getAllParents() {
        global $conn;
        $sql = 'SELECT * FROM parents';
        $result = $conn->query($sql);
        $parents = [];
        while ($row = $result->fetch_assoc()) {
            $parents[] = $row;
        }
        return ['success' => true, 'parents' => $parents];
    }

    public static function getParent($id) {
        global $conn;
        $stmt = $conn->prepare('SELECT * FROM parents WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            return ['success' => true, 'parent' => $row];
        }
        return ['success' => false, 'message' => 'Parent not found'];
    }

    public static function createParent($user_id, $student_id) {
        global $conn;
        $stmt = $conn->prepare('INSERT INTO parents (user_id, student_id) VALUES (?, ?)');
        $stmt->bind_param('ii', $user_id, $student_id);
        if ($stmt->execute()) {
            return ['success' => true, 'id' => $conn->insert_id];
        }
        return ['success' => false, 'message' => 'Failed to create parent'];
    }

    public static function updateParent($id, $user_id, $student_id) {
        global $conn;
        $stmt = $conn->prepare('UPDATE parents SET user_id = ?, student_id = ? WHERE id = ?');
        $stmt->bind_param('iii', $user_id, $student_id, $id);
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Parent updated'];
        }
        return ['success' => false, 'message' => 'Failed to update parent'];
    }

    public static function deleteParent($id) {
        global $conn;
        $stmt = $conn->prepare('DELETE FROM parents WHERE id = ?');
        $stmt->bind_param('i', $id);
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Parent deleted'];
        }
        return ['success' => false, 'message' => 'Failed to delete parent'];
    }
} 