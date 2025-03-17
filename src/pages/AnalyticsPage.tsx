
import { useTask } from "@/context/TaskContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import { motion } from "framer-motion";

const AnalyticsPage = () => {
  const { getTasks, categories } = useTask();
  
  // Get tasks for analytics
  const allTasks = getTasks({ deleted: false });
  const activeTasks = allTasks.filter(task => !task.completed);
  const completedTasks = allTasks.filter(task => task.completed);
  
  // Prepare data for progress by category chart
  const categoryData = categories.map(category => {
    const tasksInCategory = allTasks.filter(task => task.category === category);
    const completedInCategory = tasksInCategory.filter(task => task.completed);
    
    return {
      name: category,
      total: tasksInCategory.length,
      completed: completedInCategory.length,
      active: tasksInCategory.length - completedInCategory.length,
      completionRate: tasksInCategory.length > 0 
        ? Math.round((completedInCategory.length / tasksInCategory.length) * 100) 
        : 0
    };
  });
  
  // Prepare data for priority distribution chart
  const priorityData = [
    {
      name: "Low",
      value: allTasks.filter(task => task.priority === "low").length,
      color: "#10b981"
    },
    {
      name: "Medium",
      value: allTasks.filter(task => task.priority === "medium").length,
      color: "#f59e0b"
    },
    {
      name: "High",
      value: allTasks.filter(task => task.priority === "high").length,
      color: "#ef4444"
    }
  ];
  
  // Prepare data for completion over time chart (last 7 days)
  const getDaysArray = () => {
    const daysArray = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      daysArray.push({
        date: date,
        formatted: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: 0
      });
    }
    return daysArray;
  };
  
  const completionTimeData = getDaysArray();
  
  completedTasks.forEach(task => {
    const completedDate = new Date(task.createdAt);
    completionTimeData.forEach(day => {
      if (completedDate.toDateString() === day.date.toDateString()) {
        day.completed += 1;
      }
    });
  });
  
  const formattedCompletionTimeData = completionTimeData.map(day => ({
    name: day.formatted,
    completed: day.completed
  }));
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your productivity and task completion patterns
          </p>
        </motion.div>
        
        {/* Overview Cards */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{allTasks.length}</p>
              <p className="text-muted-foreground">
                {activeTasks.length} active, {completedTasks.length} completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {allTasks.length > 0 
                  ? Math.round((completedTasks.length / allTasks.length) * 100) 
                  : 0}%
              </p>
              <p className="text-muted-foreground">
                {completedTasks.length} of {allTasks.length} tasks completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{categories.length}</p>
              <p className="text-muted-foreground">
                Most tasks in {
                  categoryData.length > 0 
                    ? categoryData.sort((a, b) => b.total - a.total)[0].name 
                    : "None"
                }
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Charts */}
        <motion.div variants={item}>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Tasks by Category</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="active" stackId="a" name="Active" fill="#3b82f6" />
                    <Bar dataKey="completed" stackId="a" name="Completed" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={item}>
            <Card className="overflow-hidden h-full">
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={item}>
            <Card className="overflow-hidden h-full">
              <CardHeader>
                <CardTitle>Tasks Completed (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={formattedCompletionTimeData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default AnalyticsPage;
