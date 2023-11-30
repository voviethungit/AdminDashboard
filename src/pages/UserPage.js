import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Popover,
  Grid,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  Dialog,
  TextField,
  DialogActions,
  Button,
  DialogContent,
  DialogTitle,
  TablePagination,
} from '@mui/material';
// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';

// sections
import { UserListHead } from '../sections/@dashboard/user';

const TABLE_HEAD = [
  { id: 'name', label: 'Tên', alignRight: false },
  { id: 'location', label: 'Địa chỉ', alignRight: false },
  { id: 'email', label: 'Email', alignRight: false },
  { id: 'phoneNumber', label: 'Số điện thoại', alignRight: false },
  { id: 'isVerified', label: 'Xác thực', alignRight: false },
  { id: 'status', label: 'Trạng thái', alignRight: false },
  { id: '', label: 'Hoạt động', alignRight: false },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function UserPage() {
  const [open, setOpen] = useState(null);
  const [users, setUsers] = useState([]);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');
  const [errors, setErrors] = useState({});
  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [editUser, setEditUser] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState(null);

  const [openConfirmation, setOpenConfirmation] = useState(false);

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      if (error.code === 'ERR_INVALID_URL') {
        return true;
      }
      return false;
    }
  };

  const isValidFacebookLink = (link) => {
    return link.includes('facebook.com/');
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    let errorMessages = { ...errors };

    if (name === 'fullName') {
      if (!value || value.trim() === '') {
        errorMessages = {
          ...errorMessages,
          fullName: 'Vui lòng nhập họ và tên.',
        };
      } else {
        delete errorMessages.fullName;
      }
    }
    if (name === 'email') {
      if (!value || value.trim() === '') {
        errorMessages = {
          ...errorMessages,
          email: 'Vui lòng nhập địa chỉ email.',
        };
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        errorMessages = {
          ...errorMessages,
          email: 'Địa chỉ email không hợp lệ.',
        };
      } else {
        delete errorMessages.email;
      }
    }
    if (name === 'avatar') {
      if (!value || value.trim() === '') {
        errorMessages = {
          ...errorMessages,
          avatar: 'Vui lòng nhập URL hình ảnh.',
        };
      } else if (!isValidUrl(value)) {
        errorMessages = {
          ...errorMessages,
          avatar: 'Địa chỉ URL không hợp lệ.',
        };
      } else {
        delete errorMessages.avatar;
      }
    }
    if (name === 'location') {
      if (!value || value.trim() === '') {
        errorMessages = {
          ...errorMessages,
          location: 'Vui lòng nhập địa chỉ.',
        };
      } else {
        delete errorMessages.location;
      }
    }
    if (name === 'birthDay') {
      if (!value || value.trim() === '') {
        errorMessages = {
          ...errorMessages,
          birthDay: 'Vui lòng chọn ngày sinh.',
        };
      } else {
        delete errorMessages.birthDay;
      }
    }
    if (name === 'linkFB') {
      if (!value || value.trim() === '') {
        errorMessages = {
          ...errorMessages,
          linkFB: 'Vui lòng nhập đường dẫn Facebook.',
        };
      } else if (!isValidFacebookLink(value)) {
        errorMessages = {
          ...errorMessages,
          linkFB: 'Đường dẫn Facebook không hợp lệ.',
        };
      } else {
        delete errorMessages.linkFB;
      }
    }
    setErrors(errorMessages);
    setEditUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const renderError = (field) => {
    if (errors[field]) {
      return (
        <Typography variant="body2" color="error">
          {errors[field]}
        </Typography>
      );
    }
    return null;
  };

  const handleOpenConfirmation = (userId) => {
    setSelectedUserId(userId);
    setOpenConfirmation(true);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((user) => user.fullName);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;

  const filteredUsers = applySortFilter(users, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  const handleBanUser = async (userId) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

      const confirmBan = true;
      if (confirmBan) {
        setOpenConfirmation(true);
        await axios.put(`http://localhost:5000/delete-user/${userId}`, null, { headers });
        window.location.reload();
      }
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };
  const handleEditUser = async (userId, updatedUserData) => {
    try {
      if (!updatedUserData.fullName || !updatedUserData.email || !updatedUserData.location) {
        console.error('Vui lòng điền đầy đủ thông tin cần thiết');
        return;
      }
      const accessToken = localStorage.getItem('accessToken');
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

      const response = await axios.put(`http://localhost:5000/edit-user/${userId}`, updatedUserData, { headers });

      if (response.data.success) {
        window.location.reload();
        console.log('Thông tin người dùng đã được cập nhật:', response.data.user);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin người dùng:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');

        const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

        const response = await axios.get('http://localhost:5000/getAllUser', { headers });

        setUsers(response.data.users);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Helmet>
        <title> Quản Lý Người Dùng </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Quản Lý Người Dùng
          </Typography>
        </Stack>

        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={users.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                    <TableRow hover key={user._id} tabIndex={-1} role="checkbox">
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected.includes(user.fullName)}
                          onChange={(event) => handleClick(event, user.fullName)}
                        />
                      </TableCell>

                      <TableCell component="th" scope="row" padding="none">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar alt={user.fullName} src={user.avatar} />
                          <Typography variant="subtitle2" noWrap>
                            {user.fullName}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="left">{user.location}</TableCell>
                      <TableCell align="left">{user.email}</TableCell>
                      <TableCell align="left">0{user.phoneNumber}</TableCell>
                      <TableCell align="left">{user.isVerified}</TableCell>
                      <TableCell align="left">
                        <Label color={(user.status === 'banned' && 'error') || 'success'}>
                          {sentenceCase(user.status)}
                        </Label>
                      </TableCell>
                      <TableCell component="th" scope="row" padding="none">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <MenuItem
                            onClick={() => {
                              setEditUser(user);
                              setOpenEditDialog(true);
                            }}
                          >
                            <Stack direction="column" alignItems="center">
                              <Iconify icon={'eva:edit-fill'} sx={{ mb: 1 }} />
                              <Typography variant="body2" noWrap>
                                Edit
                              </Typography>
                            </Stack>
                          </MenuItem>

                          <MenuItem
                            sx={{ color: 'error.main' }}
                            variant="subtitle2"
                            noWrap
                            onClick={() => handleOpenConfirmation(user._id)}
                          >
                            <Stack direction="column" alignItems="center">
                              <Iconify icon={'eva:trash-2-outline'} sx={{ mb: 1 }} />
                              <Typography variant="body2" noWrap>
                                Banned
                              </Typography>
                            </Stack>
                          </MenuItem>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem sx={{ color: 'error.main' }}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Banned
        </MenuItem>
      </Popover>
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
        <br />
        <DialogContent>
          {editUser && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Họ và tên"
                  name="fullName"
                  value={editUser.fullName}
                  onChange={handleInputChange}
                  error={Boolean(errors.fullName)}
                  helperText={renderError('fullName')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={editUser.email}
                  onChange={handleInputChange}
                  error={Boolean(errors.email)}
                  helperText={renderError('email')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ảnh đại diện"
                  name="avatar"
                  value={editUser.avatar}
                  onChange={handleInputChange}
                  error={Boolean(errors.avatar)}
                  helperText={renderError('avatar')}
                />
              </Grid>
              <Grid item xs={12}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Địa Chỉ"
                    name="location"
                    value={editUser.location}
                    onChange={handleInputChange}
                    error={Boolean(errors.location)}
                    helperText={renderError('location')}
                  />
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type='date'
                  label="Ngày Sinh"
                  name="birthDay"
                  value={editUser.birthDay}
                  onChange={handleInputChange}
                  error={Boolean(errors.birthDay)}
                  helperText={renderError('birthDay')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Liên Kết Facebook"
                  name="linkFB"
                  value={editUser.linkFB}
                  onChange={handleInputChange}
                  error={Boolean(errors.linkFB)}
                  helperText={renderError('linkFB')}
                />
              </Grid>
              <Grid item xs={12}>
                <Button onClick={() => handleEditUser(editUser._id, editUser)} color="primary">
                  Lưu thay đổi
                </Button>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={openConfirmation} onClose={() => setOpenConfirmation(false)}>
        <DialogTitle>Xác nhận</DialogTitle>
        <DialogContent>
          <Typography>Bạn có muốn cấm người dùng này không?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmation(false)}>Hủy</Button>
          <Button
            onClick={() => {
              setOpenConfirmation(false);
              handleBanUser(selectedUserId);
            }}
            color="error"
          >
            Xác nhận cấm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
