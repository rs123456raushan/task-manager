import { useState } from 'react';
import { createTask } from '../api';

const TaskForm = ({ fetchTasks }) => {
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [priority, setPriority] = useState(1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createTask({ title, startTime, endTime, priority, status: 'pending' });
            fetchTasks();
        } catch (err) {
            console.error(err.response.data.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
            />
            <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
            />
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                {[1, 2, 3, 4, 5].map((p) => (
                    <option key={p} value={p}>
                        Priority {p}
                    </option>
                ))}
            </select>
            <button type="submit">Add Task</button>
        </form>
    );
};

export default TaskForm;
