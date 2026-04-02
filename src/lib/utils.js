// Format bytes to human readable size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Format date relative to now
export const formatRelativeDate = (date) => {
  const now = new Date();
  const pastDate = new Date(date);
  const diffMinutes = Math.floor((now - pastDate) / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
  if (diffMinutes < 10080) return `${Math.floor(diffMinutes / 1440)}d ago`;
  
  return pastDate.toLocaleDateString();
};

// Format date as readable string
export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format time duration
export const formatDuration = (minutes) => {
  if (!minutes) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

// Get initials from name
export const getInitials = (name) => {
  return name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
};

// Get priority color
export const getPriorityColor = (priority) => {
  const colors = {
    low: 'bg-cyan-100 text-cyan-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-rose-100 text-rose-700',
  };
  return colors[priority] || colors.medium;
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    'todo': 'bg-slate-100 text-slate-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    'done': 'bg-green-100 text-green-700',
  };
  return colors[status] || colors.todo;
};

// Format status text
export const formatStatus = (status) => {
  const formats = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'done': 'Done',
  };
  return formats[status] || status;
};

// Debounce function
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Check if date is overdue
export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  return due < new Date() && due.toDateString() !== new Date().toDateString();
};

// Check if date is today
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return checkDate.toDateString() === today.toDateString();
};

// Check if date is this week
export const isThisWeek = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
  const lastDay = new Date(today.setDate(today.getDate() + 6));
  return checkDate >= firstDay && checkDate <= lastDay;
};
