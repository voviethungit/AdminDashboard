import React, {useState, useEffect} from 'react'
import 
{ BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsFillBellFill}
 from 'react-icons/bs'
 import 
 { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } 
 from 'recharts';
 import './css/dashboard.css'
import { Helmet } from 'react-helmet-async';
// @mui
import {
  Stack,
  Typography,
} from '@mui/material';
import axios from 'axios';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';


function Home() {
  const [count, setCount] = useState({ totalUsers: 0, totalCars: 0, totalCategories: 0 });
    const data = [
        {
          name: 'Page A',
          uv: 4000,
          pv: 2400,
          amt: 2400,
        },
        {
          name: 'Page B',
          uv: 3000,
          pv: 1398,
          amt: 2210,
        },
        {
          name: 'Page C',
          uv: 2000,
          pv: 9800,
          amt: 2290,
        },
        {
          name: 'Page D',
          uv: 2780,
          pv: 3908,
          amt: 2000,
        },
        {
          name: 'Page E',
          uv: 1890,
          pv: 4800,
          amt: 2181,
        },
        {
          name: 'Page F',
          uv: 2390,
          pv: 3800,
          amt: 2500,
        },
        {
          name: 'Page G',
          uv: 3490,
          pv: 4300,
          amt: 2100,
        },
      ];
     
  useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await axios.get('http://localhost:5000/countAll');
            const { totalUsers, totalCars, totalCategories } = response.data;
            setCount({ totalUsers, totalCars, totalCategories });
          } catch (error) {
            console.error('Lỗi khi lấy thông tin thống kê:', error);
          }
        };
    
        fetchData();
      }, []);
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
    <main className='main-container'>
        <div className='main-cards'>
            <div className='card'>
                <div className='card-inner'>
                    <h3>Tổng Xe</h3>
                    <BsFillArchiveFill className='card_icon'/>
                </div>
                <h1>{count.totalCars}</h1>
            </div>
            <div className='card'>
                <div className='card-inner'>
                    <h3>Tổng Danh Mục</h3>
                    <BsFillGrid3X3GapFill className='card_icon'/>
                </div>
                <h1>{count.totalCategories}</h1>
            </div>
            <div className='card'>
                <div className='card-inner'>
                    <h3>Tổng Người Dùng</h3>
                    <BsPeopleFill className='card_icon'/>
                </div>
                <h1>{count.totalUsers}</h1>
            </div>
            <div className='card'>
                <div className='card-inner'>
                    <h3>Tổng Đơn Báo Cáo</h3>
                    <BsFillBellFill className='card_icon'/>
                </div>
                <h1>42</h1>
            </div>
        </div>

        <div className='charts'>
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
            width={500}
            height={300}
            data={data}
            margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
            }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pv" fill="#8884d8" />
                <Bar dataKey="uv" fill="#82ca9d" />
                </BarChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                width={500}
                height={300}
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                </LineChart>
            </ResponsiveContainer>

        </div>
    </main>
    </>
  )
}

export default Home