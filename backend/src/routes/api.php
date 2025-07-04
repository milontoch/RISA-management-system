<?php
// Example: require_once '../controllers/UserController.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/ClassController.php';
require_once __DIR__ . '/../controllers/StudentController.php';
require_once __DIR__ . '/../controllers/TeacherController.php';
require_once __DIR__ . '/../controllers/SubjectController.php';
require_once __DIR__ . '/../controllers/AttendanceController.php';
require_once __DIR__ . '/../controllers/ExamController.php';
require_once __DIR__ . '/../controllers/ResultController.php';
require_once __DIR__ . '/../controllers/FeeController.php';
require_once __DIR__ . '/../controllers/NotificationController.php';
require_once __DIR__ . '/../controllers/UserController.php';
require_once __DIR__ . '/../controllers/ParentController.php';
require_once __DIR__ . '/../controllers/TimetableController.php';
require_once __DIR__ . '/../controllers/MessageController.php';
require_once __DIR__ . '/../controllers/ImportExportController.php';
require_once __DIR__ . '/../controllers/ReportController.php';
require_once __DIR__ . '/../controllers/DocumentController.php';
require_once __DIR__ . '/../controllers/DashboardController.php';
require_once __DIR__ . '/../utils/Auth.php';

function requireAdmin() {
    if (!Auth::isAdmin()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit;
    }
}
function validateFields($fields, $data) {
    foreach ($fields as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            return ['valid' => false, 'message' => "Missing or empty field: $field"];
        }
    }
    return ['valid' => true, 'message' => ''];
}

$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

if (strpos($uri, '/register') !== false && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? '';
    echo json_encode(AuthController::register($name, $email, $password, $role));
    exit;
}

if (strpos($uri, '/login') !== false && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    echo json_encode(AuthController::login($email, $password));
    exit;
}

// Password reset endpoints
if (strpos($uri, '/password-reset/request') !== false && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    echo json_encode(AuthController::requestPasswordReset($email));
    exit;
}
if (strpos($uri, '/password-reset/reset') !== false && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $token = $data['token'] ?? '';
    $new_password = $data['new_password'] ?? '';
    echo json_encode(AuthController::resetPassword($token, $new_password));
    exit;
}

