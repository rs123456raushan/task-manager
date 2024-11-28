import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import { getTasks, getStatistics } from './api';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import TaskList from './components//TaskList';

function App() {

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);

  const fetchTasks = async () => {
    try {
      const { data } = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err.response.data.message);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await getStatistics();
      setStats(data);
    } catch (err) {
      console.error(err.response.data.message);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <>
                <TaskList tasks={tasks} setTasks={setTasks} stats={stats} fetchTasks={fetchTasks} />
              </>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
