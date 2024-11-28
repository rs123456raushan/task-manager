import { useEffect, useState } from 'react';
import { getStatistics } from '../api';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Grid,
    TablePagination,
    Typography,
    Container,
    Paper
} from '@mui/material';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const fetchStats = async () => {
        try {
            const { data } = await getStatistics();
            setStats(data);
        } catch (err) {
            console.error(err.response.data.message);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div>
            <Container>
                <Typography style={{ marginTop: '25px', fontWeight: 'bold' }} variant="h5" component="h1" gutterBottom>
                    Dashboard
                </Typography>

                <Grid container spacing={3} sx={{ marginBottom: '2rem' }}>
                    <Grid item xs={6} sm={3}>
                        <Paper elevation={2} sx={{ padding: '1rem', textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight="bold" color="primary">
                                {stats?.summary?.totalTasks ? stats?.summary?.totalTasks : 0}
                            </Typography>
                            <Typography variant="subtitle1">Total tasks</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Paper elevation={2} sx={{ padding: '1rem', textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight="bold" color="primary">
                                {stats?.summary?.completedPercentage ? stats?.summary?.completedPercentage : 0}%
                            </Typography>
                            <Typography variant="subtitle1">Tasks completed</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Paper elevation={2} sx={{ padding: '1rem', textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight="bold" color="primary">
                                {stats?.summary?.pendingPercentage ? stats?.summary?.pendingPercentage : 0}%
                            </Typography>
                            <Typography variant="subtitle1">Tasks pending</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Paper elevation={2} sx={{ padding: '1rem', textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight="bold" color="primary">
                                {stats?.summary?.avgCompletionTime ? stats?.summary?.avgCompletionTime : 0} hrs
                            </Typography>
                            <Typography variant="subtitle1">Average time per completed task</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Pending Task Summary */}
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Pending task summary
                </Typography>

                <Grid container spacing={3} sx={{ marginBottom: '2rem' }}>
                    <Grid item xs={4}>
                        <Paper elevation={2} sx={{ padding: '1rem', textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight="bold" color="primary">
                                {stats?.summary?.pendingTasks ? stats?.summary?.pendingTasks : 0}
                            </Typography>
                            <Typography variant="subtitle1">Pending tasks</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={4}>
                        <Paper elevation={2} sx={{ padding: '1rem', textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight="bold" color="primary">
                                {stats?.summary?.totalTimeLapsed ? stats?.summary?.totalTimeLapsed.toFixed(2) : 0} hrs
                            </Typography>
                            <Typography variant="subtitle1">Total time lapsed</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={4}>
                        <Paper elevation={2} sx={{ padding: '1rem', textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight="bold" color="primary">
                                {stats?.summary?.totalTimeToFinish ? stats?.summary?.totalTimeToFinish.toFixed(2) : 0} hrs
                            </Typography>
                            <Typography variant="subtitle1">
                                Total Time to Finish <br /> <i>estimated based on endtime</i>
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Paper sx={{ marginTop: 3 }}>
                    <TableContainer>
                        <Table aria-labelledby="tableTitle">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Task Priority</TableCell>
                                    <TableCell>Pending Tasks</TableCell>
                                    <TableCell>Time Lapsed (hrs)</TableCell>
                                    <TableCell>Time to Finish (hrs)</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {stats?.table?.map((stat) => {
                                    return <TableRow hover tabIndex={-1} key={stat?._id}>
                                        <TableCell>{stat?.priority ? stat.priority : 0}</TableCell>
                                        <TableCell>{stat?.pending ? stat.pending : 0}</TableCell>
                                        <TableCell>{stat?.lapsed ? stat.lapsed : 0}</TableCell>
                                        <TableCell>{stat?.toFinish ? stat.toFinish : 0}</TableCell>
                                    </TableRow>
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={5}
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

export default Dashboard;
