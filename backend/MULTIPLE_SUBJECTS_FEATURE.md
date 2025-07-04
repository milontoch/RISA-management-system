# Multiple Subjects Feature for Teachers

## Overview
The RISA Management System now supports teachers being assigned to multiple subjects. This feature allows for more flexible teacher assignments and better resource utilization.

## Database Changes

### New Table: `teacher_subjects`
A junction table that creates a many-to-many relationship between teachers and subjects:

```sql
CREATE TABLE teacher_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    subject_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_subject (teacher_id, subject_id)
);
```

### Modified Table: `teachers`
The `teachers` table now only contains:
- `id` - Primary key
- `user_id` - Reference to users table

The `subject_id` column has been removed.

## API Endpoints

### 1. Get All Teachers
**GET** `/teachers`
Returns all teachers with their assigned subjects.

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": "1",
            "user_id": "5",
            "name": "Sarah Johnson",
            "email": "sarah.johnson@school.com",
            "role": "teacher",
            "created_at": "2025-07-04 01:33:53",
            "subjects": "English, Mathematics",
            "subject_ids": ["2", "3"]
        }
    ]
}
```

### 2. Get Teacher by ID
**GET** `/teachers?id=1`
Returns a specific teacher with their subjects.

### 3. Get Teachers by Subject
**GET** `/teachers?subject_id=2`
Returns all teachers assigned to a specific subject.

### 4. Create Teacher
**POST** `/teachers`
Creates a new teacher with multiple subjects.

**Request Body:**
```json
{
    "user_id": 5,
    "subject_ids": [2, 3, 4]
}
```

### 5. Update Teacher
**PUT** `/teachers`
Updates a teacher's subject assignments.

**Request Body:**
```json
{
    "id": 1,
    "subject_ids": [2, 3, 5]
}
```

### 6. Delete Teacher
**DELETE** `/teachers`
Deletes a teacher and all their subject assignments.

**Request Body:**
```json
{
    "id": 1
}
```

### 7. Add Subject to Teacher
**POST** `/teachers/subjects`
Adds a single subject to an existing teacher.

**Request Body:**
```json
{
    "teacher_id": 1,
    "subject_id": 4
}
```

### 8. Remove Subject from Teacher
**DELETE** `/teachers/subjects`
Removes a single subject from a teacher.

**Request Body:**
```json
{
    "teacher_id": 1,
    "subject_id": 4
}
```

## TeacherController Methods

### Updated Methods
- `getAllTeachers()` - Now returns teachers with multiple subjects
- `getTeacherById($id)` - Returns teacher with all assigned subjects
- `createTeacher($user_id, $subject_ids)` - Creates teacher with multiple subjects
- `updateTeacher($id, $subject_ids)` - Updates teacher's subject assignments
- `deleteTeacher($id)` - Deletes teacher and all subject assignments
- `getTeachersBySubject($subject_id)` - Returns teachers for a specific subject

### New Methods
- `addSubjectToTeacher($teacher_id, $subject_id)` - Adds a subject to a teacher
- `removeSubjectFromTeacher($teacher_id, $subject_id)` - Removes a subject from a teacher

## Current Teacher Assignments

After testing, the current assignments are:

1. **Sarah Johnson** - English, Mathematics
2. **Michael Chen** - Physics, Science
3. **Emily Rodriguez** - Chemistry
4. **David Thompson** - Biology
5. **Lisa Wang** - Computer Science

## Benefits

1. **Flexibility** - Teachers can teach multiple subjects
2. **Efficiency** - Better resource utilization
3. **Scalability** - Easy to add/remove subjects from teachers
4. **Data Integrity** - Proper foreign key relationships
5. **API Consistency** - Maintains existing API patterns

## Migration Notes

- Existing teacher-subject relationships were automatically migrated
- No data loss occurred during the migration
- All existing functionality continues to work
- New endpoints provide additional flexibility

## Usage Examples

### Frontend Integration
```javascript
// Get all teachers with their subjects
fetch('/teachers')
  .then(response => response.json())
  .then(data => {
    data.data.forEach(teacher => {
      console.log(`${teacher.name}: ${teacher.subjects}`);
    });
  });

// Add a subject to a teacher
fetch('/teachers/subjects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    teacher_id: 1,
    subject_id: 4
  })
});
```

### Backend Usage
```php
// Create a teacher with multiple subjects
$result = TeacherController::createTeacher(5, [2, 3, 4]);

// Add a subject to existing teacher
$result = TeacherController::addSubjectToTeacher(1, 4);

// Get teachers for a specific subject
$result = TeacherController::getTeachersBySubject(2);
``` 