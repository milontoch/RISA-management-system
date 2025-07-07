import React, { useEffect, useState } from 'react';

export default function ReportsPage() {
  // Mock exam data (replace with API call later)
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [examError, setExamError] = useState(null);

  useEffect(() => {
    setLoadingExams(true);
    fetch('/api/exams')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setExams(data.data || []);
          setExamError(null);
        } else {
          setExamError(data.message || 'Failed to fetch exams');
        }
      })
      .catch(() => setExamError('Failed to fetch exams'))
      .finally(() => setLoadingExams(false));
  }, []);

  // State for class, exam, subject selection
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [filteredExams, setFilteredExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState(null);

  // Fetch classes and subjects on mount
  useEffect(() => {
    fetch('/api/classes')
      .then(res => res.json())
      .then(data => setClasses(data.data || []));
    fetch('/api/subjects')
      .then(res => res.json())
      .then(data => setSubjects(data.data || []));
  }, []);

  // Filter exams by selected class
  useEffect(() => {
    if (selectedClass) {
      setFilteredExams(exams.filter(e => String(e.class_id) === String(selectedClass)));
    } else {
      setFilteredExams([]);
    }
    setSelectedExam('');
  }, [selectedClass, exams]);

  // Fetch students for selected class
  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }
    setLoadingStudents(true);
    setStudentsError(null);
    fetch(`/api/students?class_id=${selectedClass}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.users) {
          setStudents(data.users);
        } else {
          setStudentsError(data.message || 'Failed to fetch students');
        }
      })
      .catch(() => setStudentsError('Failed to fetch students'))
      .finally(() => setLoadingStudents(false));
  }, [selectedClass]);

  // Mock students and results data (replace with API call later)
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [resultsError, setResultsError] = useState(null);

  useEffect(() => {
    setLoadingResults(true);
    fetch('/api/results')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setResults(data.data || []);
          setResultsError(null);
        } else {
          setResultsError(data.message || 'Failed to fetch results');
        }
      })
      .catch(() => setResultsError('Failed to fetch results'))
      .finally(() => setLoadingResults(false));
  }, []);
  const [marksInput, setMarksInput] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Handler for marks input (updated to clear status)
  const handleMarksChange = (studentId, value) => {
    setMarksInput(prev => ({ ...prev, [studentId]: value }));
    setSubmitStatus(null);
  };

  // Handler for submitting marks to backend
  const handleSubmitMarks = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);
    let hasError = false;
    let errorMsg = '';
    for (const student of students) {
      const marks = marksInput[student.id];
      if (marks === undefined || marks === '') continue; // skip empty
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: student.id,
          exam_id: selectedExam,
          subject_id: selectedSubject,
          marks_obtained: Number(marks),
          total_marks: 100
        })
      });
      const data = await res.json();
      if (!data.success) {
        hasError = true;
        errorMsg = data.message || 'Failed to submit some results.';
        break;
      }
    }
    setSubmitting(false);
    if (hasError) {
      setSubmitStatus({ type: 'error', message: errorMsg });
    } else {
      setSubmitStatus({ type: 'success', message: 'Marks submitted successfully!' });
      setMarksInput({});
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Exams & Results</h2>
      {/* Exam Schedule Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Exam Schedule</h3>
        <div className="bg-white border rounded shadow p-4">
          {loadingExams ? (
            <div className="text-gray-500">Loading exams...</div>
          ) : examError ? (
            <div className="text-red-600">{examError}</div>
          ) : (
            <div className="table-responsive">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">Exam Name</th>
                    <th className="py-2 px-4 text-left">Class</th>
                    <th className="py-2 px-4 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.length === 0 ? (
                    <tr><td colSpan="3" className="text-center text-gray-500 py-4">No exams scheduled.</td></tr>
                  ) : (
                    exams.map(exam => (
                      <tr key={exam.id}>
                        <td className="py-2 px-4">{exam.name}</td>
                        <td className="py-2 px-4">{exam.class_name}</td>
                        <td className="py-2 px-4">{exam.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* Enter Results Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Enter Results</h3>
        <div className="bg-white border rounded shadow p-4">
          {/* Selection controls */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block mb-1 font-medium">Class</label>
              <select className="border rounded px-2 py-1" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                <option value="">Select class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Exam</label>
              <select className="border rounded px-2 py-1" value={selectedExam} onChange={e => setSelectedExam(e.target.value)} disabled={!selectedClass}>
                <option value="">Select exam</option>
                {filteredExams.map(e => <option key={e.id} value={e.id}>{e.name} ({e.date})</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Subject</label>
              <select className="border rounded px-2 py-1" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                <option value="">Select subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          {/* Students table for marks entry */}
          {loadingStudents ? (
            <div className="text-gray-500">Loading students...</div>
          ) : studentsError ? (
            <div className="text-red-600">{studentsError}</div>
          ) : !selectedClass || !selectedExam || !selectedSubject ? (
            <div className="text-gray-500">Select class, exam, and subject to enter marks.</div>
          ) : students.length === 0 ? (
            <div className="text-gray-500">No students found for this class.</div>
          ) : (
            <form onSubmit={handleSubmitMarks}>
              <div className="table-responsive">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 text-left">Roll No.</th>
                      <th className="py-2 px-4 text-left">Student Name</th>
                      <th className="py-2 px-4 text-left">Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td className="py-2 px-4">{student.roll_number}</td>
                        <td className="py-2 px-4">{student.name}</td>
                        <td className="py-2 px-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="border rounded px-2 py-1 w-20"
                            value={marksInput[student.id] || ''}
                            onChange={e => handleMarksChange(student.id, e.target.value)}
                            disabled={submitting}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 button-touch" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Marks'}
              </button>
              {submitStatus && (
                <div className={`mt-4 ${submitStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{submitStatus.message}</div>
              )}
            </form>
          )}
        </div>
      </div>
      {/* View Results Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2">View Results</h3>
        <div className="bg-white border rounded shadow p-4">
          {loadingResults ? (
            <div className="text-gray-500">Loading results...</div>
          ) : resultsError ? (
            <div className="text-red-600">{resultsError}</div>
          ) : (
            <div className="table-responsive">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">Student Name</th>
                    <th className="py-2 px-4 text-left">Exam</th>
                    <th className="py-2 px-4 text-left">Subject</th>
                    <th className="py-2 px-4 text-left">Marks</th>
                    <th className="py-2 px-4 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {results.length === 0 ? (
                    <tr><td colSpan="5" className="text-center text-gray-500 py-4">No results found.</td></tr>
                  ) : (
                    results.map(result => (
                      <tr key={result.id}>
                        <td className="py-2 px-4">{result.student_name}</td>
                        <td className="py-2 px-4">{result.exam_name}</td>
                        <td className="py-2 px-4">{result.subject_name}</td>
                        <td className="py-2 px-4">{result.marks_obtained}</td>
                        <td className="py-2 px-4">{result.total_marks}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 