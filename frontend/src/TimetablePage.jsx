import React, { useEffect, useState } from 'react';

// Helper for localStorage per class
function getClassConfig(classId) {
  const configs = JSON.parse(localStorage.getItem('timetableClassConfigs') || '{}');
  return configs[classId] || { periodDuration: 40, breakTimes: [{ start: '11:00', end: '11:20' }], maxPeriods: 7 };
}
function setClassConfig(classId, config) {
  const configs = JSON.parse(localStorage.getItem('timetableClassConfigs') || '{}');
  configs[classId] = config;
  localStorage.setItem('timetableClassConfigs', JSON.stringify(configs));
}

// Helper to get next available period time for a class on a given day
function getNextPeriodSuggestion(timetables, classId, day, config) {
  if (!classId || !day || !config) return { start: '', end: '' };
  // Get all periods for this class and day, sorted by start_time
  const entries = timetables.filter(tt => tt.class_id == classId && tt.day_of_week === day)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
  // Start from 08:00 by default
  let current = '08:00';
  let periodMins = config.periodDuration || 40;
  let maxPeriods = config.maxPeriods || 7;
  let breaks = config.breakTimes || [];
  for (let i = 0; i < maxPeriods; i++) {
    // Check if this slot is taken
    let periodEnd = addMinutes(current, periodMins);
    let overlaps = entries.some(e =>
      (e.start_time < periodEnd && e.end_time > current)
    );
    // Check if this slot is a break
    let isBreak = breaks.some(b =>
      (current < b.end && periodEnd > b.start)
    );
    if (!overlaps && !isBreak) {
      return { start: current, end: periodEnd };
    }
    // Move to next slot (skip break if needed)
    current = periodEnd;
    // If next slot is in a break, skip to end of break
    for (let b of breaks) {
      if (current >= b.start && current < b.end) {
        current = b.end;
      }
    }
  }
  return { start: '', end: '' };
}
function addMinutes(time, mins) {
  const [h, m] = time.split(':').map(Number);
  let total = h * 60 + m + mins;
  let nh = Math.floor(total / 60);
  let nm = total % 60;
  return `${nh.toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')}`;
}

// Helper: check for time overlap
function isOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

// Helper: generate period slots for a day
function getPeriodSlots(config) {
  const slots = [];
  let current = '08:00';
  let periodMins = config.periodDuration || 40;
  let maxPeriods = config.maxPeriods || 7;
  let breaks = config.breakTimes || [];
  for (let i = 0; i < maxPeriods; i++) {
    // If current is in a break, skip to end of break
    for (let b of breaks) {
      if (current >= b.start && current < b.end) {
        slots.push({ type: 'break', start: b.start, end: b.end });
        current = b.end;
      }
    }
    let periodEnd = addMinutes(current, periodMins);
    slots.push({ type: 'period', start: current, end: periodEnd });
    current = periodEnd;
  }
  return slots;
}

