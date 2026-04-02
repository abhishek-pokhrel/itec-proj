# 🔧 Troubleshooting & Quick Reference

## Common Issues & Solutions

### Issue: "Cannot find module"
**Solution**: Run `npm install` in both root and `/server` directories
```bash
npm install
cd server && npm install
```

### Issue: MongoDB connection error
**Solution**: 
1. Check `.env` in `/server` has `MONGODB_URI`
2. Verify MongoDB cluster is accessible
3. Check IP whitelist on MongoDB Atlas
4. Restart server: `npm start` in server folder

### Issue: API calls failing (401 Unauthorized)
**Solution**:
1. Clear localStorage
2. Log out and log back in
3. Check if JWT_SECRET is the same on backend
4. Verify token is being sent in Authorization header

### Issue: Tasks not showing in Calendar
**Solution**:
1. Ensure tasks have `dueDate` set
2. Navigate to correct month
3. Check date format is correct

### Issue: Import errors in Dashboard
**Solution**:
Verify all imports are present:
```javascript
import CalendarView from '../components/CalendarView'
import TaskEditModal from '../components/TaskEditModal'
import { TaskService } from '../lib/taskService'
import { ProjectService } from '../lib/projectService'
```

---

## Quick Commands Reference

### Frontend
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend
```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Start server
npm start

# Check if server is running
curl http://localhost:5000/api/projects
# Should return 401 (needs auth token)
```

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks?projectId=X` - Get tasks by project
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

---

## Testing with curl

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Create Project (with token)
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"My Project"}'
```

---

## Environment Variables

### Frontend (.env.local)
```dotenv
VITE_API_URL=http://localhost:5000/api
```

### Backend (server/.env)
```dotenv
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

---

## File Structure Quick Reference

```
Frontend Entry Points:
- src/main.jsx - App initialization
- src/App.jsx - Router setup
- src/pages/Dashboard.jsx - Main dashboard
- src/components/CalendarView.jsx - Calendar
- src/components/TaskEditModal.jsx - Task editor

Backend Entry Points:
- server/server.js - Server initialization
- server/routes/tasks.js - Task endpoints
- server/routes/projects.js - Project endpoints
- server/routes/auth.js - Auth endpoints
- server/models/Task.js - Task schema
```

---

## Performance Tips

1. **Cache tasks** - Minimize API calls
2. **Lazy load** - Load calendar only when viewed
3. **Debounce search** - If adding search feature
4. **Pagination** - For large task lists
5. **Database indexes** - On userId, projectId, status

---

## Security Checklist

- ✅ JWT tokens stored in localStorage (production: httpOnly cookie)
- ✅ Password hashed with bcrypt
- ✅ CORS configured
- ✅ API validates user ownership
- ✅ Environment variables not in code
- ✅ Authorization headers on all protected routes

---

## Deployment Steps

### Frontend (Vercel)
```bash
npm install
npm run build
# Deploy dist/ folder
```

### Backend (Heroku/Railway/Render)
```bash
# Add Procfile
echo "web: node server.js" > Procfile

# Add to package.json
"start": "node server.js"

# Deploy with env variables set
```

---

## Features You Can Add

1. **Search & Filter**
   - Search tasks by title
   - Filter by priority, status
   - Filter by date range

2. **Collaboration**
   - Share projects
   - Assign tasks to users
   - Comments on tasks

3. **Notifications**
   - Due date reminders
   - Task assignment alerts
   - Status change notifications

4. **Analytics**
   - Tasks completed this week
   - Average time to complete
   - Priority distribution

5. **Export**
   - Export tasks to CSV
   - Generate reports
   - Print calendar

---

## Database Optimization

### Add these indexes to MongoDB:
```javascript
// User.js
db.users.createIndex({ email: 1 }, { unique: true })

// Project.js
db.projects.createIndex({ userId: 1 })

// Task.js
db.tasks.createIndex({ projectId: 1 })
db.tasks.createIndex({ userId: 1 })
db.tasks.createIndex({ status: 1 })
db.tasks.createIndex({ dueDate: 1 })
```

---

## Debug Mode

### Enable verbose logging:
```javascript
// In server.js
if (process.env.DEBUG === 'true') {
  console.log('Request:', req.method, req.path)
  console.log('User:', req.user)
}
```

### Check React DevTools:
- Install React Developer Tools browser extension
- View component props and state
- Check context values

---

## Support & Resources

- **React Docs**: https://react.dev
- **MongoDB Docs**: https://docs.mongodb.com
- **Express Docs**: https://expressjs.com
- **Tailwind Docs**: https://tailwindcss.com
- **Lucide Icons**: https://lucide.dev

---

**Happy coding! 🚀**
