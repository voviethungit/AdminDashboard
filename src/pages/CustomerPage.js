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
    Select,
    Avatar,
    Popover,
    Grid,
    InputLabel,
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
  import { Link } from 'react-router-dom';
  // components
  import Label from '../components/label';
  import Iconify from '../components/iconify';
  import Scrollbar from '../components/scrollbar';

  // sections
  import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';

  const TABLE_HEAD = [
    { id: 'fullName', label: 'Tên Khách Hàng', alignRight: false },
    { id: 'location', label: 'Địa Chỉ', alignRight: false },
    { id: 'nameCar', label: 'Xe Đã Thuê', alignRight: false },
    { id: 'amount', label: 'Tổng Tiền', alignRight: false },
    { id: 'Date', label: 'Ngày Tạo', alignRight: false },
    { id: 'status', label: 'Trạng Thái', alignRight: false },
    { id: '', label: 'Thao Tác', alignRight: false },
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
      return filter(array, (customer) => customer.fullName.toLowerCase().indexOf(query.toLowerCase()) !== -1);
    }
    return stabilizedThis.map((el) => el[0]);
  }

  export default function CustomerPage() {
    const [open, setOpen] = useState(null);
    const [customers, setCustomers] = useState([]);

    const [page, setPage] = useState(0);

    const [order, setOrder] = useState('asc');
    const [errors, setErrors] = useState({});
    const [selected, setSelected] = useState([]);

    const [orderBy, setOrderBy] = useState('name');

    const [filterName, setFilterName] = useState('');

    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [editCustomer, setEditCustomer] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);

    const [selectedUserId, setSelectedUserId] = useState(null);

    const [openConfirmation, setOpenConfirmation] = useState(false);
    const isAdmin = localStorage.getItem('isAdmin');
    const handleFileChange = (e) => {
      setEditCustomer({ ...editCustomer, avatar: e.target.files[0] });
    };

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

      setEditCustomer((prevCustomer) => ({
        ...prevCustomer,
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

    const handleOpenConfirmation = (customerId) => {
      setSelectedUserId(customerId);
      setOpenConfirmation(true);
    };

    const handleRequestSort = (event, property) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
      if (event.target.checked) {
        const newSelecteds = customers.map((cutstomer) => cutstomer.fullName);
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

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - customers.length) : 0;

    const filteredUsers = applySortFilter(customers, getComparator(order, orderBy), filterName);

    const isNotFound = !filteredUsers.length && !!filterName;

    const handleDeleteCustomer = async (customerId) => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    
        const response = await axios.put(`http://localhost:5000/delete-customer/${customerId}`, null, {
          headers,
        });
    
        if (response.data.success) {
          const updatedCustomers = customers.filter((customer) => customer._id !== customerId);
          setCustomers(updatedCustomers);
        }
      } catch (error) {
        console.error('Lỗi khi xóa khách hàng:', error);
      }
    };
    
    const handleBlogInputChange = (event) => {
      const { name, value } = event.target;
      setCustomerData((preCustomerData) => ({
        ...preCustomerData,
        [name]: value,
      }));
    };

    const [addCustomerErrors, setAddCustomerErrors] = useState({
      fullName: '',
      location: '',
      nameCar: '',
      amount: '',
      Date: '',
      status: '',
    });
    const [customerData, setCustomerData] = useState({
      fullName: '',
      location: '',
      nameCar: '',
      amount: '',
      Date: '',
      status: '',
    });
    const handleAddCustomer = async () => {
      try {
        const errors = {};
        if (!customerData.fullName || customerData.fullName.trim() === '') {
          errors.fullName = 'Vui lòng nhập tên của Khách Hàng.';
        }

        if (!customerData.location || customerData.location.trim() === '') {
          errors.location = 'Vui lòng nhập địa chỉ nhận xe của Khách Hàng.';
        }

        if (!customerData.nameCar || customerData.nameCar.trim() === '') {
          errors.nameCar = 'Vui lòng nhập Tên của xe.';
        }

        if (!customerData.amount || customerData.amount.trim() === '') {
          errors.amount = 'Vui lòng nhập tổng tiền thuê xe.';
        }
        if (!customerData.Date || customerData.Date.trim() === '') {
          errors.Date = 'Vui lòng nhập ngày tạo hóa đơn.';
        }
        if (!customerData.status || customerData.status.trim() === '') {
          errors.status = 'Vui lòng nhập trạng thái hóa đơn.';
        }
        if (Object.keys(errors).length > 0) {
          setAddCustomerErrors(errors);
          return;
        }
        const accessToken = localStorage.getItem('accessToken');
        const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

        const response = await axios.post('http://localhost:5000/create-customer', customerData, {
          headers,
        });

        
        if (response.data.success) {
          window.location.reload();
          handleCloseAddDialog();
        }
      } catch (error) {
        console.error('Lỗi khi thêm khách hàng:', error);
      }
    };

    useEffect(() => {
      const fetchData = async () => {
        try {
          const accessToken = localStorage.getItem('accessToken');

          const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

          const response = await axios.get('http://localhost:5000/get-customer', { headers });

          setCustomers(response.data.customers);
        } catch (err) {
          console.error(err);
        }
      };

      fetchData();
    }, []);

    const [openAddDialog, setOpenAddDialog] = useState(false);

    const handleOpenAddDialog = () => {
      setOpenAddDialog(true);
    };

    const handleCloseAddDialog = () => {
      setOpenAddDialog(false);
    };

    const handleEditCustomer = async (customerId) => {
      try {
        const formData = new FormData();
        formData.append('fullName', editCustomer.fullName);
        formData.append('location', editCustomer.location);
        formData.append('nameCar', editCustomer.nameCar);
        formData.append('amount', editCustomer.amount);
        formData.append('Date', editCustomer.Date);
        formData.append('status', editCustomer.status);
        const accessToken = localStorage.getItem('accessToken');

        const response = await axios.put(`http://localhost:5000/edit-customer/${customerId}`, formData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
        window.location.reload();
        if (response.data.formData) {
        
          console.log('Thông tin Khách Hàng đã được cập nhật:', response.data.formData);
        }
      } catch (error) {
        console.error('Lỗi khi cập nhật thông tin Khách Hàng:', error);
      }
    };
    const handleFilterByName = (event) => {
      setPage(0);
      setFilterName(event.target.value);
    };
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
          <title> Quản Lý Khách Hàng </title>
        </Helmet>

        <Container>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              Quản Lý Khách Hàng
            </Typography>
            <Button variant="contained" color="primary" onClick={handleOpenAddDialog}>
              Thêm Khách Hàng
            </Button>
          </Stack>
          <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
            <DialogTitle>Thêm Bài Viết</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tên Khách Hàng"
                    name="fullName"
                    value={customerData.fullName}
                    onChange={handleBlogInputChange}
                    error={!!addCustomerErrors.fullName}
                    helperText={addCustomerErrors.fullName}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Địa Chỉ Nhận Xe"
                    name="location"
                    value={customerData.location}
                    onChange={handleBlogInputChange}
                    error={!!addCustomerErrors.location}
                    helperText={addCustomerErrors.location}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tên Xe"
                    name="nameCar"
                    value={customerData.nameCar}
                    onChange={handleBlogInputChange}
                    error={!!addCustomerErrors.nameCar}
                    helperText={addCustomerErrors.nameCar}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tổng Tiền Thuê"
                    name="amount"
                    value={customerData.amount}
                    onChange={handleBlogInputChange}
                    error={!!addCustomerErrors.amount}
                    helperText={addCustomerErrors.amount}
                  />
                </Grid>
                <Grid item xs={12}>
                  <InputLabel id="date-label">Ngày Tạo Đơn</InputLabel>
                  <TextField
                    fullWidth
                    type="date"
                    name="Date"
                    value={customerData.Date}
                    onChange={handleBlogInputChange}
                    error={!!addCustomerErrors.Date}
                    helperText={addCustomerErrors.Date}
                  />
                </Grid>
                <Grid item xs={12}>
                  <InputLabel id="status-label">Trạng Thái</InputLabel>
                  <Select
                    fullWidth
                    name="status"
                    value={customerData.status}
                    onChange={handleBlogInputChange}
                    error={!!addCustomerErrors.status}
                    helperText={addCustomerErrors.status}
                  >
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="waiting">Waiting</MenuItem>
                    <MenuItem value="false">False</MenuItem>
                  </Select>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseAddDialog}>Hủy</Button>
              <Button onClick={handleAddCustomer} color="primary">
                Thêm
              </Button>
            </DialogActions>
          </Dialog>

          <Card>
          <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />
            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <UserListHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={customers.length}
                    numSelected={selected.length}
                    onRequestSort={handleRequestSort}
                    onSelectAllClick={handleSelectAllClick}
                  />
                  <TableBody>
                    {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((customer) => (
                      <TableRow hover key={customer._id} tabIndex={-1} role="checkbox">
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selected.includes(customer.fullName)}
                            onChange={(event) => handleClick(event, customer.fullName)}
                          />
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {customer.fullName}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{customer.location}</TableCell>
                        <TableCell align="left">{customer.nameCar}</TableCell>
                        <TableCell align="left">{customer.amount}đ</TableCell>
                        <TableCell align="left">{customer.Date}</TableCell>
                        <TableCell align="left">
                          <Label
                            color={
                              (customer.status === 'false' && 'error') ||
                              (customer.status === 'waiting' && 'primary') ||
                              'success'
                            }
                          >
                            {sentenceCase(customer.status)}
                          </Label>
                        </TableCell>
                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <MenuItem
                              onClick={() => {
                                setEditCustomer(customer);
                                setOpenEditDialog(true);
                              }}
                            >
                              <Stack direction="column" alignItems="center">
                                <Iconify icon={'eva:edit-fill'} sx={{ mb: 1 }} />
                                <Typography variant="body2" noWrap>
                                  Sửa
                                </Typography>
                              </Stack>
                            </MenuItem>

                            <MenuItem
                              sx={{ color: 'error.main' }}
                              variant="subtitle2"
                              noWrap
                              onClick={() => handleOpenConfirmation(customer._id)}
                            >
                              <Stack direction="column" alignItems="center">
                                <Iconify icon={'eva:trash-2-outline'} sx={{ mb: 1 }} />
                                <Typography variant="body2" noWrap>
                                  Xóa
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
              count={customers.length}
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
          {/* <MenuItem>
            <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
            Edit
          </MenuItem>

          <MenuItem sx={{ color: 'error.main' }}>
            <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
            Banned
          </MenuItem> */}
        </Popover>
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
          <DialogTitle>Chỉnh sửa thông tin Khách Hàng</DialogTitle>
          <br />
          <DialogContent>
            {editCustomer && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    name="fullName"
                    value={editCustomer.fullName}
                    onChange={handleInputChange}
                    error={Boolean(errors.fullName)}
                    helperText={renderError('fullName')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Địa Chỉ"
                    name="location"
                    value={editCustomer.location}
                    onChange={handleInputChange}
                    error={Boolean(errors.location)}
                    helperText={renderError('location')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Xe Đã Thuê"
                      name="nameCar"
                      value={editCustomer.nameCar}
                      onChange={handleInputChange}
                      error={Boolean(errors.nameCar)}
                      helperText={renderError('nameCar')}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tổng Tiền"
                      name="amount"
                      value={editCustomer.amount}
                      onChange={handleInputChange}
                      error={Boolean(errors.amount)}
                      helperText={renderError('amount')}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <InputLabel id="date-label">Ngày Tạo Đơn</InputLabel>
                  <TextField
                    fullWidth
                    type="date"
                    name="Date"
                    value={editCustomer.Date}
                    onChange={handleInputChange}
                    error={Boolean(errors.Date)}
                    helperText={renderError('Date')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <InputLabel id="status-label">Trạng Thái</InputLabel>
                  <Select
                    fullWidth
                    name="status"
                    value={editCustomer.status}
                    onChange={handleInputChange}
                    error={Boolean(errors.status)}
                    helperText={renderError('status')}
                  >
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="waiting">Waiting</MenuItem>
                    <MenuItem value="false">False</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={12}>
                  <Button onClick={() => handleEditCustomer(editCustomer._id, editCustomer)} color="primary">
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
            <Typography>Bạn có muốn xóa Khách Hàng này không?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirmation(false)}>Hủy</Button>
            <Button
              onClick={() => {
                setOpenConfirmation(false);
                handleDeleteCustomer(selectedUserId);
              }}
              color="error"
            >
              Xác nhận xóa
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