// Classes endpoints
if (strpos($uri, '/classes') !== false) {
    if ($method === 'GET') {
        echo json_encode(ClassController::getAllClasses());
        exit;
    }
    if ($method === 'POST') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        $validation = validateFields(['name'], $data);
        if (!$validation['valid']) {
            echo json_encode(['success' => false, 'message' => $validation['message']]);
            exit;
        }
        $name = $data['name'];
        echo json_encode(ClassController::createClass($name));
        exit;
    }
    if ($method === 'PUT') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? 0;
        $name = $data['name'] ?? '';
        echo json_encode(ClassController::updateClass($id, $name));
        exit;
    }
    if ($method === 'DELETE') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? 0;
        echo json_encode(ClassController::deleteClass($id));
        exit;
    }
}
// Sections endpoints
if (strpos($uri, '/sections') !== false) {
    if ($method === 'GET') {
        // Get specific section by ID
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            echo json_encode(ClassController::getSectionById($id));
            exit;
        }
        // Get sections by class
        if (isset($_GET['class_id'])) {
            $class_id = $_GET['class_id'];
            echo json_encode(ClassController::getSectionsByClass($class_id));
            exit;
        }
        // Get all sections
        echo json_encode(ClassController::getAllSections());
        exit;
    }
    if ($method === 'POST') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $required_fields = ['class_id', 'name'];
        $validation = validateFields($required_fields, $data);
        if (!$validation['valid']) {
            echo json_encode(['success' => false, 'message' => $validation['message']]);
            exit;
        }
        
        $class_id = $data['class_id'];
        $name = $data['name'];
        
        echo json_encode(ClassController::createSection($class_id, $name));
        exit;
    }
    if ($method === 'PUT') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $required_fields = ['id', 'name'];
        $validation = validateFields($required_fields, $data);
        if (!$validation['valid']) {
            echo json_encode(['success' => false, 'message' => $validation['message']]);
            exit;
        }
        
        $id = $data['id'];
        $name = $data['name'];
        
        echo json_encode(ClassController::updateSection($id, $name));
        exit;
    }
    if ($method === 'DELETE') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            echo json_encode(['success' => false, 'message' => 'Section ID is required']);
            exit;
        }
        
        $id = $data['id'];
        echo json_encode(ClassController::deleteSection($id));
        exit;
    }
}
// Students endpoints
if (strpos($uri, '/students') !== false) {
    if ($method === 'GET') {
        // Get specific student by ID
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            echo json_encode(StudentController::getStudentById($id));
            exit;
        }
        // Get students by class
        if (isset($_GET['class_id'])) {
            $class_id = $_GET['class_id'];
            echo json_encode(StudentController::getStudentsByClass($class_id));
            exit;
        }
        // Get all students
        echo json_encode(StudentController::getAllStudents());
        exit;
    }
    if ($method === 'POST') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $required_fields = ['user_id', 'class_id', 'section_id', 'roll_number'];
        $validation = validateFields($required_fields, $data);
        if (!$validation['valid']) {
            echo json_encode(['success' => false, 'message' => $validation['message']]);
            exit;
        }
        
        $user_id = $data['user_id'];
        $class_id = $data['class_id'];
        $section_id = $data['section_id'];
        $roll_number = $data['roll_number'];
        
        echo json_encode(StudentController::createStudent($user_id, $class_id, $section_id, $roll_number));
        exit;
    }
    if ($method === 'PUT') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $required_fields = ['id', 'class_id', 'section_id', 'roll_number'];
        $validation = validateFields($required_fields, $data);
        if (!$validation['valid']) {
            echo json_encode(['success' => false, 'message' => $validation['message']]);
            exit;
        }
        
        $id = $data['id'];
        $class_id = $data['class_id'];
        $section_id = $data['section_id'];
        $roll_number = $data['roll_number'];
        
        echo json_encode(StudentController::updateStudent($id, $class_id, $section_id, $roll_number));
        exit;
    }
    if ($method === 'DELETE') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            echo json_encode(['success' => false, 'message' => 'Student ID is required']);
            exit;
        }
        
        $id = $data['id'];
        echo json_encode(StudentController::deleteStudent($id));
        exit;
    }
}
// Teachers endpoints
if (strpos($uri, '/teachers') !== false) {
    if ($method === 'GET') {
        // Get specific teacher by ID
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            echo json_encode(TeacherController::getTeacherById($id));
            exit;
        }
        // Get teachers by subject
        if (isset($_GET['subject_id'])) {
            $subject_id = $_GET['subject_id'];
            echo json_encode(TeacherController::getTeachersBySubject($subject_id));
            exit;
        }
        // Get all teachers
        echo json_encode(TeacherController::getAllTeachers());
        exit;
    }
    if ($method === 'POST') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $required_fields = ['user_id', 'subject_ids'];
        $validation = validateFields($required_fields, $data);
        if (!$validation['valid']) {
            echo json_encode(['success' => false, 'message' => $validation['message']]);
            exit;
        }
        
        $user_id = $data['user_id'];
        $subject_ids = $data['subject_ids'];
        
        // Ensure subject_ids is an array
        if (!is_array($subject_ids)) {
            echo json_encode(['success' => false, 'message' => 'subject_ids must be an array']);
            exit;
        }
        
        echo json_encode(TeacherController::createTeacher($user_id, $subject_ids));
        exit;
    }
    if ($method === 'PUT') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $required_fields = ['id', 'subject_ids'];
        $validation = validateFields($required_fields, $data);
        if (!$validation['valid']) {
            echo json_encode(['success' => false, 'message' => $validation['message']]);
            exit;
        }
        
        $id = $data['id'];
        $subject_ids = $data['subject_ids'];
        
        // Ensure subject_ids is an array
        if (!is_array($subject_ids)) {
            echo json_encode(['success' => false, 'message' => 'subject_ids must be an array']);
            exit;
        }
        
        echo json_encode(TeacherController::updateTeacher($id, $subject_ids));
        exit;
    }
    if ($method === 'DELETE') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            echo json_encode(['success' => false, 'message' => 'Teacher ID is required']);
            exit;
        }
        
        $id = $data['id'];
        echo json_encode(TeacherController::deleteTeacher($id));
        exit;
    }
}

