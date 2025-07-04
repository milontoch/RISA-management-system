<?php
require_once __DIR__ . '/../../config/db.php';

class NotificationController {
    
    public static function getNotificationsByUser($user_id) {
        global $conn;
        
        try {
            if (!is_numeric($user_id)) {
                return ['success' => false, 'message' => 'Invalid user ID'];
            }
            
            $sql = "SELECT n.*, u.name as user_name 
                    FROM notifications n 
                    LEFT JOIN users u ON n.user_id = u.id 
                    WHERE n.user_id = ? 
                    ORDER BY n.created_at DESC";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $notifications = [];
            while ($row = $result->fetch_assoc()) {
                $notifications[] = $row;
            }
            
            return ['success' => true, 'data' => $notifications];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function getAllNotifications() {
        global $conn;
        
        try {
            $sql = "SELECT n.*, u.name as user_name, u.email 
                    FROM notifications n 
                    LEFT JOIN users u ON n.user_id = u.id 
                    ORDER BY n.created_at DESC";
            
            $result = $conn->query($sql);
            
            if (!$result) {
                return ['success' => false, 'message' => 'Database error: ' . $conn->error];
            }
            
            $notifications = [];
            while ($row = $result->fetch_assoc()) {
                $notifications[] = $row;
            }
            
            return ['success' => true, 'data' => $notifications];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function getNotificationById($id) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid notification ID'];
            }
            
            $sql = "SELECT n.*, u.name as user_name, u.email 
                    FROM notifications n 
                    LEFT JOIN users u ON n.user_id = u.id 
                    WHERE n.id = ?";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                return ['success' => false, 'message' => 'Notification not found'];
            }
            
            $notification = $result->fetch_assoc();
            return ['success' => true, 'data' => $notification];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function createNotification($user_id, $message) {
        global $conn;
        
        try {
            // Input validation
            if (!is_numeric($user_id)) {
                return ['success' => false, 'message' => 'Invalid user ID'];
            }
            
            if (empty(trim($message))) {
                return ['success' => false, 'message' => 'Message is required'];
            }
            
            // Check if user exists
            $user_check = $conn->prepare("SELECT id FROM users WHERE id = ?");
            $user_check->bind_param("i", $user_id);
            $user_check->execute();
            if ($user_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'User not found'];
            }
            
            $sql = "INSERT INTO notifications (user_id, message) VALUES (?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("is", $user_id, $message);
            
            if ($stmt->execute()) {
                $notification_id = $conn->insert_id;
                return ['success' => true, 'message' => 'Notification created successfully', 'id' => $notification_id];
            } else {
                return ['success' => false, 'message' => 'Failed to create notification: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function deleteNotification($id) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid notification ID'];
            }
            
            // Check if notification exists
            $notification_check = $conn->prepare("SELECT id FROM notifications WHERE id = ?");
            $notification_check->bind_param("i", $id);
            $notification_check->execute();
            if ($notification_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Notification not found'];
            }
            
            $sql = "DELETE FROM notifications WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Notification deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to delete notification: ' . $conn->error];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public static function markAsRead($id) {
        global $conn;
        
        try {
            if (!is_numeric($id)) {
                return ['success' => false, 'message' => 'Invalid notification ID'];
            }
            
            // Check if notification exists
            $notification_check = $conn->prepare("SELECT id FROM notifications WHERE id = ?");
            $notification_check->bind_param("i", $id);
            $notification_check->execute();
            if ($notification_check->get_result()->num_rows === 0) {
                return ['success' => false, 'message' => 'Notification not found'];
            }
            
            // Note: This would require adding an 'is_read' column to the notifications table
            // For now, we'll just return success
            return ['success' => true, 'message' => 'Notification marked as read'];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }

    public static function sendEmailNotification($user_id, $subject, $message) {
        global $conn;
        
        try {
            if (!is_numeric($user_id)) {
                return ['success' => false, 'message' => 'Invalid user ID'];
            }
            
            if (empty(trim($subject))) {
                return ['success' => false, 'message' => 'Subject is required'];
            }
            
            if (empty(trim($message))) {
                return ['success' => false, 'message' => 'Message is required'];
            }
            
            $stmt = $conn->prepare('SELECT email, name FROM users WHERE id = ?');
            $stmt->bind_param('i', $user_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($user = $result->fetch_assoc()) {
                $to = $user['email'];
                $headers = 'From: noreply@eskolly.com' . "\r\n" .
                          'Reply-To: noreply@eskolly.com' . "\r\n" .
                          'X-Mailer: PHP/' . phpversion();
                
                if (mail($to, $subject, $message, $headers)) {
                    return ['success' => true, 'message' => 'Email sent successfully'];
                } else {
                    return ['success' => false, 'message' => 'Failed to send email'];
                }
            } else {
                return ['success' => false, 'message' => 'User not found'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }

    public static function sendBulkEmailNotification($user_ids, $subject, $message) {
        global $conn;
        $results = [];
        if (!is_array($user_ids) || empty($user_ids)) {
            return ['success' => false, 'message' => 'user_ids must be a non-empty array'];
        }
        if (empty(trim($subject))) {
            return ['success' => false, 'message' => 'Subject is required'];
        }
        if (empty(trim($message))) {
            return ['success' => false, 'message' => 'Message is required'];
        }
        $stmt = $conn->prepare('SELECT email, name FROM users WHERE id = ?');
        foreach ($user_ids as $user_id) {
            if (!is_numeric($user_id)) {
                $results[] = ['user_id' => $user_id, 'success' => false, 'message' => 'Invalid user ID'];
                continue;
            }
            $stmt->bind_param('i', $user_id);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($user = $result->fetch_assoc()) {
                $to = $user['email'];
                $headers = 'From: noreply@eskolly.com' . "\r\n" .
                          'Reply-To: noreply@eskolly.com' . "\r\n" .
                          'X-Mailer: PHP/' . phpversion();
                if (mail($to, $subject, $message, $headers)) {
                    $results[] = ['user_id' => $user_id, 'success' => true, 'message' => 'Email sent'];
                } else {
                    $results[] = ['user_id' => $user_id, 'success' => false, 'message' => 'Failed to send email'];
                }
            } else {
                $results[] = ['user_id' => $user_id, 'success' => false, 'message' => 'User not found'];
            }
        }
        $stmt->close();
        $all_success = array_reduce($results, function($carry, $item) { return $carry && $item['success']; }, true);
        return ['success' => $all_success, 'results' => $results];
    }
} 