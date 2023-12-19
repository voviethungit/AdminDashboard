import { useState } from 'react';
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField, Snackbar } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setAlertMessage('Vui lòng nhập đầy đủ email và mật khẩu.');
      setOpenAlert(true);
      return;
    }

    fetch('http://localhost:5000/login', {
      method: 'POST',
      crossDomain: true,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Email hoặc mật khẩu không chính xác.');
        }
        return res.json();
      })
      .then((data) => {
        if (data.isAdmin === false) {
          setAlertMessage('Bạn không có quyền truy cập vào trang quản trị.');
          setOpenAlert(true);
        } else {
          setAlertMessage('Chào mừng quản trị viên!');
          setOpenAlert(true);
          setTimeout(() => {
            window.localStorage.setItem('isAdmin', data.isAdmin);
            window.localStorage.setItem('accessToken', data.accessToken);
            window.location.href = '/dashboard';
          }, 3000);
        }
      })
      .catch((error) => {
        setAlertMessage(error.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
        setOpenAlert(true);
      });
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  return (
    <>
      <Stack spacing={3}>
        <TextField name="email" label="Nhập Email Admin" onChange={(e) => setEmail(e.target.value)} />

        <TextField
          name="password"
          label="Nhập Mật Khẩu"
          type={showPassword ? 'text' : 'password'}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <Link variant="subtitle2" underline="hover">
          Quên Mật Khẩu ?
        </Link>
      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleClick}>
        Login
      </LoadingButton>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={openAlert}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        message={alertMessage}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseAlert}>
            {/* You can add close icon here */}
          </IconButton>
        }
      />
    </>
  );
}
