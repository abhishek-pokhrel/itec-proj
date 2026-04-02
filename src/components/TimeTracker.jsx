import React, { useState, useEffect } from 'react';
import { Clock, Trash2, Plus } from 'lucide-react';
import TimeLogService from '../lib/timeLogService';
import { useAuth } from '../state/authContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

const TimeTracker = ({ taskId }) => {
  const { user } = useAuth();
  const [timeLogs, setTimeLogs] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchTimeLogs();
  }, [taskId]);

  const fetchTimeLogs = async () => {
    try {
      setLoading(true);
      const data = await TimeLogService.getForTask(taskId);
      setTimeLogs(data.logs);
      setTotalHours(parseFloat(data.totalHours));
    } catch (error) {
      console.error('Error fetching time logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTimeLog = async (e) => {
    e.preventDefault();
    if (!duration || isNaN(duration)) {
      alert('Please enter a valid duration in minutes');
      return;
    }

    try {
      const timeLog = await TimeLogService.log(taskId, duration, note, date);
      setTimeLogs([timeLog, ...timeLogs]);
      setTotalHours(totalHours + parseInt(duration) / 60);
      setDuration('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error logging time:', error);
    }
  };

  const handleDeleteTimeLog = async (id) => {
    try {
      const log = timeLogs.find((l) => l._id === id);
      await TimeLogService.delete(id);
      setTimeLogs(timeLogs.filter((l) => l._id !== id));
      setTotalHours(totalHours - log.duration / 60);
    } catch (error) {
      console.error('Error deleting time log:', error);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock size={18} className="text-slate-600" />
        <h3 className="font-semibold text-gray-900">Time Tracking</h3>
        <span className="ml-auto text-sm font-semibold text-blue-900 bg-blue-50 px-2 py-1 rounded">
          {totalHours.toFixed(1)} hours
        </span>
      </div>

      {/* Log Time Form */}
      <form onSubmit={handleAddTimeLog} className="space-y-3 bg-slate-50 p-3 rounded-lg">
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Duration (minutes)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
          />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <Input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button type="submit" className="w-full text-sm">
          <Plus size={14} className="mr-1" /> Log Time
        </Button>
      </form>

      {/* Time Logs List */}
      {loading ? (
        <div className="text-center py-4 text-slate-500">Loading time logs...</div>
      ) : timeLogs.length === 0 ? (
        <div className="text-center py-4 text-slate-500">No time logged yet</div>
      ) : (
        <div className="space-y-2">
          {timeLogs.map((log) => (
            <Card key={log._id} className="p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {(log.duration / 60).toFixed(1)} hours
                    </span>
                    <span className="text-xs text-slate-500">{formatDate(log.date)}</span>
                  </div>
                  {log.note && (
                    <p className="text-sm text-gray-700 mt-1">{log.note}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">{log.userId.name}</p>
                </div>
                {log.userId._id === user?._id && (
                  <button
                    onClick={() => handleDeleteTimeLog(log._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeTracker;
