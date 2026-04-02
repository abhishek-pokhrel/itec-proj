import React, { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'

export default function SearchFilter({ onSearch, onFilter, projects, labels }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    labelId: '',
    startDate: '',
    endDate: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (term) => {
    setSearchTerm(term)
    onSearch({ ...filters, search: term })
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilters({
      status: '',
      priority: '',
      labelId: '',
      startDate: '',
      endDate: '',
    })
    onSearch({})
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <Input
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search tasks by title or description..."
          className="pl-10"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-semibold text-slate-700 transition"
        >
          <Filter className="h-4 w-4" />
          Filters {Object.values(filters).filter(v => v).length > 0 && `(${Object.values(filters).filter(v => v).length})`}
        </button>
        {Object.values(filters).filter(v => v).length > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-xl border border-slate-300 p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Status</label>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Priority</label>
              <Select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </div>

            {labels && labels.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Label</label>
                <Select
                  value={filters.labelId}
                  onChange={(e) => handleFilterChange('labelId', e.target.value)}
                >
                  <option value="">All Labels</option>
                  {labels.map(label => (
                    <option key={label._id} value={label._id}>{label.name}</option>
                  ))}
                </Select>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
