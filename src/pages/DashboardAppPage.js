import React, { useState, useEffect } from 'react';
import { BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsFillBellFill } from 'react-icons/bs';
import { PieChart,BarChart,CartesianGrid,XAxis,YAxis,Legend,Bar, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import './css/dashboard.css';
import { Helmet } from 'react-helmet-async';
// @mui
import { Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';


function Home() {
  const [count, setCount] = useState({ totalUsers: 0, totalCars: 0, totalCategories: 0 });
  const [carAvailabilityData, setCarAvailabilityData] = useState([]);
  const isAdmin = localStorage.getItem('isAdmin');
  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseTotal = await axios.get('http://localhost:5000/countAll');
        const { totalUsers, totalCars, totalCategories } = responseTotal.data;
        setCount({ totalUsers, totalCars, totalCategories });

        const responseAvailable = await axios.get('http://localhost:5000/countAvailableCars');
        const responseUnavailable = await axios.get('http://localhost:5000/countUnavailableCars');

        const availableCount = responseAvailable.data.countAvailableCars;
        const unavailableCount = responseUnavailable.data.countUnavailableCars;

        setCarAvailabilityData([
          { name: 'Xe Chưa Được Thuê', value: availableCount },
          { name: 'Xe Đã Được Thuê', value: unavailableCount },
        ]);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin thống kê:', error);
      }
    };

    fetchData();
  }, []);
  if (!isAdmin) {
    return (
      <div>
        <h1 style={{textAlign: 'center'}}>Bạn không phải là Quản trị viên.</h1>
        <p style={{textAlign: 'center'}}>Nếu là Quản trị viên vui lòng đăng nhập để tiếp tục.</p>
        <Link to="/login-admin" replace style={{textAlign: 'center', textDecoration: 'none'}}>Đăng Nhập</Link>
      </div>
    );
  }
  return (
    <>
      <Helmet>
        <title> Bảng Điều Khiển </title>
      </Helmet>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4" gutterBottom>
          Bảng Điều Khiển
        </Typography>
      </Stack>
      <main className="main-container">
        <div className="main-cards">
          <div className="card">
            <div className="card-inner">
              <h3>Tổng Xe</h3>
              <BsFillArchiveFill className="card_icon" />
            </div>
            <h1>{count.totalCars}</h1>
          </div>
          <div className="card">
            <div className="card-inner">
              <h3>Tổng Danh Mục</h3>
              <BsFillGrid3X3GapFill className="card_icon" />
            </div>
            <h1>{count.totalCategories}</h1>
          </div>
          <div className="card">
            <div className="card-inner">
              <h3>Tổng Người Dùng</h3>
              <BsPeopleFill className="card_icon" />
            </div>
            <h1>{count.totalUsers}</h1>
          </div>
          <div className="card">
            <div className="card-inner">
              <h3>Tổng Đơn Báo Cáo</h3>
              <BsFillBellFill className="card_icon" />
            </div>
            <h1>42</h1>
          </div>
        </div>

        <div className="pie-chart-container">
          <h2>Biểu Đồ Tròn</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie data={carAvailabilityData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                {carAvailabilityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#82ca9d' : '#FF8042'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className='legend'>
  <div style={{ backgroundColor: '#82ca9d', textAlign: 'center' }}>
    <span className='legend-box'>
      <span className='color-box'  />
    </span>
    Xe Chưa Được Thuê
  </div>
  <div style={{ backgroundColor: '#FF8042', textAlign: 'center'}}>
    <span className='legend-box'>
      <span className='color-box'  />
    </span>
    Xe Đã Được Thuê
  </div>
</div>
      </main>
    </>
  );
}

export default Home;
