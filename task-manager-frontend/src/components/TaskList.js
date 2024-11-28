import { useState } from 'react';
import { createTask, deleteTask, updateTask } from '../api';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    TablePagination,
    Select,
    Button,
    MenuItem,
    FormControl,
    InputLabel,
    Typography,
    Container,
    Paper,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@mui/material';

const AddTaskDialog = ({ fetchTasks, task, operation, open, handleClose, handleAddTask }) => {
    const [taskData, setTaskData] = useState({
        title: '',
        startTime: '',
        endTime: '',
        priority: '',
        status: 'pending',
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setTaskData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        handleAddTask(taskData); // Pass task data to parent
        setTaskData({
            startTime: '',
            endTime: '',
            priority: '',
            status: 'pending',
        });
        handleClose(); // Close the dialog after adding the task
        try {
            if (operation === 'add') {
                console.log(taskData);
                await createTask({ title: taskData.title, startTime: taskData.startTime, endTime: taskData.endTime, priority: taskData.priority, status: taskData.status });
                fetchTasks();
            } else if ('edit') {
                await updateTask(task._id, { title: taskData.title, startTime: taskData.startTime, endTime: taskData.endTime, priority: taskData.priority, status: taskData.status });
                fetchTasks();
            }
        } catch (err) {
            console.error(err.response.data.message);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Add Task</DialogTitle>
            <DialogContent>
                <TextField
                    label="Title"
                    fullWidth
                    margin="normal"
                    name="title"
                    value={taskData.title}
                    onChange={handleChange}
                />
                <TextField
                    label="Start Time"
                    type="datetime-local"
                    fullWidth
                    margin="normal"
                    name="startTime"
                    onChange={handleChange}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField
                    label="End Time"
                    type="datetime-local"
                    fullWidth
                    margin="normal"
                    name="endTime"
                    onChange={handleChange}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Priority</InputLabel>
                    <Select
                        name="priority"
                        value={taskData.priority}
                        onChange={handleChange}
                        label="Priority"
                    >
                        {[1, 2, 3, 4, 5].map((priority) => (
                            <MenuItem key={priority} value={priority}>
                                {priority}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                        name="status"
                        value={taskData.status}
                        onChange={handleChange}
                        label="Status"
                    >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="finished">Finished</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                {operation === 'add' && <Button onClick={handleSubmit} color="primary">
                    Add Task
                </Button>}
                {operation === 'edit' && <Button onClick={handleSubmit} color="primary">
                    Edit Task
                </Button>}
            </DialogActions>
        </Dialog>
    );
}

const TaskList = ({ tasks, setTasks, stats, fetchTasks }) => {
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('startTime');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [priorityFilter, setPriorityFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [operation, setOperation] = useState(null)
    const [task, setTask] = useState(null)

    const [openDialog, setOpenDialog] = useState(false);

    const handleAddTask = (task) => {
        const newTask = { ...task, id: tasks.length + 1 }; // Mock task ID (In real scenario, ID would be generated by DB)
        setTasks((prevTasks) => [...prevTasks, newTask]);
    };

    const handleOpenDialog = (flag, task) => {
        setOpenDialog(true);
        setOperation(flag)
        if (flag === 'edit') {
            setTask(task)
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const descendingComparator = (a, b, orderBy) => {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }

    const getComparator = (order, orderBy) => {
        return order === 'desc'
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    }

    const stableSort = (array, comparator) => {
        const stabilizedThis = array.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    }

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handlePriorityFilterChange = (event) => {
        setPriorityFilter(event.target.value);
    };

    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
    };

    const filteredTasks = tasks
        .filter((task) => {
            return (
                (priorityFilter ? task.priority === priorityFilter : true) &&
                (statusFilter ? task.status === statusFilter : true)
            );
        })
        .sort(getComparator(order, orderBy));

    const handleDelete = async (id) => {
        try {
            await deleteTask(id);
            fetchTasks();
        } catch (err) {
            console.error(err.response.data.message);
        }
    };

    const calculateTimeDifference = (startTime, endTime) => {
        const diff = new Date(endTime) - new Date(startTime);
        return Math.max(0, Math.round(diff / (1000 * 60 * 60))); // Convert ms to hours and ensure non-negative
    };

    return (
        <div>
            <Container>
                <Typography style={{ marginTop: '25px', fontWeight: 'bold' }} variant="h5" component="h1" gutterBottom>
                    Task List
                </Typography>

                <Button onClick={() => handleOpenDialog('add', null)} style={{ marginTop: '10px' }} variant="contained" color="primary">
                    Add Task
                </Button>
                <AddTaskDialog fetchTasks={fetchTasks} task={task} operation={operation} open={openDialog} handleClose={handleCloseDialog} handleAddTask={handleAddTask} />

                <Paper sx={{ marginTop: 3 }}>
                    <Box display="flex" justifyContent="space-between" p={2}>
                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={priorityFilter}
                                onChange={handlePriorityFilterChange}
                                label="Priority"
                            >
                                <MenuItem value="">All</MenuItem>
                                {[1, 2, 3, 4, 5].map((priority) => (
                                    <MenuItem key={priority} value={priority}>
                                        {priority}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                onChange={handleStatusFilterChange}
                                label="Status"
                            >
                                <MenuItem value="">All</MenuItem>
                                {['pending', 'finished'].map((status) => (
                                    <MenuItem key={status} value={status}>
                                        {status}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <TableContainer>
                        <Table aria-labelledby="tableTitle">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Task ID</TableCell>
                                    <TableCell>Title</TableCell>
                                    <TableCell
                                        sortDirection={orderBy === 'startTime' ? order : false}
                                    >
                                        <TableSortLabel
                                            active={orderBy === 'startTime'}
                                            direction={orderBy === 'startTime' ? order : 'asc'}
                                            onClick={(event) => handleRequestSort(event, 'startTime')}
                                        >
                                            Start Time
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell
                                        sortDirection={orderBy === 'endTime' ? order : false}
                                    >
                                        <TableSortLabel
                                            active={orderBy === 'endTime'}
                                            direction={orderBy === 'endTime' ? order : 'asc'}
                                            onClick={(event) => handleRequestSort(event, 'endTime')}
                                        >
                                            End Time
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Priority</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Total Time to Finish (hrs)</TableCell>
                                    <TableCell>Edit</TableCell>
                                    <TableCell>Delete</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {stableSort(filteredTasks, getComparator(order, orderBy))
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((task) => (
                                        <TableRow hover tabIndex={-1} key={task.id}>
                                            <TableCell>{task.userId}</TableCell>
                                            <TableCell>{task.title}</TableCell>
                                            <TableCell>{new Date(task.startTime).toLocaleDateString() + " " + new Date(task.startTime).toLocaleTimeString()}</TableCell>
                                            <TableCell>{new Date(task.endTime).toLocaleDateString() + " " + new Date(task.endTime).toLocaleTimeString()}</TableCell>
                                            <TableCell>{task.priority}</TableCell>
                                            <TableCell>{task.status}</TableCell>
                                            <TableCell>{calculateTimeDifference(new Date(), task.endTime)}</TableCell>
                                            <TableCell>
                                                <Button onClick={() => handleOpenDialog('edit', task)} variant="contained" color="primary">
                                                    Edit
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <Button onClick={() => handleDelete(task._id)} variant="contained" color="secondary">
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredTasks.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </Container>
        </div>
    );
};

export default TaskList;
