// API Service for Laravel Backend - React Native Version
import config from '../config';

class ApiService {
  constructor() {
    this.baseURL = config.api.baseURL;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email, password) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/logout', {
      method: 'POST',
    });
  }

  async getUser() {
    return this.request('/profile');
  }

  // Dashboard
  async getDashboard(role) {
    return this.request(`/dashboard/${role}`);
  }

  // Students
  async getStudents() {
    return this.request('/students');
  }

  async getStudent(id) {
    return this.request(`/students/${id}`);
  }

  async createStudent(data) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStudent(id, data) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStudent(id) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  // Teachers
  async getTeachers() {
    return this.request('/teachers');
  }

  async getTeacher(id) {
    return this.request(`/teachers/${id}`);
  }

  async createTeacher(data) {
    return this.request('/teachers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeacher(id, data) {
    return this.request(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTeacher(id) {
    return this.request(`/teachers/${id}`, {
      method: 'DELETE',
    });
  }

  // Classes
  async getClasses() {
    return this.request('/classes');
  }

  async getClass(id) {
    return this.request(`/classes/${id}`);
  }

  async createClass(data) {
    return this.request('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClass(id, data) {
    return this.request(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClass(id) {
    return this.request(`/classes/${id}`, {
      method: 'DELETE',
    });
  }

  // Attendance
  async getAttendance(date = null) {
    const endpoint = date ? `/attendance?date=${date}` : '/attendance';
    return this.request(endpoint);
  }

  async markAttendance(data) {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAttendance(id, data) {
    return this.request(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Results
  async getResults() {
    return this.request('/results');
  }

  // Exams
  async getExams() {
    return this.request('/exams');
  }

  async getResult(id) {
    return this.request(`/results/${id}`);
  }

  async createResult(data) {
    return this.request('/results', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateResult(id, data) {
    return this.request(`/results/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteResult(id) {
    return this.request(`/results/${id}`, {
      method: 'DELETE',
    });
  }

  // Fees
  async getFees() {
    return this.request('/fees');
  }

  async getFee(id) {
    return this.request(`/fees/${id}`);
  }

  async createFee(data) {
    return this.request('/fees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFee(id, data) {
    return this.request(`/fees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFee(id) {
    return this.request(`/fees/${id}`, {
      method: 'DELETE',
    });
  }

  // Messages
  async getMessages() {
    return this.request('/messages');
  }

  async getMessage(id) {
    return this.request(`/messages/${id}`);
  }

  async sendMessage(data) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteMessage(id) {
    return this.request(`/messages/${id}`, {
      method: 'DELETE',
    });
  }

  // Notifications
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async deleteNotification(id) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // Timetable
  async getTimetable() {
    return this.request('/timetable');
  }

  async createTimetableEntry(data) {
    return this.request('/timetable', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTimetableEntry(id, data) {
    return this.request(`/timetable/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTimetableEntry(id) {
    return this.request(`/timetable/${id}`, {
      method: 'DELETE',
    });
  }

  // Documents
  async getDocuments() {
    return this.request('/documents');
  }

  async uploadDocument(formData) {
    const url = `${this.baseURL}/documents`;
    const config = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json',
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Document upload failed:', error);
      throw error;
    }
  }

  async deleteDocument(id) {
    return this.request(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  // Reports
  async getReports() {
    return this.request('/reports');
  }

  async generateReport(type, params = {}) {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ type, ...params }),
    });
  }
}

export default new ApiService(); 