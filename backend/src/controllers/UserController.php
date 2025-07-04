<?php
require_once __DIR__ . '/../../config/db.php';

class UserController {
    public static function getAllUsers() {
        global $conn;
        $stmt = $conn->prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
        $stmt->execute();
        $result = $stmt->get_result();
        $users = [];
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        return ['success' => true, 'users' => $users];
    }

    public static function getProfile($user_id) {
        global $conn;
        $stmt = $conn->prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?');
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            return ['success' => true, 'profile' => $row];
        }
        return ['success' => false, 'message' => 'User not found'];
    }

    public static function updateProfile($user_id, $name, $email, $password = null, $profile_picture = null) {
        global $conn;
        // Fetch current user
        $stmt = $conn->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();
        if (!$user) {
            return ['success' => false, 'message' => 'User not found'];
        }
        // Prepare update
        $fields = [];
        $params = [];
        $types = '';
        if ($name) {
            $fields[] = 'name = ?';
            $params[] = $name;
            $types .= 's';
        }
        if ($email) {
            $fields[] = 'email = ?';
            $params[] = $email;
            $types .= 's';
        }
        if ($password) {
            $fields[] = 'password = ?';
            $params[] = password_hash($password, PASSWORD_DEFAULT);
            $types .= 's';
        }
        if ($profile_picture) {
            $fields[] = 'profile_picture = ?';
            $params[] = $profile_picture;
            $types .= 's';
        }
        if (empty($fields)) {
            return ['success' => false, 'message' => 'No fields to update'];
        }
        $params[] = $user_id;
        $types .= 'i';
        $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Profile updated'];
        }
        return ['success' => false, 'message' => 'Update failed'];
    }

    public static function handleProfilePictureUpload($file) {
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            return null;
        }
        $uploadDir = __DIR__ . '/../../public/uploads/profile_pictures/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('profile_', true) . '.' . $ext;
        $targetPath = $uploadDir . $filename;
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            // Return relative path for DB
            return 'uploads/profile_pictures/' . $filename;
        }
        return null;
    }

    public static function getUserSettings($user_id) {
        global $conn;
        $stmt = $conn->prepare('SELECT setting_key, setting_value FROM user_settings WHERE user_id = ?');
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $settings = [];
        while ($row = $result->fetch_assoc()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        return ['success' => true, 'settings' => $settings];
    }

    public static function updateUserSetting($user_id, $key, $value) {
        global $conn;
        $stmt = $conn->prepare('INSERT INTO user_settings (user_id, setting_key, setting_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = ?');
        $stmt->bind_param('isss', $user_id, $key, $value, $value);
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Setting updated'];
        }
        return ['success' => false, 'message' => 'Failed to update setting'];
    }

    public static function deleteUserSetting($user_id, $key) {
        global $conn;
        $stmt = $conn->prepare('DELETE FROM user_settings WHERE user_id = ? AND setting_key = ?');
        $stmt->bind_param('is', $user_id, $key);
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Setting deleted'];
        }
        return ['success' => false, 'message' => 'Failed to delete setting'];
    }
} 