export default function TimetablePage() {
  const [timetables, setTimetables] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null); // timetable object or null
  const [showDelete, setShowDelete] = useState(null); // timetable object or null
  const [form, setForm] = useState({ class_id: '', subject_id: '', teacher_id: '', day_of_week: '', start_time: '', end_time: '' });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [classConfig, setClassConfigState] = useState(getClassConfig(''));

  // Lookup maps
  const classMap = Object.fromEntries(classes.map(c => [c.id, c.name]));
  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s.name]));
  const teacherMap = Object.fromEntries(teachers.map(t => [t.id, t.name]));

  // Filter teachers by selected subject
  const filteredTeachers = form.subject_id
    ? teachers.filter(t => Array.isArray(t.subject_ids) && t.subject_ids.includes(form.subject_id.toString()))
    : teachers;

  // Enhanced validation for add/edit
  function validateForm(isEdit = false) {
    if (!form.class_id || !form.subject_id || !form.teacher_id || !form.day_of_week || !form.start_time || !form.end_time) {
      return 'All fields are required.';
    }
    if (form.start_time >= form.end_time) {
      return 'Start time must be before end time.';
    }
    // Double-booking: class or teacher
    const excludeId = isEdit && showEdit ? showEdit.id : null;
    const conflicts = timetables.filter(tt =>
      (tt.class_id == form.class_id || tt.teacher_id == form.teacher_id) &&
      tt.day_of_week === form.day_of_week &&
      (!excludeId || tt.id != excludeId) &&
      isOverlap(form.start_time, form.end_time, tt.start_time, tt.end_time)
    );
    if (conflicts.length > 0) {
      return 'This class or teacher is already booked for the selected time.';
    }
    // Only assigned teachers for subject
    if (!filteredTeachers.some(t => t.id == form.teacher_id)) {
      return 'Selected teacher is not assigned to this subject.';
    }
    return null;
  }

  // CRUD handlers (add validation)
  const handleAdd = async (e) => {
    e.preventDefault();
    const err = validateForm(false);
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
    setFormLoading(true);
    try {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!data.success) {
        setFormError(data.message || 'Failed to create timetable entry');
        setFormLoading(false);
        return;
      }
      setShowAdd(false);
      setForm({ class_id: '', subject_id: '', teacher_id: '', day_of_week: '', start_time: '', end_time: '' });
      // Refresh
      await fetchAll();
    } catch (err) {
      setFormError('Network error');
    }
    setFormLoading(false);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const err = validateForm(true);
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
    setFormLoading(true);
    try {
      const res = await fetch('/api/timetable', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id: showEdit.id })
      });
      const data = await res.json();
      if (!data.success) {
        setFormError(data.message || 'Failed to update timetable entry');
        setFormLoading(false);
        return;
      }
      setShowEdit(null);
      setForm({ class_id: '', subject_id: '', teacher_id: '', day_of_week: '', start_time: '', end_time: '' });
      await fetchAll();
    } catch (err) {
      setFormError('Network error');
    }
    setFormLoading(false);
  };

  const handleDelete = async () => {
    if (!showDelete) return;
    setFormLoading(true);
    try {
      const res = await fetch('/api/timetable', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: showDelete.id })
      });
      const data = await res.json();
      setShowDelete(null);
      await fetchAll();
    } catch (err) {}
    setFormLoading(false);
  };

  // Open edit form
  const openEdit = (tt) => {
    setShowEdit(tt);
    setForm({
      class_id: tt.class_id,
      subject_id: tt.subject_id,
      teacher_id: tt.teacher_id,
      day_of_week: tt.day_of_week,
      start_time: tt.start_time,
      end_time: tt.end_time
    });
  };

  // Fetch all data (refactored for reuse)
  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const [ttRes, classRes, subjRes, teachRes] = await Promise.all([
        fetch('/api/timetable'),
        fetch('/api/classes'),
        fetch('/api/subjects'),
        fetch('/api/teachers'),
      ]);
      const [ttData, classData, subjData, teachData] = await Promise.all([
        ttRes.json(), classRes.json(), subjRes.json(), teachRes.json()
      ]);
      if (ttData.success && classData.success && subjData.success && teachData.success) {
        setTimetables(ttData.timetables || []);
        setClasses(classData.data || []);
        setSubjects(subjData.data || []);
        setTeachers(teachData.data || []);
      } else {
        setError('Failed to fetch timetable or lookup data');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
  }, []);

  // Update config when class changes
  useEffect(() => {
    setClassConfigState(getClassConfig(selectedClass));
  }, [selectedClass]);

  // Save config
  const handleConfigChange = (field, value) => {
    const newConfig = { ...classConfig, [field]: value };
    setClassConfigState(newConfig);
    if (selectedClass) setClassConfig(selectedClass, newConfig);
  };
  const handleBreakChange = (idx, field, value) => {
    const newBreaks = classConfig.breakTimes.map((b, i) => i === idx ? { ...b, [field]: value } : b);
    handleConfigChange('breakTimes', newBreaks);
  };
  const addBreak = () => handleConfigChange('breakTimes', [...classConfig.breakTimes, { start: '', end: '' }]);
  const removeBreak = idx => handleConfigChange('breakTimes', classConfig.breakTimes.filter((_, i) => i !== idx));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-700 text-white py-6 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Timetable Management</h2>
          <button className="bg-white text-blue-700 px-4 py-2 rounded hover:bg-blue-100 font-semibold shadow" onClick={() => { setShowAdd(true); setForm({ class_id: '', subject_id: '', teacher_id: '', day_of_week: '', start_time: '', end_time: '' }); }}>+ Add Entry</button>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Class selection and config panel */}
        <div className="mb-6 bg-white rounded shadow p-6">
          <div className="mb-4 flex flex-col md:flex-row md:items-center gap-4">
            <div>
              <label className="block mb-1 font-medium">Select Class</label>
              <select className="border rounded px-3 py-2" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                <option value="">All Classes</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {selectedClass && (
              <>
                <div>
                  <label className="block mb-1 font-medium">Period Duration (minutes)</label>
                  <input type="number" min="1" className="border rounded px-3 py-2 w-24" value={classConfig.periodDuration} onChange={e => handleConfigChange('periodDuration', parseInt(e.target.value)||0)} />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Max Periods/Day</label>
                  <input type="number" min="1" className="border rounded px-3 py-2 w-24" value={classConfig.maxPeriods} onChange={e => handleConfigChange('maxPeriods', parseInt(e.target.value)||0)} />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Break Times</label>
                  {classConfig.breakTimes.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 mb-1">
                      <input type="time" className="border rounded px-2 py-1" value={b.start} onChange={e => handleBreakChange(i, 'start', e.target.value)} />
                      <span>-</span>
                      <input type="time" className="border rounded px-2 py-1" value={b.end} onChange={e => handleBreakChange(i, 'end', e.target.value)} />
                      <button type="button" className="text-red-600 ml-2" onClick={() => removeBreak(i)}>&times;</button>
                    </div>
                  ))}
                  <button type="button" className="text-blue-700 underline mt-1" onClick={addBreak}>+ Add Break</button>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-xl font-semibold">Weekly Timetable</h3>
            <div>
              {/* Filters for class, teacher, subject, etc. */}
              <select className="border rounded px-3 py-1 mr-2" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                <option value="">All Classes</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          {selectedClass ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-center">
                <thead>
                  <tr>
                    <th className="border px-4 py-2 bg-gray-50">Day</th>
                    {getPeriodSlots(classConfig).map((slot, i) => (
                      <th key={i} className={`border px-4 py-2 ${slot.type === 'break' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-50'}`}>
                        {slot.type === 'break' ? `Break (${slot.start} - ${slot.end})` : `Period ${i + 1 - getPeriodSlots(classConfig).slice(0, i).filter(s => s.type === 'break').length}\n${slot.start} - ${slot.end}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day => (
                    <tr key={day}>
                      <td className="border px-4 py-2 font-semibold bg-gray-50">{day}</td>
                      {getPeriodSlots(classConfig).map((slot, i) => {
                        if (slot.type === 'break') {
                          return <td key={i} className="border px-4 py-2 bg-yellow-50 text-yellow-700 font-semibold">Break</td>;
                        }
                        // Find timetable entry for this class, day, and slot
                        const entry = timetables.find(tt =>
                          tt.class_id == selectedClass &&
                          tt.day_of_week === day &&
                          tt.start_time === slot.start &&
                          tt.end_time === slot.end
                        );
                        return (
                          <td key={i} className={`border px-4 py-2 transition-all duration-150 ${entry ? 'bg-blue-100 hover:bg-blue-200 cursor-pointer' : 'bg-white hover:bg-blue-50'}`}
                            onClick={() => entry ? openEdit(entry) : setShowAdd(true)}
                            title={entry ? `Edit: ${subjectMap[entry.subject_id]} (${teacherMap[entry.teacher_id]})` : 'Add entry'}>
                            {entry ? (
                              <div>
                                <div className="font-semibold text-blue-800">{subjectMap[entry.subject_id]}</div>
                                <div className="text-xs text-gray-700">{teacherMap[entry.teacher_id]}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Fallback: show flat list for all classes
            <div className="overflow-x-auto">
              <table className="min-w-full border text-center">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Class</th>
                    <th className="border px-4 py-2">Subject</th>
                    <th className="border px-4 py-2">Teacher</th>
                    <th className="border px-4 py-2">Day</th>
                    <th className="border px-4 py-2">Start Time</th>
                    <th className="border px-4 py-2">End Time</th>
                    <th className="border px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {timetables.length === 0 ? (
                    <tr><td colSpan={7} className="text-gray-500 py-4">No timetable entries found.</td></tr>
                  ) : (
                    timetables.map(tt => (
                      <tr key={tt.id} className="border-b hover:bg-gray-50">
                        <td className="border px-4 py-2">{classMap[tt.class_id] || tt.class_id}</td>
                        <td className="border px-4 py-2">{subjectMap[tt.subject_id] || tt.subject_id}</td>
                        <td className="border px-4 py-2">{teacherMap[tt.teacher_id] || tt.teacher_id}</td>
                        <td className="border px-4 py-2">{tt.day_of_week}</td>
                        <td className="border px-4 py-2">{tt.start_time}</td>
                        <td className="border px-4 py-2">{tt.end_time}</td>
                        <td className="border px-4 py-2">
                          <button className="text-green-600 hover:underline mr-2" onClick={() => openEdit(tt)}>Edit</button>
                          <button className="text-red-600 hover:underline" onClick={() => setShowDelete(tt)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      {/* Add Timetable Entry Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded shadow-lg p-8 w-full max-w-md relative" onSubmit={handleAdd}>
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowAdd(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Add Timetable Entry</h3>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Class</label>
              <select className="w-full border rounded px-3 py-2" required value={form.class_id} onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))}>
                <option value="">Select class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Subject</label>
              <select className="w-full border rounded px-3 py-2" required value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}>
                <option value="">Select subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Teacher</label>
              <select className="w-full border rounded px-3 py-2" required value={form.teacher_id} onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))}>
                <option value="">Select teacher</option>
                {filteredTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {form.subject_id && filteredTeachers.length === 0 && (
                <div className="text-xs text-red-600 mt-1">No teachers assigned to this subject.</div>
              )}
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Day of Week</label>
              <select className="w-full border rounded px-3 py-2" required value={form.day_of_week} onChange={e => setForm(f => ({ ...f, day_of_week: e.target.value }))}>
                <option value="">Select day</option>
                {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day => <option key={day} value={day}>{day}</option>)}
              </select>
            </div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex-1">
                <label className="block mb-1 font-medium">Start Time</label>
                <input className="w-full border rounded px-3 py-2" required type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium">End Time</label>
                <input className="w-full border rounded px-3 py-2" required type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
              </div>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <button type="button" className="text-blue-700 underline" disabled={!form.class_id || !form.day_of_week} onClick={() => {
                const config = getClassConfig(form.class_id);
                const suggestion = getNextPeriodSuggestion(timetables, form.class_id, form.day_of_week, config);
                setForm(f => ({ ...f, start_time: suggestion.start, end_time: suggestion.end }));
              }}>Suggest Next Period</button>
              <span className="text-xs text-gray-500">{form.class_id && form.day_of_week ? (() => {
                const config = getClassConfig(form.class_id);
                const suggestion = getNextPeriodSuggestion(timetables, form.class_id, form.day_of_week, config);
                return suggestion.start && suggestion.end ? `Next available: ${suggestion.start} - ${suggestion.end}` : 'No available slot';
              })() : 'Select class and day to get suggestion.'}</span>
            </div>
            {formError && <div className="text-red-600 mb-2">{formError}</div>}
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow w-full" disabled={formLoading}>{formLoading ? 'Adding...' : 'Add Entry'}</button>
          </form>
        </div>
      )}
      {/* Edit Timetable Entry Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded shadow-lg p-8 w-full max-w-md relative" onSubmit={handleEdit}>
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowEdit(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Edit Timetable Entry</h3>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Class</label>
              <select className="w-full border rounded px-3 py-2" required value={form.class_id} onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))}>
                <option value="">Select class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Subject</label>
              <select className="w-full border rounded px-3 py-2" required value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}>
                <option value="">Select subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Teacher</label>
              <select className="w-full border rounded px-3 py-2" required value={form.teacher_id} onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))}>
                <option value="">Select teacher</option>
                {filteredTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {form.subject_id && filteredTeachers.length === 0 && (
                <div className="text-xs text-red-600 mt-1">No teachers assigned to this subject.</div>
              )}
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Day of Week</label>
              <select className="w-full border rounded px-3 py-2" required value={form.day_of_week} onChange={e => setForm(f => ({ ...f, day_of_week: e.target.value }))}>
                <option value="">Select day</option>
                {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day => <option key={day} value={day}>{day}</option>)}
              </select>
            </div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex-1">
                <label className="block mb-1 font-medium">Start Time</label>
                <input className="w-full border rounded px-3 py-2" required type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium">End Time</label>
                <input className="w-full border rounded px-3 py-2" required type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
              </div>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <button type="button" className="text-blue-700 underline" disabled={!form.class_id || !form.day_of_week} onClick={() => {
                const config = getClassConfig(form.class_id);
                const suggestion = getNextPeriodSuggestion(timetables, form.class_id, form.day_of_week, config);
                setForm(f => ({ ...f, start_time: suggestion.start, end_time: suggestion.end }));
              }}>Suggest Next Period</button>
              <span className="text-xs text-gray-500">{form.class_id && form.day_of_week ? (() => {
                const config = getClassConfig(form.class_id);
                const suggestion = getNextPeriodSuggestion(timetables, form.class_id, form.day_of_week, config);
                return suggestion.start && suggestion.end ? `Next available: ${suggestion.start} - ${suggestion.end}` : 'No available slot';
              })() : 'Select class and day to get suggestion.'}</span>
            </div>
            {formError && <div className="text-red-600 mb-2">{formError}</div>}
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded shadow w-full" disabled={formLoading}>{formLoading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      )}
      {/* Delete Timetable Entry Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md relative">
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowDelete(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-red-700">Delete Timetable Entry</h3>
            <div className="mb-4">Are you sure you want to delete this timetable entry?</div>
            <button className="bg-red-600 text-white px-4 py-2 rounded shadow mr-2" onClick={handleDelete} disabled={formLoading}>{formLoading ? 'Deleting...' : 'Yes, Delete'}</button>
            <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded shadow" onClick={() => setShowDelete(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
} 