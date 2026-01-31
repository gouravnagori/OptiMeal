import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_URL } from '../config';

const StudentManagement = ({ messId }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'verified', 'unverified'
    const [searchTerm, setSearchTerm] = useState('');

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(
                `${API_URL}/api/auth/get-all-students?messId=${messId}&filter=${filter}`
            );
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (messId) {
            fetchStudents();
        }
    }, [messId, filter]);

    const handleToggleStatus = async (studentId, currentStatus) => {
        try {
            await axios.post(`${API_URL}/api/auth/toggle-student-status`, {
                studentId,
                isVerified: !currentStatus
            });
            toast.success(currentStatus ? 'Student unverified' : 'Student verified');
            fetchStudents();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDeleteStudent = async (studentId, studentName) => {
        if (!window.confirm(`Are you sure you want to remove ${studentName}? This action cannot be undone.`)) {
            return;
        }
        try {
            await axios.delete(`${API_URL}/api/auth/delete-student?studentId=${studentId}`);
            toast.success('Student removed successfully');
            fetchStudents();
        } catch (error) {
            toast.error('Failed to remove student');
        }
    };

    const filteredStudents = students.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col gap-4 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 flex-wrap">
                    <span className="text-xl sm:text-2xl">👥</span> Student Management
                    <span className="text-xs sm:text-sm font-normal text-gray-400">({students.length} total)</span>
                </h2>

                <div className="flex flex-wrap gap-2">
                    {['all', 'verified', 'unverified'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${filter === f
                                ? 'bg-primary text-dark'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {f === 'all' ? 'All' : f === 'verified' ? '✓ Verified' : '⏳ Pending'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-primary outline-none"
                />
            </div>

            {/* Student List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p className="text-4xl mb-2">📭</p>
                    <p>No students found</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 sm:pr-2">
                    {filteredStudents.map((student) => (
                        <div
                            key={student._id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <img
                                    src={student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`}
                                    alt={student.name}
                                    className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-white truncate">{student.name}</h4>
                                    <p className="text-sm text-gray-400 truncate">{student.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 justify-end flex-shrink-0 ml-auto sm:ml-0">
                                {/* Status Badge */}
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${student.isVerified
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-yellow-500/20 text-yellow-400'
                                        }`}
                                >
                                    {student.isVerified ? '✓ Verified' : '⏳ Pending'}
                                </span>

                                {/* Toggle Button */}
                                <button
                                    onClick={() => handleToggleStatus(student._id, student.isVerified)}
                                    className={`p-2 rounded-lg transition-colors flex-shrink-0 ${student.isVerified
                                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                        }`}
                                    title={student.isVerified ? 'Unverify' : 'Verify'}
                                >
                                    {student.isVerified ? '↩' : '✓'}
                                </button>

                                {/* Delete Button */}
                                <button
                                    onClick={() => handleDeleteStudent(student._id, student.name)}
                                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex-shrink-0"
                                    title="Remove Student"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentManagement;
