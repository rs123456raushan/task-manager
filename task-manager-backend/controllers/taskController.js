const Task = require('../models/Task');

exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id });
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching tasks' });
    }
};

exports.createTask = async (req, res) => {
    const { title, startTime, endTime, priority, status } = req.body;
    try {
        const task = new Task({ userId: req.user.id, title, startTime, endTime, priority, status });
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ message: 'Error creating task' });
    }
};

exports.updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, startTime, endTime, priority, status } = req.body;

    try {
        const task = await Task.findOne({ _id: id, userId: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Update fields only if provided
        if (title) task.title = title;
        if (startTime) task.startTime = startTime;
        if (endTime) task.endTime = endTime;
        if (priority) task.priority = priority;
        if (status) task.status = status;

        if (status === 'finished') {
            task.endTime = new Date(); // Set end time to now
        }

        await task.save();
        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({ message: 'Error updating task' });
    }
};

exports.deleteTask = async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findOneAndDelete({ _id: id, userId: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting task' });
    }
};

const calculateTimeDifference = (startTime, endTime) => {
    const diff = new Date(endTime) - new Date(startTime);
    return Math.max(0, Math.round(diff / (1000 * 60 * 60))); // Convert ms to hours and ensure non-negative
};

exports.getStatistics = async (req, res) => {
    try {
        // Replace with the actual userId from authenticated user
        const userId = req.user.id;

        // Fetch tasks for the user and update the status to completed if time difference is less than or equal to zero
        const tasks = await Task.find({ userId });

        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found for the user.' });
        }

        // Fetch all pending tasks
        const pending_tasks = await Task.find({ status: "pending" });

        // Iterate over the pending tasks and check the condition
        const tasksToUpdate = pending_tasks.filter((task) => {
            const endTime = new Date(task.endTime);
            const currentTime = new Date();
            const timeDifference = endTime - currentTime;

            // If the time difference is less than or equal to 0, it should be marked as completed
            return timeDifference <= 0;
        });

        // Update tasks that meet the condition
        for (const task of tasksToUpdate) {
            await Task.updateOne({ _id: task._id }, { status: "completed" });
        }

        // Summary Calculations
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((task) => task.status === 'completed').length;
        const pendingTasks = tasks.filter((task) => task.status === 'pending');
        const completedPercentage = Math.round((completedTasks / totalTasks) * 100);
        const pendingPercentage = 100 - completedPercentage;

        const completedTaskTimes = tasks
            .filter((task) => task.status === 'completed')
            .map((task) => calculateTimeDifference(task.startTime, task.endTime));
        const avgCompletionTime =
            completedTaskTimes.length > 0
                ? (completedTaskTimes.reduce((a, b) => a + b, 0) / completedTaskTimes.length).toFixed(1)
                : 0;

        // Pending Task Summary
        const totalTimeLapsed = pendingTasks.reduce((total, task) => {
            const lapsed = calculateTimeDifference(task.startTime, new Date());
            return total + lapsed;
        }, 0);

        const totalTimeToFinish = pendingTasks.reduce((total, task) => {
            const timeRemaining = calculateTimeDifference(new Date(), task.endTime);
            return total + timeRemaining;
        }, 0);

        // Task Summary Table (Grouped by Priority)
        const taskSummaryByPriority = [];
        for (let i = 1; i <= 5; i++) {
            const priorityTasks = pendingTasks.filter((task) => task.priority === i);
            const lapsed = priorityTasks.reduce((sum, task) => sum + calculateTimeDifference(task.startTime, new Date()), 0);
            const toFinish = priorityTasks.reduce((sum, task) => sum + calculateTimeDifference(new Date(), task.endTime), 0);

            taskSummaryByPriority.push({
                priority: i,
                pending: priorityTasks.length,
                lapsed,
                toFinish,
            });
        }

        // Response
        res.json({
            summary: {
                totalTasks,
                completedPercentage,
                pendingPercentage,
                avgCompletionTime,
                pendingTasks: pendingTasks.length,
                totalTimeLapsed,
                totalTimeToFinish,
            },
            table: taskSummaryByPriority,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

