// import { useState } from 'react';
// // @mui
// import { Link, Stack, IconButton, InputAdornment, TextField, Checkbox } from '@mui/material';
// import { LoadingButton } from '@mui/lab';
// // components
// import Iconify from '../../../components/iconify';

// // ----------------------------------------------------------------------

// export default function LoginForm() {
//   const [email, setEmail ]= useState("");
//   const [password, setPassword ]= useState("");


//   const [showPassword, setShowPassword] = useState(false);

//   function handleClick(e) {
//     e.preventDefault();
//     fetch("http://localhost:5000/login", {
//       method: "POST",
//       crossDomain: true,
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//         "Access-Control-Allow-Origin": "*",
//       },
//       body: JSON.stringify({
//         email,
//         password,
//       }),
//     })
//       .then((res) => res.json())
//       .then((data) => {
//           console.log(data, "userLogin");
//           console.log(email, password);
//         window.localStorage.setItem("accessToken", data.accessToken);
//         window.location.href = "http://localhost:3000/dashboard";
//       });
//   }

//   return (
//     <>
//       <Stack spacing={3}>
//         <TextField name="email" label="Email address" onChange={(e) => setEmail(e.target.value)}/>

//         <TextField
//           name="password"
//           label="Password"
//           type={showPassword ? 'text' : 'password'}
//           onChange={(e) => setPassword(e.target.value)}
//           InputProps={{
//             endAdornment: (
//               <InputAdornment position="end">
//                 <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
//                   <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
//                 </IconButton>
//               </InputAdornment>
//             ),
//           }}
//         />
//       </Stack>

//       <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
//         <Checkbox name="remember" label="Remember me" />
//         <Link variant="subtitle2" underline="hover">
//           Forgot password?
//         </Link>
//       </Stack>

//       <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleClick}>
//         Login
//       </LoadingButton>
//     </>
//   );
// }
