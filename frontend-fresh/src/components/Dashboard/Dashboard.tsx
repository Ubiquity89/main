import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  CardContent,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { api } from '../../config/api';
import { Pie } from 'react-chartjs-2';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import Footer from '../Footer/Footer';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Badge {
  title: string;
  stars: number;
}

interface Certificate {
  name: string;
  url: string;
  verified: boolean;
}

interface PlatformStats {
  total_solved?: number;
  school_solved?: number;
  basic_solved?: number;
  easy_solved?: number;
  medium_solved?: number;
  hard_solved?: number;
  ranking?: number;
  coding_score?: number;
  profile_url: string;
  badges?: Badge[];
  certificates?: Certificate[];
  stars?: number;
  skills?: number;
  rating?: number;
  rank?: number;
  max_rating?: number;
  max_rank?: string;
  contest_count?: number;
}

interface PlatformData {
  name: string;
  username: string;
  stats?: PlatformStats;
  error?: string;
  loading: boolean;
}

function Dashboard() {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("leetcode");
  const [platforms, setPlatforms] = useState<PlatformData[]>([]);
  const [error, setError] = useState<string>("");
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const savedData = localStorage.getItem('codingProfile');
    if (savedData) {
      const data = JSON.parse(savedData);
      setPlatforms([
        { name: "leetcode", username: data.leetcode, loading: true },
        { name: "gfg", username: data.gfg, loading: true },
        { name: "hackerrank", username: data.hackerrank, loading: true },
        { name: "codeforces", username: data.codeforces, loading: true },
        { name: "codechef", username: data.codechef, loading: false },
      ]);
    }
  }, []);

  useEffect(() => {
    const fetchPlatformStats = async (platform: PlatformData) => {
      if (!platform.username) {
        setPlatforms(prev => 
          prev.map(p => 
            p.name === platform.name 
              ? { ...p, error: "Please enter a username for this platform", loading: false } 
              : p
          )
        );
        return;
      }

      try {
        let response;
        switch (platform.name) {
          case 'leetcode':
            response = await api.leetcode.getStats(platform.username);
            break;
          case 'gfg':
            response = await api.gfg.getStats(platform.username);
            break;
          case 'hackerrank':
            response = await api.hackerrank.getStats(platform.username);
            break;
          case 'codechef':
            response = await api.codechef.getStats(platform.username);
            break;
          case 'codeforces':
            response = await api.codeforces.getStats(platform.username);
            break;
          default:
            throw new Error(`Unsupported platform: ${platform.name}`);
        }

        if (response && response.data) {
          setPlatforms(prev => 
            prev.map(p => 
              p.name === platform.name 
                ? { ...p, stats: response.data, loading: false } 
                : p
            )
          );
        } else {
          setPlatforms(prev => 
            prev.map(p => 
              p.name === platform.name 
                ? { ...p, error: "Failed to fetch data", loading: false } 
                : p
            )
          );
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || 
          (err.message.includes('404') ? 'User not found on this platform' : 'Failed to fetch data');
        setPlatforms(prev => 
          prev.map(p => 
            p.name === platform.name 
              ? { ...p, error: errorMessage, loading: false } 
              : p
          )
        );
      }
    };

    const selectedPlatformData = platforms.find(p => p.name === selectedPlatform);
    if (selectedPlatformData && !selectedPlatformData.stats && !selectedPlatformData.error) {
      fetchPlatformStats(selectedPlatformData);
    }
  }, [selectedPlatform, platforms]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedPlatform(newValue);
  };

  const getPlatformStats = (platform: PlatformData) => {
    if (!platform.stats) return null;

    const { total_solved, easy_solved, medium_solved, hard_solved, profile_url, school_solved, basic_solved } = platform.stats;

    // Create pie chart data for LeetCode and GFG
    let pieChart = null;
    if (platform.name === "leetcode" || platform.name === "gfg") {
      const data = {
        labels: platform.name === "leetcode" ? ['Easy', 'Medium', 'Hard'] : ['School', 'Basic', 'Easy', 'Medium', 'Hard'],
        datasets: [
          {
            data: platform.name === "leetcode" ? [easy_solved, medium_solved, hard_solved] : [school_solved, basic_solved, easy_solved, medium_solved, hard_solved],
            backgroundColor: [
              platform.name === "leetcode" ? '#4CAF50' : '#90EE90', // School - Light green
              platform.name === "leetcode" ? '#FFA500' : '#FFA500', // Basic - Yellow ochre
              platform.name === "leetcode" ? '#4BC0C0' : '#FF6384', // Easy - Red
              '#36A2EB', // Medium - Purple
              platform.name === "leetcode" ? '#FF6384' : '#4CAF50' // Hard - Green
            ],
            borderColor: '#FFFFFF',
            borderWidth: 2
          }
        ]
      };

      const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom' as const,
            labels: {
              padding: 10
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.raw !== undefined) {
                  label += context.raw;
                }
                return label;
              }
            }
          }
        },
        layout: {
          padding: {
            bottom: 20
          }
        }
      };

      pieChart = (
        <Box sx={{ mt: 2 }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '90%',
            maxWidth: '500px',
            height: '90%',
            margin: 'auto', 
            textAlign: 'center' 
          }}>
            <Typography variant="h6" gutterBottom>
              Difficulty Distribution
            </Typography>
            <Pie data={data} options={options} />
            <div style={{ marginTop: '10px', display: 'flex', gap: '15px' }}>
             
            <Button 
              variant="contained" 
              color="primary" 
              href={platform.stats.profile_url} 
              target="_blank" 
              sx={{
                marginTop: '15px',
                padding: '10px 20px',
                borderRadius: '5px'
              }}
              >
              View Profile on {platform.name}
            </Button>
          </div>
              </div>
        </Box>
      );
    }

    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" gutterBottom>Statistics</Typography>
              <Typography variant="h3" color="#FFD740" gutterBottom>
                {platform.name === "hackerrank" ? platform.stats.badges?.length :
                 platform.name === "gfg" ? platform.stats.total_solved :
                 platform.name === "codechef" ? platform.stats.rating :
                 platform.name === "codeforces" ? platform.stats.rating :
                 platform.stats.total_solved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {platform.name === "hackerrank" ? `Badges: ${platform.stats.badges?.length}` :
                 platform.name === "gfg" ? `Total Solved: ${platform.stats.total_solved}` :
                 platform.name === "codechef" ? `Rank: #${platform.stats.rank}` :
                 platform.name === "codeforces" ? `Rank: ${platform.stats.rank}` :
                 `Ranking: #${platform.stats.ranking}`}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, bgcolor: 'background.paper', width: '100%' }}>
              <Typography variant="h6" gutterBottom>Platform Specific Stats</Typography>
              <Grid container spacing={2}>
                {platform.name === "hackerrank" ? (
                  <>
                    {platform.stats.badges?.map((badge, index) => (
                      <Grid item xs={4} key={index}>
                        <Typography variant="h6" color="#4CAF50">{badge.stars}</Typography>
                        <Typography variant="body2" color="text.secondary">{badge.title}</Typography>
                      </Grid>
                    ))}
                  </>
                ) : platform.name === "gfg" ? (
                  <>
                    <Grid item xs={2.4}><Typography variant="h6" color="success.main">{platform.stats.school_solved}</Typography><Typography variant="body2" color="text.secondary">School</Typography></Grid>
                    <Grid item xs={2.4}><Typography variant="h6" color="warning.main">{platform.stats.basic_solved}</Typography><Typography variant="body2" color="text.secondary">Basic</Typography></Grid>
                    <Grid item xs={2.4}><Typography variant="h6" color="error.main">{platform.stats.easy_solved}</Typography><Typography variant="body2" color="text.secondary">Easy</Typography></Grid>
                    <Grid item xs={2.4}><Typography variant="h6" color="primary.main">{platform.stats.medium_solved}</Typography><Typography variant="body2" color="text.secondary">Medium</Typography></Grid>
                    <Grid item xs={2.4}><Typography variant="h6" color="secondary.main">{platform.stats.hard_solved}</Typography><Typography variant="body2" color="text.secondary">Hard</Typography></Grid>
                  </>
                ) : platform.name === "codechef" ? (
                  <>
                    <Grid item xs={4}><Typography variant="h6" color="success.main">{platform.stats.rating}</Typography><Typography variant="body2" color="text.secondary">Rating</Typography></Grid>
                    <Grid item xs={4}><Typography variant="h6" color="error.main">{platform.stats.total_solved}</Typography><Typography variant="body2" color="text.secondary">Total Solved</Typography></Grid>
                  </>
                ) : platform.name === "codeforces" ? (
                  <>
                    <Grid item xs={4}><Typography variant="h6" color="success.main">{platform.stats.rating || 0}</Typography><Typography variant="body2" color="text.secondary">Rating</Typography></Grid>
                    <Grid item xs={4}><Typography variant="h6" color="warning.main">{platform.stats.max_rating || 0}</Typography><Typography variant="body2" color="text.secondary">Max Rating</Typography></Grid>
                    <Grid item xs={4}><Typography variant="h6" color="error.main">{platform.stats.total_solved}</Typography><Typography variant="body2" color="text.secondary">Total Solved</Typography></Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={3}><Typography variant="h6" color="success.main">{platform.stats.easy_solved}</Typography><Typography variant="body2" color="text.secondary">Easy</Typography></Grid>
                    <Grid item xs={3}><Typography variant="h6" color="warning.main">{platform.stats.medium_solved}</Typography><Typography variant="body2" color="text.secondary">Medium</Typography></Grid>
                    <Grid item xs={3}><Typography variant="h6" color="error.main">{platform.stats.hard_solved}</Typography><Typography variant="body2" color="text.secondary">Hard</Typography></Grid>
                    <Grid item xs={3}><Typography variant="h6" color="primary.main">{platform.stats.total_solved}</Typography><Typography variant="body2" color="text.secondary">Total</Typography></Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          {platform.name !== "leetcode" && platform.name !== "gfg" && (
            <Typography variant="h6" gutterBottom>Detailed Statistics</Typography>
          )}
          {platform.name === "hackerrank" ? (
            <>
              <Typography variant="body1">Total Badges: {platform.stats.badges?.length}</Typography>
              {platform.stats.badges?.map((badge, index) => (
                <Typography variant="body1" key={index}>{badge.title}: {badge.stars} stars</Typography>
              ))}
              {platform.stats.certificates?.map((cert, index) => (
                <>
                  <Typography variant="body1" key={index}>{cert.name}</Typography>
                  <Typography variant="body2" color={cert.verified ? "success.main" : "text.secondary"}>
                    {cert.verified ? "✓ Verified" : "Not Verified"}
                  </Typography>
                </>
              ))}
              <Button 
                variant="contained" 
                color="primary" 
                href={platform.stats.profile_url} 
                target="_blank" 
                sx={{
                  mt: 2,
                  width: '100%'
                }}
              >
                View Profile on {platform.name}
              </Button>
            </>
          ) : platform.name === "codeforces" ? (
            <>
              <Typography variant="body1">Rating: {platform.stats.rating || 0}</Typography>
              <Typography variant="body1">Max Rating: {platform.stats.max_rating || 0}</Typography>
              <Typography variant="body1">Rank: {platform.stats.rank}</Typography>
              <Typography variant="body1">Max Rank: {platform.stats.max_rank}</Typography>
              <Typography variant="body1">Total Solved: {platform.stats.total_solved || 'N/A'}</Typography>
              <Typography variant="body1">Contests: {platform.stats.contest_count}</Typography>
              <Button 
                variant="contained" 
                color="primary" 
                href={platform.stats.profile_url} 
                target="_blank" 
                sx={{
                  mt: 2,
                  width: '100%'
                }}
              >
                View Profile on {platform.name}
              </Button>
            </>
          ) : platform.name === "codechef" ? (
            <>
              <Typography variant="body1">Rating: {platform.stats.rating}</Typography>
              <Typography variant="body1">Total Solved: {platform.stats.total_solved}</Typography>
              <Button 
                variant="contained" 
                color="primary" 
                href={platform.stats.profile_url} 
                target="_blank" 
                sx={{
                  mt: 2,
                  width: '100%'
                }}
              >
                View Profile on {platform.name}
              </Button>
            </>
          ) : null}
          {pieChart}
        </Paper>
      </Box>
    );
  };

  const selectedPlatformData = platforms.find(p => p.name === selectedPlatform);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleDarkModeToggle = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: darkMode ? '#000000' : '#ffffff' }}>
      {/* Header */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backdropFilter: "blur(10px)",
          bgcolor: darkMode ? "rgba(0, 0, 0, 0.95)" : "rgba(255, 255, 255, 0.95)",
          borderBottom: `1px solid ${darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
        }}
      >
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                color: darkMode ? "#f8fafc" : "#0f172a",
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
              onClick={handleLogoClick}
            >
              Code<span style={{ color: "#dc2626", fontWeight: 800 }}>Tracker</span>
            </Typography>
            <IconButton
              onClick={handleDarkModeToggle}
              sx={{ color: darkMode ? "#f8fafc" : "#0f172a" }}
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ 
        mt: 12,
        bgcolor: darkMode ? '#000000' : '#ffffff',
        pt: 4,
        pb: 4
      }}>
        <Paper
          sx={{
            p: 4,
            borderRadius: 2,
            backdropFilter: 'blur(6px)',
            backgroundColor: 'rgba(30, 41, 59, 0.85)',
          }}
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>Your Coding Progress</Typography>
            <Tabs value={selectedPlatform} onChange={handleTabChange} sx={{ mb: 4 }}>
              {platforms.map(platform => (
                <Tab key={platform.name} value={platform.name} label={platform.name.charAt(0).toUpperCase() + platform.name.slice(1)} />
              ))}
            </Tabs>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {selectedPlatformData && (
              <Box>
                {selectedPlatformData.loading && <CircularProgress />}
                {selectedPlatformData.error && <Alert severity="error" sx={{ mb: 2 }}>{selectedPlatformData.error}</Alert>}
                {getPlatformStats(selectedPlatformData)}
              </Box>
            )}
          </motion.div>
        </Paper>
      </Container>

      {selectedPlatformData && !selectedPlatformData.loading && (
        <Footer darkMode={darkMode} />
      )}
    </Box>
  );
}

export default Dashboard;