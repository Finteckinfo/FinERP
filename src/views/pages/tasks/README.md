# Task Calendar

A comprehensive task calendar system with multiple view modes and task management capabilities.

## Structure

```
src/views/pages/tasks/
├── taskCalender.vue          # Main calendar page
├── components/
│   ├── index.ts              # Component exports
│   ├── dummyData.ts          # Dummy data and types
│   ├── CalendarHeader.vue    # Header with navigation and filters
│   ├── CalendarView.vue      # Main calendar display (month/week/day)
│   ├── TaskList.vue          # Sidebar task list
│   ├── TaskCard.vue          # Individual task display
│   └── TaskModal.vue         # Task creation/editing modal
└── README.md                 # This file
```

## Features

### Calendar Views
- **Month View**: Grid layout showing all days of the month with task previews
- **Week View**: Detailed weekly view with time slots
- **Day View**: Single day view with hourly time slots

### Task Management
- Create, edit, and delete tasks
- Task filtering by status and priority
- Project and department assignment
- Time tracking (estimated vs actual hours)
- Due date management

### Task Organization
- Grouped by time periods (Today, Overdue, This Week, Next Week, Later)
- Color-coded by priority and status
- Project-based filtering
- Real-time task updates

## Components

### CalendarHeader
- View switching (month/week/day)
- Date navigation
- Project filtering
- New task creation

### CalendarView
- Responsive calendar grid
- Task display and interaction
- Date selection
- Time slot management

### TaskList
- Sidebar task organization
- Filtering and sorting
- Task actions (edit/delete)
- Grouped task display

### TaskCard
- Compact task display
- Priority and status indicators
- Time tracking display
- Click interactions

### TaskModal
- Task creation and editing
- Form validation
- Project/department selection
- Date and time management

## Dummy Data

The system includes comprehensive dummy data for testing:
- 3 sample projects
- 6 departments across projects
- 10 sample tasks with various statuses and priorities
- Realistic date ranges and time tracking

## Usage

1. Navigate to the task calendar page
2. Use the header to switch between views and navigate dates
3. Filter tasks by project using the dropdown
4. Click on tasks to view details
5. Use the "New Task" button to create tasks
6. Edit tasks by clicking the edit button in the task list

## Future API Integration

The structure is designed to easily integrate with the existing project API:
- Replace dummy data with API calls
- Add real-time updates
- Implement user authentication
- Add collaborative features
