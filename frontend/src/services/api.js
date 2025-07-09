// API Service for Laravel Backend
import config from '../config';

class ApiService {
  constructor() {
    this.baseURL = config.api.baseURL;
  }

  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Set auth token in localStorage
  setToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const token = this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(email, password) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request('/profile');
  }

  async updateProfile(userData) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getDashboard() {
    return this.request('/dashboard');
  }

  // User management
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users?${queryString}`);
  }

  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Student management
  async getStudents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/students?${queryString}`);
  }

  async getStudent(id) {
    return this.request(`/students/${id}`);
  }

  async createStudent(studentData) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async updateStudent(id, studentData) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  }

  async deleteStudent(id) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  async getStudentAttendance(studentId) {
    return this.request(`/students/${studentId}/attendance`);
  }

  async getStudentResults(studentId) {
    return this.request(`/students/${studentId}/results`);
  }

  // Attendance management
  async getAttendance(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/attendance?${queryString}`);
  }

  async getAttendanceRecord(id) {
    return this.request(`/attendance/${id}`);
  }

  async createAttendance(attendanceData) {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  async updateAttendance(id, attendanceData) {
    return this.request(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(attendanceData),
    });
  }

  async deleteAttendance(id) {
    return this.request(`/attendance/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkMarkAttendance(attendanceData) {
    return this.request('/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  async getAttendanceReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/attendance/report?${queryString}`);
  }

  async getAttendanceByClass(classId) {
    return this.request(`/attendance/class/${classId}`);
  }

  async getAttendanceByStudent(studentId) {
    return this.request(`/attendance/student/${studentId}`);
  }

  // Subject management
  async getSubjects(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/subjects?${queryString}`);
  }

  async getSubject(id) {
    return this.request(`/subjects/${id}`);
  }

  async createSubject(subjectData) {
    return this.request('/subjects', {
      method: 'POST',
      body: JSON.stringify(subjectData),
    });
  }

  async updateSubject(id, subjectData) {
    return this.request(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subjectData),
    });
  }

  async deleteSubject(id) {
    return this.request(`/subjects/${id}`, {
      method: 'DELETE',
    });
  }

  async getSubjectsByClass(classId) {
    return this.request(`/subjects/class/${classId}`);
  }

  async getActiveSubjects() {
    return this.request('/subjects/active');
  }

  // Class management
  async getClasses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/classes?${queryString}`);
  }

  async getClass(id) {
    return this.request(`/classes/${id}`);
  }

  async createClass(classData) {
    return this.request('/classes', {
      method: 'POST',
      body: JSON.stringify(classData),
    });
  }

  async updateClass(id, classData) {
    return this.request(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(classData),
    });
  }

  async deleteClass(id) {
    return this.request(`/classes/${id}`, {
      method: 'DELETE',
    });
  }

  async getClassStudents(classId) {
    return this.request(`/classes/${classId}/students`);
  }

  async getClassSubjects(classId) {
    return this.request(`/classes/${classId}/subjects`);
  }

  async addSubjectToClass(classId, subjectData) {
    return this.request(`/classes/${classId}/subjects`, {
      method: 'POST',
      body: JSON.stringify(subjectData),
    });
  }

  async removeSubjectFromClass(classId, subjectId) {
    return this.request(`/classes/${classId}/subjects/${subjectId}`, {
      method: 'DELETE',
    });
  }

  async getActiveClasses() {
    return this.request('/classes/active');
  }

  // Teacher management
  async getTeachers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/teachers?${queryString}`);
  }

  async getTeacher(id) {
    return this.request(`/teachers/${id}`);
  }

  async createTeacher(teacherData) {
    return this.request('/teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData),
    });
  }

  async updateTeacher(id, teacherData) {
    return this.request(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teacherData),
    });
  }

  async deleteTeacher(id) {
    return this.request(`/teachers/${id}`, {
      method: 'DELETE',
    });
  }

  async getTeacherClasses(teacherId) {
    return this.request(`/teachers/${teacherId}/classes`);
  }

  async getTeacherSubjects(teacherId) {
    return this.request(`/teachers/${teacherId}/subjects`);
  }

  async getTeacherDashboard(teacherId) {
    return this.request(`/teachers/${teacherId}/dashboard`);
  }

  async getActiveTeachers() {
    return this.request('/teachers/active');
  }

  // Exam management
  async getExams(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/exams?${queryString}`);
  }

  async getExam(id) {
    return this.request(`/exams/${id}`);
  }

  async createExam(examData) {
    return this.request('/exams', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  }

  async updateExam(id, examData) {
    return this.request(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(examData),
    });
  }

  async deleteExam(id) {
    return this.request(`/exams/${id}`, {
      method: 'DELETE',
    });
  }

  async getExamResults(examId) {
    return this.request(`/exams/${examId}/results`);
  }

  async addExamResult(examId, resultData) {
    return this.request(`/exams/${examId}/results`, {
      method: 'POST',
      body: JSON.stringify(resultData),
    });
  }

  async updateExamResult(examId, resultId, resultData) {
    return this.request(`/exams/${examId}/results/${resultId}`, {
      method: 'PUT',
      body: JSON.stringify(resultData),
    });
  }

  async getUpcomingExams() {
    return this.request('/exams/upcoming');
  }

  async getExamsByClass(classId) {
    return this.request(`/exams/class/${classId}`);
  }

  async getExamStatistics(examId) {
    return this.request(`/exams/${examId}/statistics`);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService; 