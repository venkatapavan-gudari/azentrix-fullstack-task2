import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import boardService from '../services/boardService';
import taskService from '../services/taskService';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Plus, Edit2, Trash2, Calendar, User, ArrowLeft, X, AlertCircle, Save, CheckCircle } from 'lucide-react';

const BoardDetails = () => {
  const { id: boardId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useContext(AuthContext);
  const { stompClient, isConnected } = useContext(SocketContext);

  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Drag and Drop States
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  // Task Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' or 'EDIT'
  const [editingTaskId, setEditingTaskId] = useState(null);
  
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskStatus, setTaskStatus] = useState('TODO');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  
  const [modalError, setModalError] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Fetch Board, Tasks, and Members
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const boardData = await boardService.getBoardById(boardId);
      setBoard(boardData);

      const tasksData = await taskService.getTasks(boardId);
      setTasks(tasksData);

      const membersData = await boardService.getBoardMembers(boardId);
      setMembers(membersData);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load board details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [boardId]);

  // WebSocket Subscription for Real-time Updates
  useEffect(() => {
    if (!stompClient || !isConnected) {
      console.log("WebSocket client not ready yet for subscriptions.");
      return;
    }

    const topic = `/topic/board/${boardId}`;
    console.log(`Subscribing to WebSocket topic: ${topic}`);

    const subscription = stompClient.subscribe(topic, (message) => {
      const event = JSON.parse(message.body);
      console.log('Received WebSocket event:', event);
      handleWebSocketEvent(event);
    });

    return () => {
      console.log(`Unsubscribing from WebSocket topic: ${topic}`);
      subscription.unsubscribe();
    };
  }, [boardId, stompClient, isConnected]);

  // Handle WebSocket Broadcast Events
  const handleWebSocketEvent = (event) => {
    const { action, data } = event;

    switch (action) {
      case 'TASK_CREATED':
        setTasks((prev) => {
          // Avoid duplicate updates if already added locally
          if (prev.some((t) => t.id === data.id)) return prev;
          return [...prev, data];
        });
        break;
      case 'TASK_UPDATED':
      case 'TASK_MOVED':
        setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
        break;
      case 'TASK_DELETED':
        setTasks((prev) => prev.filter((t) => t.id !== data.id));
        break;
      default:
        break;
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    if (dragOverCol !== status) {
      setDragOverCol(status);
    }
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskIdStr) return;

    const taskId = parseInt(taskIdStr, 10);
    const taskObj = tasks.find((t) => t.id === taskId);
    
    if (!taskObj) return;

    // Check permissions before moving
    if (!isAdmin()) {
      const isCreator = taskObj.createdBy?.id == user.id;
      const isAssignee = taskObj.assignee?.id == user.id;
      if (!isCreator && !isAssignee) {
        alert("You can only move tasks where you are the creator or assignee.");
        setDragOverCol(null);
        return;
      }
    }

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
    setDragOverCol(null);

    try {
      await taskService.moveTask(taskId, status);
    } catch (err) {
      console.error(err);
      // Revert if API fails
      fetchData();
      alert("Failed to move task. " + (err.response?.data?.message || ""));
    }
  };

  // Modal Handlers
  const openCreateModal = (status = 'TODO') => {
    setModalMode('CREATE');
    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('MEDIUM');
    setTaskStatus(status);
    // Set default due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setTaskDueDate(tomorrow.toISOString().split('T')[0]);
    setTaskAssigneeId('');
    setModalError('');
    setIsTaskModalOpen(true);
  };

  const openEditModal = (task) => {
    // Permission validation: Must be Admin, creator or assignee
    if (!isAdmin()) {
      const isCreator = task.createdBy?.id == user.id;
      const isAssignee = task.assignee?.id == user.id;
      if (!isCreator && !isAssignee) {
        alert("You only have permission to edit tasks you created or are assigned to.");
        return;
      }
    }

    setModalMode('EDIT');
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    setTaskDueDate(task.dueDate);
    setTaskAssigneeId(task.assignee?.id || '');
    setModalError('');
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!taskTitle.trim()) {
      setModalError('Title is required.');
      return;
    }
    if (!taskDueDate) {
      setModalError('Due date is required.');
      return;
    }

    const payload = {
      title: taskTitle,
      description: taskDesc,
      priority: taskPriority,
      status: taskStatus,
      dueDate: taskDueDate,
      boardId: parseInt(boardId, 10),
      assigneeId: taskAssigneeId ? parseInt(taskAssigneeId, 10) : null
    };

    setModalSubmitting(true);
    try {
      if (modalMode === 'CREATE') {
        await taskService.createTask(payload);
      } else {
        await taskService.updateTask(editingTaskId, payload);
      }
      setIsTaskModalOpen(false);
      // Let WebSocket sync handle updating list, but let's refresh just in case
      const tasksData = await taskService.getTasks(boardId);
      setTasks(tasksData);
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId, event) => {
    event.stopPropagation();
    
    const taskObj = tasks.find(t => t.id === taskId);
    if (!taskObj) return;

    if (!isAdmin()) {
      const isCreator = taskObj.createdBy?.id == user.id;
      const isAssignee = taskObj.assignee?.id == user.id;
      if (!isCreator && !isAssignee) {
        alert("You only have permission to delete tasks you created or are assigned to.");
        return;
      }
    }

    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await taskService.deleteTask(taskId);
      // Filter out immediately
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete task: " + (err.response?.data?.message || ""));
    }
  };

  const handleDeleteBoard = async () => {
    if (!window.confirm(`Are you sure you want to delete "${board?.name}"? All associated tasks will be lost.`)) {
      return;
    }

    try {
      await boardService.deleteBoard(boardId);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert("Failed to delete board: " + (err.response?.data?.message || ""));
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{ color: 'var(--primary)' }}>Loading Board...</div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="page-container">
        <button className="btn-secondary" onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Boards</span>
        </button>
        <div className="alert alert-danger" style={{ maxWidth: '600px' }}>
          <AlertCircle size={18} />
          <span>{error || 'Board not found.'}</span>
        </div>
      </div>
    );
  }

  // Filter tasks for columns
  const getColumnTasks = (status) => tasks.filter((t) => t.status === status);

  return (
    <div className="page-container">
      {/* Board Header */}
      <div className="page-header" style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <div style={{ flex: 1 }}>
          <button className="btn-secondary" onClick={() => navigate('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <ArrowLeft size={14} />
            <span>All Boards</span>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 className="page-title" style={{ fontFamily: 'Outfit, sans-serif' }}>{board.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: isConnected ? '#10b981' : '#f59e0b', padding: '0.2rem 0.5rem', borderRadius: '20px', border: isConnected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isConnected ? '#10b981' : '#f59e0b', display: 'inline-block' }}></span>
              <span>{isConnected ? 'Real-Time Sync active' : 'Offline'}</span>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>{board.description}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-create" onClick={() => openCreateModal('TODO')}>
            <Plus size={18} />
            <span>Add Task</span>
          </button>

          {isAdmin() && (
            <button className="btn-logout" onClick={handleDeleteBoard} style={{ padding: '0.6rem 1rem' }}>
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board columns */}
      <div className="kanban-container">
        {/* Column 1: TODO */}
        <div
          className="kanban-column"
          onDragOver={(e) => handleDragOver(e, 'TODO')}
          onDrop={(e) => handleDrop(e, 'TODO')}
        >
          <div className="column-header" style={{ '--border-color': 'var(--color-todo)' }}>
            <div className="column-title">
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-todo)' }}></span>
              <span>To Do</span>
              <span className="task-count-badge">{getColumnTasks('TODO').length}</span>
            </div>
          </div>

          <div className={`task-list ${dragOverCol === 'TODO' ? 'drag-over' : ''}`}>
            {getColumnTasks('TODO').map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                currentUserId={user.id}
                isAdmin={isAdmin()}
              />
            ))}
          </div>
        </div>

        {/* Column 2: IN PROGRESS */}
        <div
          className="kanban-column"
          onDragOver={(e) => handleDragOver(e, 'IN_PROGRESS')}
          onDrop={(e) => handleDrop(e, 'IN_PROGRESS')}
        >
          <div className="column-header" style={{ '--border-color': 'var(--color-progress)' }}>
            <div className="column-title">
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-progress)' }}></span>
              <span>In Progress</span>
              <span className="task-count-badge">{getColumnTasks('IN_PROGRESS').length}</span>
            </div>
          </div>

          <div className={`task-list ${dragOverCol === 'IN_PROGRESS' ? 'drag-over' : ''}`}>
            {getColumnTasks('IN_PROGRESS').map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                currentUserId={user.id}
                isAdmin={isAdmin()}
              />
            ))}
          </div>
        </div>

        {/* Column 3: DONE */}
        <div
          className="kanban-column"
          onDragOver={(e) => handleDragOver(e, 'DONE')}
          onDrop={(e) => handleDrop(e, 'DONE')}
        >
          <div className="column-header" style={{ '--border-color': 'var(--color-done)' }}>
            <div className="column-title">
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-done)' }}></span>
              <span>Done</span>
              <span className="task-count-badge">{getColumnTasks('DONE').length}</span>
            </div>
          </div>

          <div className={`task-list ${dragOverCol === 'DONE' ? 'drag-over' : ''}`}>
            {getColumnTasks('DONE').map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                currentUserId={user.id}
                isAdmin={isAdmin()}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Task Modal (Create & Edit) */}
      {isTaskModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTaskModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'CREATE' ? 'Add Task' : 'Edit Task'}
              </h2>
              <button className="btn-icon" onClick={() => setIsTaskModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="alert alert-danger">
                <AlertCircle size={18} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleTaskSubmit}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="What needs to be done?"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Add details about this task..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-group">
                <div>
                  <label className="form-label">Priority</label>
                  <select
                    className="form-input"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-group mb-4">
                <div>
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Assignee</label>
                  <select
                    className="form-input"
                    value={taskAssigneeId}
                    onChange={(e) => setTaskAssigneeId(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                    {members.length === 0 && (
                      <option value={board.createdBy?.id}>
                        {board.createdBy?.name} (Owner)
                      </option>
                    )}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsTaskModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={modalSubmitting}>
                  <Save size={18} />
                  <span>{modalSubmitting ? 'Saving...' : 'Save Task'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// TaskCard subcomponent
const TaskCard = ({ task, onEdit, onDelete, onDragStart, onDragEnd, currentUserId, isAdmin }) => {
  
  // Verify permissions for editing/deleting tasks in line
  const hasAccess = isAdmin || task.createdBy?.id == currentUserId || task.assignee?.id == currentUserId;

  console.log("Permission check for task:", task.title, {
    isAdmin,
    createdBy: task.createdBy?.id,
    assignee: task.assignee?.id,
    currentUserId,
    hasAccess
  });

  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
    >
      <div className="task-card-header">
        <span className={`task-priority-badge priority-${task.priority}`}>
          {task.priority.toLowerCase()}
        </span>
        
        {hasAccess && (
          <div className="task-actions" onClick={(e) => e.stopPropagation()}>
            <button className="btn-icon" onClick={() => onEdit(task)}>
              <Edit2 size={12} />
            </button>
            <button className="btn-icon delete" onClick={(e) => onDelete(task.id, e)}>
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      <h4 className="task-title">{task.title}</h4>
      <p className="task-desc">{task.description || 'No description.'}</p>

      <div className="task-card-footer">
        <div className="task-assignee">
          <User size={12} />
          <span style={{ fontSize: '0.75rem' }}>
            {task.assignee ? task.assignee.name : 'Unassigned'}
          </span>
        </div>
        
        <div className="task-date">
          <Calendar size={12} />
          <span style={{ fontSize: '0.75rem' }}>{task.dueDate}</span>
        </div>
      </div>
    </div>
  );
};

export default BoardDetails;
