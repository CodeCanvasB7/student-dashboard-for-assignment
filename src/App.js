
import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Trash2, Calendar, Flag, GripVertical, AlertCircle, ChevronDown, Check, X, Search } from 'lucide-react';

const AssignmentTracker = () => {
    const [assignments, setAssignments] = useState([
        { id: '1', text: 'Complete Math Homework 5', dueDate: '2024-10-27', priority: 'high', completed: false },
        { id: '2', text: 'Read Chapter 4 of History book', dueDate: '2024-10-25', priority: 'medium', completed: false },
        { id: '3', text: 'Prepare for Physics Lab', dueDate: '2024-10-26', priority: 'high', completed: true },
        { id: '4', text: 'Start drafting English essay', dueDate: '2024-11-01', priority: 'low', completed: false },
    ]);

    const [newAssignmentText, setNewAssignmentText] = useState('');
    const [newAssignmentDueDate, setNewAssignmentDueDate] = useState('');
    const [newAssignmentPriority, setNewAssignmentPriority] = useState('medium');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('dueDate');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [draggedItemId, setDraggedItemId] = useState(null);

    const handleAddAssignment = (e) => {
        e.preventDefault();
        if (!newAssignmentText.trim()) {
            setError('Assignment description cannot be empty.');
            return;
        }
        if (!newAssignmentDueDate) {
            setError('Please select a due date.');
            return;
        }
        const newAssignment = {
            id: Date.now().toString(),
            text: newAssignmentText,
            dueDate: newAssignmentDueDate,
            priority: newAssignmentPriority,
            completed: false,
        };
        setAssignments([newAssignment, ...assignments]);
        setNewAssignmentText('');
        setNewAssignmentDueDate('');
        setNewAssignmentPriority('medium');
        setError('');
    };

    const toggleComplete = useCallback((id) => {
        setAssignments(assignments.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
    }, [assignments]);

    const deleteAssignment = useCallback((id) => {
        setAssignments(assignments.filter(a => a.id !== id));
    }, [assignments]);

    const handleDragStart = (e, id) => {
        setDraggedItemId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        if (draggedItemId === targetId) return;

        const draggedIndex = assignments.findIndex(a => a.id === draggedItemId);
        const targetIndex = assignments.findIndex(a => a.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const newAssignments = [...assignments];
        const [draggedItem] = newAssignments.splice(draggedIndex, 1);
        newAssignments.splice(targetIndex, 0, draggedItem);

        setAssignments(newAssignments);
        setDraggedItemId(null);
    };

    const handleDragEnd = () => {
        setDraggedItemId(null);
    };

    const filteredAndSortedAssignments = useMemo(() => {
        let result = [...assignments];

        if (searchTerm.trim()) {
            result = result.filter(a =>
                a.text.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filter === 'active') {
            result = result.filter(a => !a.completed);
        } else if (filter === 'completed') {
            result = result.filter(a => a.completed);
        }

        if (sortBy === 'dueDate') {
            result.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        } else if (sortBy === 'priority') {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        }

        return result;
    }, [assignments, filter, sortBy, searchTerm]);

    const priorityConfig = {
        low: { label: 'Low', color: 'bg-emerald-100 text-emerald-800', ring: 'ring-emerald-300' },
        medium: { label: 'Medium', color: 'bg-amber-100 text-amber-800', ring: 'ring-amber-300' },
        high: { label: 'High', color: 'bg-rose-100 text-rose-800', ring: 'ring-rose-300' },
    };

    const completedCount = useMemo(() => assignments.filter(a => a.completed).length, [assignments]);
    const totalCount = assignments.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const getDaysRemaining = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'Overdue';
        if (diffDays === 0) return 'Due today';
        if (diffDays === 1) return 'Due tomorrow';
        return `${diffDays} days left`;
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-800 antialiased p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">Assignment Tracker</h1>
                    <p className="mt-2 text-lg text-slate-600">Stay organized and conquer your workload.</p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 lg:order-last">
                        <div className="sticky top-8 space-y-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Assignment</h2>
                                <form onSubmit={handleAddAssignment} className="space-y-4">
                                    <div>
                                        <label htmlFor="assignment-text" className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
                                        <input
                                            id="assignment-text"
                                            type="text"
                                            value={newAssignmentText}
                                            onChange={(e) => { setNewAssignmentText(e.target.value); setError(''); }}
                                            placeholder="e.g., Finish chemistry report"
                                            className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="due-date" className="text-sm font-medium text-slate-700 mb-1 block">Due Date</label>
                                            <input
                                                id="due-date"
                                                type="date"
                                                value={newAssignmentDueDate}
                                                onChange={(e) => { setNewAssignmentDueDate(e.target.value); setError(''); }}
                                                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="priority" className="text-sm font-medium text-slate-700 mb-1 block">Priority</label>
                                            <div className="relative">
                                                <select
                                                    id="priority"
                                                    value={newAssignmentPriority}
                                                    onChange={(e) => setNewAssignmentPriority(e.target.value)}
                                                    className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                    {error && (
                                        <div className="flex items-center text-sm text-red-600">
                                            <AlertCircle className="w-4 h-4 mr-2" />
                                            {error}
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Add Assignment
                                    </button>
                                </form>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">Statistics</h2>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center text-sm mb-1">
                                            <span className="font-medium text-slate-700">Progress</span>
                                            <span className="font-semibold text-indigo-600">{Math.round(progress)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                                            <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        <p>{completedCount} of {totalCount} assignments completed.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                            <div className="relative w-full md:max-w-xs">
                                <label htmlFor="search-assignments" className="sr-only">Search assignments</label>
                                <input
                                    id="search-assignments"
                                    type="text"
                                    placeholder="Search assignments..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 w-full md:w-auto">
                                <div className="flex items-center bg-white p-1 rounded-lg shadow-sm border border-slate-200">
                                    {['all', 'active', 'completed'].map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            {f.charAt(0).toUpperCase() + f.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <label htmlFor="sort-by" className="text-sm font-medium text-slate-700">Sort by:</label>
                                    <div className="relative">
                                        <select
                                            id="sort-by"
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none pr-8"
                                        >
                                            <option value="dueDate">Due Date</option>
                                            <option value="priority">Priority</option>
                                        </select>
                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {filteredAndSortedAssignments.length > 0 ? (
                                filteredAndSortedAssignments.map(assignment => (
                                    <div
                                        key={assignment.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, assignment.id)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, assignment.id)}
                                        onDragEnd={handleDragEnd}
                                        className={`flex items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 transition-all duration-300 ${draggedItemId === assignment.id ? 'opacity-50 scale-105' : 'opacity-100'} ${assignment.completed ? 'bg-slate-100' : 'bg-white'}`}
                                        aria-label={`Assignment: ${assignment.text}`}
                                    >
                                        <div className="flex-shrink-0 cursor-move text-slate-400 hover:text-slate-600 transition-colors" aria-label="Drag to reorder">
                                            <GripVertical className="w-5 h-5" />
                                        </div>
                                        <div className="ml-3 flex-shrink-0">
                                            <button
                                                onClick={() => toggleComplete(assignment.id)}
                                                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${assignment.completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 hover:border-indigo-500'}`}
                                                aria-label={assignment.completed ? 'Mark as not complete' : 'Mark as complete'}
                                            >
                                                {assignment.completed && <Check className="w-4 h-4 text-white" />}
                                            </button>
                                        </div>
                                        <div className="flex-grow mx-4">
                                            <p className={`font-medium text-slate-800 transition-colors ${assignment.completed ? 'line-through text-slate-500' : ''}`}>
                                                {assignment.text}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>{getDaysRemaining(assignment.dueDate)}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Flag className="w-3.5 h-3.5" />
                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${priorityConfig[assignment.priority].color}`}>
                                                        {priorityConfig[assignment.priority].label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 ml-4">
                                            <button
                                                onClick={() => deleteAssignment(assignment.id)}
                                                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-100 rounded-full transition-all"
                                                aria-label="Delete assignment"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                                    {searchTerm ? (
                                        <>
                                            <Search className="mx-auto h-12 w-12 text-slate-400" />
                                            <h3 className="mt-2 text-xl font-semibold text-slate-900">No Results Found</h3>
                                            <p className="mt-1 text-slate-500">Your search for "{searchTerm}" did not match any assignments.</p>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="mx-auto h-12 w-12 text-emerald-500" />
                                            <h3 className="mt-2 text-xl font-semibold text-slate-900">All Caught Up!</h3>
                                            <p className="mt-1 text-slate-500">
                                                {filter === 'all' && 'You have no assignments. Add one to get started.'}
                                                {filter === 'active' && 'You have no active assignments.'}
                                                {filter === 'completed' && 'You have no completed assignments.'}
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AssignmentTracker;