// Teacher subject management endpoints
if (strpos($uri, '/teachers/subjects') !== false) {
    if ($method === 'POST') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $required_fields = ['teacher_id', 'subject_id'];
        $validation = validateFields($required_fields, $data);
        if (!$validation['valid']) {
            echo json_encode(['success' => false, 'message' => $validation['message']]);
            exit;
        }
        
        $teacher_id = $data['teacher_id'];
        $subject_id = $data['subject_id'];
        
        echo json_encode(TeacherController::addSubjectToTeacher($teacher_id, $subject_id));
        exit;
    }
    if ($method === 'DELETE') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $required_fields = ['teacher_id', 'subject_id'];
        $validation = validateFields($required_fields, $data);
        if (!$validation['valid']) {
            echo json_encode(['success' => false, 'message' => $validation['message']]);
            exit;
        }
        
        $teacher_id = $data['teacher_id'];
        $subject_id = $data['subject_id'];
        
        echo json_encode(TeacherController::removeSubjectFromTeacher($teacher_id, $subject_id));
        exit;
    }
}
// Subjects endpoints
if (strpos($uri, '/subjects') !== false) {
    if ($method === 'GET') {
        echo json_encode(SubjectController::getAllSubjects());
        exit;
    }
    if ($method === 'POST') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        $name = $data['name'] ?? '';
        echo json_encode(SubjectController::createSubject($name));
        exit;
    }
    if ($method === 'PUT') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? 0;
        $name = $data['name'] ?? '';
        echo json_encode(SubjectController::updateSubject($id, $name));
        exit;
    }
    if ($method === 'DELETE') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? 0;
        echo json_encode(SubjectController::deleteSubject($id));
        exit;
    }
}
// Attendance endpoints
if (strpos($uri, '/attendance') !== false) {
    if ($method === 'POST') {
        Auth::requireRole('teacher');
        $data = json_decode(file_get_contents('php://input'), true);
        $student_id = $data['student_id'] ?? 0;
        $date = $data['date'] ?? '';
        $status = $data['status'] ?? '';
        echo json_encode(AttendanceController::markAttendance($student_id, $date, $status));
        exit;
    }
    if ($method === 'GET') {
        // TODO: Restrict to admin/teacher or self (student/parent)
        if (isset($_GET['student_id'])) {
            echo json_encode(AttendanceController::getAttendanceByStudent($_GET['student_id']));
            exit;
        }
        if (isset($_GET['date'])) {
            echo json_encode(AttendanceController::getAttendanceByDate($_GET['date']));
            exit;
        }
    }
}
// Exams endpoints
if (strpos($uri, '/exams') !== false) {
    if ($method === 'GET') {
        // Get specific exam by ID
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            echo json_encode(ExamController::getExamById($id));
            exit;
        }
        // Get exams by class
        if (isset($_GET['class_id'])) {
            $class_id = $_GET['class_id'];
            echo json_encode(ExamController::getExamsByClass($class_id));
            exit;
        }
        // Get all exams
        echo json_encode(ExamController::getAllExams());
        exit;
    }
    if ($method === 'POST') {
        Auth::requireRole('teacher');
        $data = json_decode(file_get_contents('php://input'), true);
        $name = $data['name'] ?? '';
        $class_id = $data['class_id'] ?? 0;
        $date = $data['date'] ?? '';
        echo json_encode(ExamController::createExam($name, $class_id, $date));
        exit;
    }
    if ($method === 'PUT') {
        Auth::requireRole('teacher');
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? 0;
        $name = $data['name'] ?? '';
        $class_id = $data['class_id'] ?? 0;
        $date = $data['date'] ?? '';
        echo json_encode(ExamController::updateExam($id, $name, $class_id, $date));
        exit;
    }
    if ($method === 'DELETE') {
        Auth::requireRole('teacher');
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? 0;
        echo json_encode(ExamController::deleteExam($id));
        exit;
    }
}
// Results endpoints
if (strpos($uri, '/results') !== false) {
    if ($method === 'GET') {
        // Get result by ID
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            echo json_encode(ResultController::getResultById($id));
            exit;
        }
        // Get results by student
        if (isset($_GET['student_id'])) {
        echo json_encode(ResultController::getResultsByStudent($_GET['student_id']));
            exit;
        }
        // Get results by exam
        if (isset($_GET['exam_id'])) {
            echo json_encode(ResultController::getResultsByExam($_GET['exam_id']));
            exit;
        }
        // Get all results
        echo json_encode(ResultController::getAllResults());
        exit;
    }
    if ($method === 'POST') {
        Auth::requireRole('teacher');
        $data = json_decode(file_get_contents('php://input'), true);
        $student_id = $data['student_id'] ?? 0;
        $exam_id = $data['exam_id'] ?? 0;
        $subject_id = $data['subject_id'] ?? 0;
        $marks_obtained = $data['marks_obtained'] ?? 0;
        $total_marks = $data['total_marks'] ?? 0;
        echo json_encode(ResultController::createResult($student_id, $exam_id, $subject_id, $marks_obtained, $total_marks));
        exit;
    }
    if ($method === 'PUT') {
        Auth::requireRole('teacher');
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? 0;
        $marks_obtained = $data['marks_obtained'] ?? 0;
        $total_marks = $data['total_marks'] ?? 0;
        echo json_encode(ResultController::updateResult($id, $marks_obtained, $total_marks));
        exit;
    }
    if ($method === 'DELETE') {
        Auth::requireRole('teacher');
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? 0;
        echo json_encode(ResultController::deleteResult($id));
        exit;
    }
}
// Fees endpoints
if (strpos($uri, '/fees') !== false) {
    if ($method === 'GET' && isset($_GET['student_id'])) {
        // TODO: Restrict to admin/teacher or self (student/parent)
        echo json_encode(FeeController::getFeesByStudent($_GET['student_id']));
        exit;
    }
    if ($method === 'POST') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        $student_id = $data['student_id'] ?? 0;
        $amount = $data['amount'] ?? 0;
        $due_date = $data['due_date'] ?? '';
        $status = $data['status'] ?? 'unpaid';
        echo json_encode(FeeController::createFee($student_id, $amount, $due_date, $status));
        exit;
    }
    if ($method === 'PUT') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? 0;
        $amount = $data['amount'] ?? 0;
        $due_date = $data['due_date'] ?? '';
        $status = $data['status'] ?? 'unpaid';
        echo json_encode(FeeController::updateFee($id, $amount, $due_date, $status));
        exit;
    }
    if ($method === 'DELETE') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? 0;
        echo json_encode(FeeController::deleteFee($id));
        exit;
    }
}
// Notifications endpoints
if (strpos($uri, '/notifications') !== false) {
    if ($method === 'GET' && isset($_GET['user_id'])) {
        $requested_user_id = (int)$_GET['user_id'];
        $current_user = Auth::user();
        if (Auth::isAdmin() || Auth::isTeacher() || ($current_user && $current_user['id'] == $requested_user_id)) {
            echo json_encode(NotificationController::getNotificationsByUser($requested_user_id));
        } else {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Access denied']);
        }
        exit;
    }
    if ($method === 'POST') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        $user_id = $data['user_id'] ?? 0;
        $message = $data['message'] ?? '';
        echo json_encode(NotificationController::createNotification($user_id, $message));
        exit;
    }
    if ($method === 'DELETE') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? 0;
        echo json_encode(NotificationController::deleteNotification($id));
        exit;
    }
}
// Expose GET /notifications/all (admin only)
if ($uri === '/notifications/all' && $method === 'GET') {
    Auth::requireRole('admin');
    echo json_encode(NotificationController::getAllNotifications());
    exit;
}
// Expose GET /notifications/:id (admin, teacher, or owner)
if (preg_match('#/notifications/(\\d+)$#', $uri, $matches) && $method === 'GET') {
    $notification_id = (int)$matches[1];
    $notification = NotificationController::getNotificationById($notification_id);
    if (!$notification['success']) {
        echo json_encode($notification);
        exit;
    }
    $current_user = Auth::user();
    if (Auth::isAdmin() || Auth::isTeacher() || ($current_user && $notification['data']['user_id'] == $current_user['id'])) {
        echo json_encode($notification);
    } else {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
    }
    exit;
}
// Expose POST /notifications/mark-read (admin, teacher, or owner)
if ($uri === '/notifications/mark-read' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? 0;
    $notification = NotificationController::getNotificationById($id);
    if (!$notification['success']) {
        echo json_encode($notification);
        exit;
    }
    $current_user = Auth::user();
    if (Auth::isAdmin() || Auth::isTeacher() || ($current_user && $notification['data']['user_id'] == $current_user['id'])) {
        echo json_encode(NotificationController::markAsRead($id));
    } else {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
    }
    exit;
}
// Email notification endpoints
if (strpos($uri, '/notifications/email') !== false && $method === 'POST') {
    Auth::requireRole('admin');
    $data = json_decode(file_get_contents('php://input'), true);
    $user_id = $data['user_id'] ?? 0;
    $subject = $data['subject'] ?? '';
    $message = $data['message'] ?? '';
    echo json_encode(NotificationController::sendEmailNotification($user_id, $subject, $message));
    exit;
}
if (strpos($uri, '/notifications/bulk-email') !== false && $method === 'POST') {
    Auth::requireRole('admin');
    $data = json_decode(file_get_contents('php://input'), true);
    $user_ids = $data['user_ids'] ?? [];
    $subject = $data['subject'] ?? '';
    $message = $data['message'] ?? '';
    echo json_encode(NotificationController::sendBulkEmailNotification($user_ids, $subject, $message));
    exit;
}
// Users endpoints
if (strpos($uri, '/users') !== false) {
    if ($method === 'GET') {
        Auth::requireRole('admin');
        echo json_encode(UserController::getAllUsers());
        exit;
    }
}
// Assign class teacher privilege (admin only)
if (strpos($uri, '/users/assign-class-teacher') !== false && $method === 'POST') {
    requireAdmin();
    $data = json_decode(file_get_contents('php://input'), true);
    $user_id = $data['user_id'] ?? 0;
    $class_id = $data['class_id'] ?? 0;
    echo json_encode(UserController::assignClassTeacher($user_id, $class_id));
    exit;
}
// Remove class teacher privilege (admin only)
if (strpos($uri, '/users/remove-class-teacher') !== false && $method === 'POST') {
    requireAdmin();
    $data = json_decode(file_get_contents('php://input'), true);
    $user_id = $data['user_id'] ?? 0;
    echo json_encode(UserController::removeClassTeacher($user_id));
    exit;
}
// List all class teachers (admin only)
if (strpos($uri, '/users/class-teachers') !== false && $method === 'GET') {
    requireAdmin();
    echo json_encode(UserController::getClassTeachers());
    exit;
}
// Get the class a class teacher is assigned to (admin, teacher, or self)
if (strpos($uri, '/users/class-teacher-class') !== false && $method === 'GET') {
    $user_id = $_GET['user_id'] ?? 0;
    // Only allow admin, teacher, or self
    if (!Auth::isAdmin() && !Auth::isTeacher() && (!isset($_SESSION['user']) || $_SESSION['user']['id'] != $user_id)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }
    echo json_encode(UserController::getClassTeacherClass($user_id));
    exit;
}
// User profile endpoints
if (strpos($uri, '/profile') !== false) {
    if ($method === 'GET') {
        $user_id = $_GET['user_id'] ?? 0;
        echo json_encode(UserController::getProfile($user_id));
        exit;
    }
    if ($method === 'PUT') {
        $user_id = $_GET['user_id'] ?? 0;
        $data = json_decode(file_get_contents('php://input'), true);
        $name = $data['name'] ?? null;
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;
        // Profile picture update via separate endpoint
        echo json_encode(UserController::updateProfile($user_id, $name, $email, $password));
        exit;
    }
    if ($method === 'POST' && strpos($uri, '/profile/picture') !== false) {
        $user_id = $_GET['user_id'] ?? 0;
        $profile_picture = UserController::handleProfilePictureUpload($_FILES['profile_picture']);
        if ($profile_picture) {
            echo json_encode(UserController::updateProfile($user_id, null, null, null, $profile_picture));
        } else {
            echo json_encode(['success' => false, 'message' => 'Profile picture upload failed']);
        }
        exit;
    }
}
// Parents endpoints
if (strpos($uri, '/parents') !== false) {
    Auth::requireRole('admin');
    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            echo json_encode(ParentController::getParent($_GET['id']));
        } else {
            echo json_encode(ParentController::getAllParents());
        }
        exit;
    }
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $user_id = $data['user_id'] ?? 0;
        $student_id = $data['student_id'] ?? 0;
        echo json_encode(ParentController::createParent($user_id, $student_id));
        exit;
    }
    if ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? 0;
        $user_id = $data['user_id'] ?? 0;
        $student_id = $data['student_id'] ?? 0;
        echo json_encode(ParentController::updateParent($id, $user_id, $student_id));
        exit;
    }
    if ($method === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? 0;
        echo json_encode(ParentController::deleteParent($id));
        exit;
    }
}
// Timetable endpoints
if (strpos($uri, '/timetable') !== false) {
    if ($method === 'GET') {
        if (!Auth::isAdmin() && !Auth::isTeacher()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Admin or teacher access required']);
            exit;
        }
        if (isset($_GET['id'])) {
            echo json_encode(TimetableController::getTimetable($_GET['id']));
        } else if (isset($_GET['class_id'])) {
            echo json_encode(TimetableController::getTimetableByClass($_GET['class_id']));
        } else {
            echo json_encode(TimetableController::getAllTimetables());
        }
        exit;
    }
    if ($method === 'POST') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        $class_id = $data['class_id'] ?? 0;
        $subject_id = $data['subject_id'] ?? 0;
        $teacher_id = $data['teacher_id'] ?? 0;
        $day_of_week = $data['day_of_week'] ?? '';
        $start_time = $data['start_time'] ?? '';
        $end_time = $data['end_time'] ?? '';
        echo json_encode(TimetableController::createTimetable($class_id, $subject_id, $teacher_id, $day_of_week, $start_time, $end_time));
        exit;
    }
    if ($method === 'PUT') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? 0;
        $class_id = $data['class_id'] ?? 0;
        $subject_id = $data['subject_id'] ?? 0;
        $teacher_id = $data['teacher_id'] ?? 0;
        $day_of_week = $data['day_of_week'] ?? '';
        $start_time = $data['start_time'] ?? '';
        $end_time = $data['end_time'] ?? '';
        echo json_encode(TimetableController::updateTimetable($id, $class_id, $subject_id, $teacher_id, $day_of_week, $start_time, $end_time));
        exit;
    }
    if ($method === 'DELETE') {
        Auth::requireRole('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? 0;
        echo json_encode(TimetableController::deleteTimetable($id));
        exit;
    }
}
// Messages endpoints
if (strpos($uri, '/messages') !== false) {
    if (!Auth::check()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentication required']);
        exit;
    }
    $current_user_id = Auth::user()['id'];
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $receiver_id = $data['receiver_id'] ?? 0;
        $message = $data['message'] ?? '';
        echo json_encode(MessageController::sendMessage($current_user_id, $receiver_id, $message));
        exit;
    }
    if ($method === 'GET') {
        if (strpos($uri, '/messages/conversation') !== false && isset($_GET['user_id'])) {
            $other_user_id = $_GET['user_id'];
            echo json_encode(MessageController::getConversation($current_user_id, $other_user_id));
        } else {
            echo json_encode(MessageController::getMessages($current_user_id));
        }
        exit;
    }
    if ($method === 'PUT' && strpos($uri, '/messages/read') !== false) {
        $data = json_decode(file_get_contents('php://input'), true);
        $message_id = $data['message_id'] ?? 0;
        echo json_encode(MessageController::markAsRead($message_id));
        exit;
    }
}
// Bulk import/export endpoints
if (preg_match('#/import/(students|teachers|classes|subjects|parents)#', $uri, $matches) && $method === 'POST') {
    Auth::requireRole('admin');
    $entity = $matches[1];
    if (!isset($_FILES['csv'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'CSV file required']);
        exit;
    }
    $csvFile = $_FILES['csv']['tmp_name'];
    $result = null;
    switch ($entity) {
        case 'students':
            $result = ImportExportController::importStudents($csvFile); break;
        case 'teachers':
            $result = ImportExportController::importTeachers($csvFile); break;
        case 'classes':
            $result = ImportExportController::importClasses($csvFile); break;
        case 'subjects':
            $result = ImportExportController::importSubjects($csvFile); break;
        case 'parents':
            $result = ImportExportController::importParents($csvFile); break;
    }
    echo json_encode($result);
    exit;
}
if (preg_match('#/export/(students|teachers|classes|subjects|parents)#', $uri, $matches) && $method === 'GET') {
    Auth::requireRole('admin');
    $entity = $matches[1];
    $csv = null;
    switch ($entity) {
        case 'students':
            $csv = ImportExportController::exportStudents(); break;
        case 'teachers':
            $csv = ImportExportController::exportTeachers(); break;
        case 'classes':
            $csv = ImportExportController::exportClasses(); break;
        case 'subjects':
            $csv = ImportExportController::exportSubjects(); break;
        case 'parents':
            $csv = ImportExportController::exportParents(); break;
    }
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="' . $entity . '.csv"');
    echo $csv;
    exit;
} 
// Reports endpoints
if (strpos($uri, '/reports/attendance') !== false && $method === 'GET') {
    if (!Auth::isAdmin() && !Auth::isTeacher()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin or teacher access required']);
        exit;
    }
    $class_id = $_GET['class_id'] ?? 0;
    $start_date = $_GET['start_date'] ?? '';
    $end_date = $_GET['end_date'] ?? '';
    echo json_encode(ReportController::attendanceReport($class_id, $start_date, $end_date));
    exit;
}
if (strpos($uri, '/reports/exam-performance') !== false && $method === 'GET') {
    if (!Auth::isAdmin() && !Auth::isTeacher()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin or teacher access required']);
        exit;
    }
    $class_id = $_GET['class_id'] ?? 0;
    $exam_id = $_GET['exam_id'] ?? 0;
    echo json_encode(ReportController::examPerformanceReport($class_id, $exam_id));
    exit;
} 
// Document management endpoints
if (strpos($uri, '/documents/upload') !== false && $method === 'POST') {
    if (!Auth::check()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentication required']);
        exit;
    }
    $user_id = $_POST['user_id'] ?? null;
    $class_id = $_POST['class_id'] ?? null;
    $subject_id = $_POST['subject_id'] ?? null;
    $type = $_POST['type'] ?? null;
    $description = $_POST['description'] ?? null;
    echo json_encode(DocumentController::uploadDocument($_FILES['document'], $user_id, $class_id, $subject_id, $type, $description));
    exit;
}
if (strpos($uri, '/documents/download') !== false && $method === 'GET') {
    if (!Auth::check()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentication required']);
        exit;
    }
    $id = $_GET['id'] ?? 0;
    DocumentController::downloadDocument($id);
    exit;
}
if (strpos($uri, '/documents') !== false && $method === 'GET') {
    if (!Auth::check()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentication required']);
        exit;
    }
    $user_id = $_GET['user_id'] ?? null;
    $class_id = $_GET['class_id'] ?? null;
    $subject_id = $_GET['subject_id'] ?? null;
    echo json_encode(DocumentController::listDocuments($user_id, $class_id, $subject_id));
    exit;
}
if (strpos($uri, '/documents') !== false && $method === 'DELETE') {
    if (!Auth::check()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentication required']);
        exit;
    }
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? 0;
    echo json_encode(DocumentController::deleteDocument($id));
    exit;
} 
// User settings endpoints
if (strpos($uri, '/settings') !== false) {
    if ($method === 'GET') {
        if (!Auth::check()) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            exit;
        }
        $user_id = $_GET['user_id'] ?? Auth::user()['id'];
        echo json_encode(UserController::getUserSettings($user_id));
        exit;
    }
    if ($method === 'PUT') {
        if (!Auth::check()) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $user_id = $data['user_id'] ?? Auth::user()['id'];
        $key = $data['key'] ?? '';
        $value = $data['value'] ?? '';
        echo json_encode(UserController::updateUserSetting($user_id, $key, $value));
        exit;
    }
    if ($method === 'DELETE') {
        if (!Auth::check()) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $user_id = $data['user_id'] ?? Auth::user()['id'];
        $key = $data['key'] ?? '';
        echo json_encode(UserController::deleteUserSetting($user_id, $key));
        exit;
    }
}
// Dashboard endpoints
if (strpos($uri, '/dashboard/admin') !== false && $method === 'GET') {
    Auth::requireRole('admin');
    echo json_encode(DashboardController::getAdminDashboard());
    exit;
}
if (strpos($uri, '/dashboard/teacher') !== false && $method === 'GET') {
    if (!Auth::isAdmin() && !Auth::isTeacher()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin or teacher access required']);
        exit;
    }
    $teacher_id = $_GET['teacher_id'] ?? 0;
    echo json_encode(DashboardController::getTeacherDashboard($teacher_id));
    exit;
}
if (strpos($uri, '/dashboard/student') !== false && $method === 'GET') {
    if (!Auth::isAdmin() && !Auth::isTeacher() && !Auth::isStudent()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }
    $student_id = $_GET['student_id'] ?? 0;
    echo json_encode(DashboardController::getStudentDashboard($student_id));
    exit;
}
if (strpos($uri, '/dashboard/parent') !== false && $method === 'GET') {
    if (!Auth::isAdmin() && !Auth::isParent()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin or parent access required']);
        exit;
    }
    $parent_id = $_GET['parent_id'] ?? 0;
    echo json_encode(DashboardController::getParentDashboard($parent_id));
    exit;
} 
// Check if morning attendance is done for a class (admin, teacher, or class teacher)
if (strpos($uri, '/attendance/is-morning-done') !== false && $method === 'GET') {
    $class_id = $_GET['class_id'] ?? 0;
    $date = $_GET['date'] ?? null;
    if (!Auth::isAdmin() && !Auth::isTeacher()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }
    echo json_encode(AttendanceController::isMorningAttendanceDone($class_id, $date));
    exit;
}
// List classes for a teacher/class teacher/admin
if (strpos($uri, '/attendance/classes-for-teacher') !== false && $method === 'GET') {
    $user_id = $_GET['user_id'] ?? 0;
    if (!Auth::isAdmin() && !Auth::isTeacher() && (!isset($_SESSION['user']) || $_SESSION['user']['id'] != $user_id)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }
    echo json_encode(AttendanceController::getClassesForTeacher($user_id));
    exit;
} 