"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Plus, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCalendarData, addCalendarTask, deleteCalendarTask, addCalendarNote, deleteCalendarNote } from "../actions";

interface Task {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  type: "homework" | "deadline" | "other";
}

interface Note {
  id: string;
  content: string;
  date: string;
}

export default function CalendarSidebar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  // Task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState<"homework" | "deadline" | "other">("homework");
  
  // Note form state
  const [newNoteContent, setNewNoteContent] = useState("");

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getCalendarData();
        setTasks(data.tasks as Task[]);
        setNotes(data.notes as Note[]);
      } catch (error) {
        console.error("Failed to fetch calendar data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const getTasksForDate = (date: string) => {
    return tasks.filter(task => task.date === date);
  };

  const getNotesForDate = (date: string) => {
    return notes.filter(note => note.date === date);
  };

  const getUpcomingTasks = () => {
    const now = new Date().toISOString().split('T')[0];
    return tasks
      .filter(task => task.date >= now)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedDate) return;
    
    const tempId = Date.now().toString();
    const newTask: Task = {
      id: tempId,
      title: newTaskTitle,
      date: selectedDate,
      type: newTaskType,
    };
    
    // Optimistic update
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle("");

    try {
      const { id } = await addCalendarTask(newTask.title, newTask.date, newTask.type);
      // Replace temp ID with real ID from server
      setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id } : t));
    } catch (error) {
      console.error("Failed to add task:", error);
      setTasks(prev => prev.filter(t => t.id !== tempId));
    }
  };

  const handleDeleteTask = async (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (!taskToDelete) return;

    // Optimistic update
    setTasks(prev => prev.filter(t => t.id !== id));

    try {
      await deleteCalendarTask(id);
    } catch (error) {
      console.error("Failed to delete task:", error);
      setTasks(prev => [...prev, taskToDelete]);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !selectedDate) return;
    
    const tempId = Date.now().toString();
    const newNote: Note = {
      id: tempId,
      content: newNoteContent,
      date: selectedDate,
    };
    
    // Optimistic update
    setNotes(prev => [...prev, newNote]);
    setNewNoteContent("");

    try {
      const { id } = await addCalendarNote(newNote.content, newNote.date);
      setNotes(prev => prev.map(n => n.id === tempId ? { ...n, id } : n));
    } catch (error) {
      console.error("Failed to add note:", error);
      setNotes(prev => prev.filter(n => n.id !== tempId));
    }
  };

  const handleDeleteNote = async (id: string) => {
    const noteToDelete = notes.find(n => n.id === id);
    if (!noteToDelete) return;

    // Optimistic update
    setNotes(prev => prev.filter(n => n.id !== id));

    try {
      await deleteCalendarNote(id);
    } catch (error) {
      console.error("Failed to delete note:", error);
      setNotes(prev => [...prev, noteToDelete]);
    }
  };

  const taskColors = {
    homework: "bg-[#82A7A6]",
    deadline: "bg-red-500",
    other: "bg-purple-500",
  };

  const renderCalendarDays = (isModal = false) => {
    const days = [];
    const cellClass = isModal ? "p-3 text-base" : "p-1.5 text-xs";
    const dotSize = isModal ? "w-1.5 h-1.5" : "w-1 h-1";

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={cellClass} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTasks = getTasksForDate(dateStr);
      const isToday = dateStr === today;
      const isSelected = dateStr === selectedDate;

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`${cellClass} aspect-square rounded-lg transition-all hover:bg-slate-100 flex flex-col items-center justify-center relative
            ${isToday ? 'bg-[#82A7A6] text-white hover:bg-[#6B8A89]' : ''}
            ${isSelected ? 'ring-2 ring-[#82A7A6] bg-[#82A7A6]/10' : ''}
          `}
        >
          <span className={`${isModal ? 'text-base' : 'text-xs'} font-medium`}>{day}</span>
          {dayTasks.length > 0 && (
            <div className="flex gap-0.5 mt-0.5">
              {dayTasks.slice(0, 3).map((task, idx) => (
                <div key={idx} className={`${dotSize} rounded-full ${taskColors[task.type]}`} />
              ))}
            </div>
          )}
        </button>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#82A7A6]"></div>
      </div>
    );
  }

  return (
    <>
      {/* Sidebar Calendar Widget */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">
            {monthNames[month]} {year}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setIsExpanded(true)}
              className="p-1 text-slate-400 hover:text-[#82A7A6] hover:bg-slate-100 rounded transition-colors ml-1"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <div key={idx} className="text-center text-[10px] font-medium text-slate-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {renderCalendarDays(false)}
        </div>

        {/* Quick add or upcoming tasks */}
        {selectedDate ? (
          <div className="border-t border-slate-200 pt-3 space-y-2">
            <form onSubmit={handleAddTask} className="space-y-2">
              <input
                type="text"
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82A7A6]/20 focus:border-[#82A7A6]"
              />
              <div className="flex gap-2">
                <select
                  value={newTaskType}
                  onChange={(e) => setNewTaskType(e.target.value as "homework" | "deadline" | "other")}
                  className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82A7A6]/20 focus:border-[#82A7A6]"
                >
                  <option value="homework">Homework</option>
                  <option value="deadline">Deadline</option>
                  <option value="other">Other</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#82A7A6] text-white text-xs font-medium rounded-lg hover:bg-[#6B8A89] transition-colors flex items-center gap-1"
                >
                  <Plus size={12} />
                  Add
                </button>
              </div>
            </form>
            <button
              onClick={() => setSelectedDate(null)}
              className="w-full text-xs text-slate-500 hover:text-slate-700 py-1"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="border-t border-slate-200 pt-3">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Upcoming Tasks</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {getUpcomingTasks().length === 0 ? (
                <p className="text-xs text-slate-400 italic">No upcoming tasks</p>
              ) : (
                getUpcomingTasks().map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-start gap-2 hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${taskColors[task.type]} mt-1.5 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{task.title}</p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(task.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-6xl h-[85vh] bg-white rounded-3xl shadow-2xl z-[70] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#82A7A6]/10 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📅</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      {monthNames[month]} {year}
                    </h2>
                    <p className="text-sm text-slate-500">Plan your semester</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ml-2"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex flex-1 overflow-hidden">
                {/* Left: Calendar */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                      <div key={day} className="text-center text-sm font-semibold text-slate-600">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {renderCalendarDays(true)}
                  </div>
                </div>

                {/* Right: Details Panel */}
                <AnimatePresence>
                  {selectedDate && (
                    <motion.div
                      initial={{ x: 384, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 384, opacity: 0 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="w-96 border-l border-slate-200 bg-slate-50/30 overflow-y-auto"
                    >
                      <div className="p-6 space-y-6">
                        {/* Date Header */}
                        <div className="border-b border-slate-200 pb-4">
                          <h3 className="text-lg font-bold text-slate-800">
                            {new Date(selectedDate).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">
                            {getTasksForDate(selectedDate).length} tasks, {getNotesForDate(selectedDate).length} notes
                          </p>
                        </div>

                        {/* Tasks Section */}
                        <div>
                          <h4 className="text-sm font-bold text-slate-700 mb-3">Tasks</h4>
                          <div className="space-y-2 mb-4">
                            {getTasksForDate(selectedDate).map((task) => (
                              <div
                                key={task.id}
                                className="group bg-slate-900/5 rounded-xl p-3 hover:bg-slate-900/10 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2 flex-1">
                                    <div className={`w-2 h-2 rounded-full ${taskColors[task.type]} mt-1.5 flex-shrink-0`} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-slate-800">{task.title}</p>
                                      <p className="text-xs text-slate-500 capitalize mt-0.5">{task.type}</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Add Task Form */}
                          <form onSubmit={handleAddTask} className="space-y-2">
                            <input
                              type="text"
                              placeholder="New task title..."
                              value={newTaskTitle}
                              onChange={(e) => setNewTaskTitle(e.target.value)}
                              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82A7A6]/20 focus:border-[#82A7A6]"
                            />
                            <div className="flex gap-2">
                              <select
                                value={newTaskType}
                                onChange={(e) => setNewTaskType(e.target.value as "homework" | "deadline" | "other")}
                                className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82A7A6]/20 focus:border-[#82A7A6]"
                              >
                                <option value="homework">Homework</option>
                                <option value="deadline">Deadline</option>
                                <option value="other">Other</option>
                              </select>
                              <button
                                type="submit"
                                className="px-4 py-2 bg-[#82A7A6] text-white text-sm font-medium rounded-xl hover:bg-[#6B8A89] transition-colors flex items-center gap-2"
                              >
                                <Plus size={16} />
                                Add Task
                              </button>
                            </div>
                          </form>
                        </div>

                        {/* Notes Section */}
                        <div>
                          <h4 className="text-sm font-bold text-slate-700 mb-3">Notes</h4>
                          <div className="space-y-2 mb-4">
                            {getNotesForDate(selectedDate).map((note) => (
                              <div
                                key={note.id}
                                className="group bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 relative"
                              >
                                <p className="text-sm text-slate-700 pr-6">{note.content}</p>
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Add Note Form */}
                          <form onSubmit={handleAddNote} className="space-y-2">
                            <textarea
                              placeholder="Add a note..."
                              value={newNoteContent}
                              onChange={(e) => setNewNoteContent(e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 resize-none"
                            />
                            <button
                              type="submit"
                              className="w-full px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-xl hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <Plus size={16} />
                              Add Note
                            </button>
                          </form>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}