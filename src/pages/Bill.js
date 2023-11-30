import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { filter } from 'lodash';
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
  { id: 'car', label: 'Tên xe', alignRight: false },
  { id: 'user', label: 'Người thuê', alignRight: false },
  { id: 'phone', label: 'Số điện thoại', alignRight: false },
  { id: 'email', label: 'Gmail', alignRight: false },
  { id: 'rentStartDate', label: 'Ngày bắt đầu', alignRight: false },
  { id: 'rentEndDate', label: 'Ngày kết thúc', alignRight: false },
  { id: 'totalAmount', label: 'Giá tiền', alignRight: false },
  { id: 'isPaid', label: 'Trạng thái', alignRight: false },
  { id: '', label: 'Hoạt động', alignRight: false }
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

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [billData, setBillData] = useState({
    car: '',
    user: '',
    rentStartDate: '',
    rentEndDate: '',
    totalAmount: '',
    isPaid: '',
  });


  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = bills.map((bill) => bill.user);
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


  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - bills.length) : 0;

  const filteredBills = applySortFilter(bills, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredBills.length && !!filterName;

  const handleCarInputChange = (event) => {
    const { name, value } = event.target;
    setBillData((prevBillData) => ({
      ...prevBillData,
      [name]: value,
    }));
  };

  // HANDLE UPLOAD 
const [openAddDialog, setOpenAddDialog] = useState(false);

const handleOpenAddDialog = () => {
  setOpenAddDialog(true);
};

const handleCloseAddDialog = () => {
  setOpenAddDialog(false);
};

const handleAddBill = async () => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

    const response = await axios.post('http://localhost:5000/create-bill', billData, {
      headers,
    });

    if (response.data.success) {
      window.location.reload();
      console.log('Thêm hóa đơn thành công:', response.data.bill);
      handleCloseAddDialog();
    }
  } catch (error) {
    console.error('Lỗi khi thêm hóa đơn:', error);
  }
};
useEffect(() => {
  const accessToken = localStorage.getItem('accessToken');
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  axios
    .get('http://localhost:5000/get-all-bill', {
      headers,
    })
    .then((response) => {
      const billsData = response.data.bills;
      setBills(billsData);
    })
    .catch((error) => {
      console.error('Lỗi:', error);
    });
}, []);

  return (
    <div>
      <Helmet>
        <title> Quản Lý Hóa Đơn </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Quản Lý Hóa Đơn
          </Typography>
          <Button variant="contained" color="primary" onClick={handleOpenAddDialog}>
            Thêm Hóa Đơn
          </Button>
        </Stack>
        <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
        <DialogTitle>Thêm Hóa Đơn</DialogTitle>
        <DialogContent>
        <TextField
            fullWidth
            label="Nhập ID Xe Thuê"
            name="car"
            value={billData.car}
            onChange={handleCarInputChange}
          />
          <TextField
            fullWidth
            label="Nhập ID Người Dùng"
            name="user"
            value={billData.user}
            onChange={handleCarInputChange}
          />
          <TextField
            fullWidth
            label="Tổng Giá Tiền"
            name="totalAmount"
            value={billData.totalAmount}
            onChange={handleCarInputChange}
          />
          <TextField
            fullWidth
            label="Trạng Thái Đơn Hàng"
            name="isPaid"
            value={billData.isPaid}
            onChange={handleCarInputChange}
          />
          <TextField
            fullWidth
            type='date'
            label="Ngày Tạo Hóa Đơn"
            name="rentStartDate"
            value={billData.rentStartDate}
            onChange={handleCarInputChange}
          />
          <TextField
            fullWidth
            type='date'
            label="Ngày Hết Hạn Hóa Đơn"
            name="rentEndDate"
            value={billData.rentEndDate}
            onChange={handleCarInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Hủy</Button>
          <Button onClick={handleAddBill} color="primary">
            Thêm
          </Button>
        </DialogActions>
      </Dialog>

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={bills.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                {filteredBills.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((bill) => (
                      <TableRow hover key={bill._id} tabIndex={-1} role="checkbox" >
                        <TableCell padding="checkbox">
                          <Checkbox checked={selected.includes(bill.user)}
                          onChange={(event) => handleClick(event, bill.user)}/>
                        </TableCell>
                        <TableCell align="left">{bill.car}</TableCell>
                        <TableCell align="left">{bill.user}</TableCell>
                        <TableCell align="left">{bill.rentStartDate}</TableCell>
                        <TableCell align="left">{bill.rentEndDate}</TableCell>
                        <TableCell align="left">{bill.totalAmount}</TableCell>
                        <TableCell align="left">{bill.isPaid}</TableCell>
                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <MenuItem>
                              <Stack direction="column" alignItems="center">
                                <Iconify icon={'eva:edit-fill'} sx={{ mb: 1 }} />
                                <Typography variant="body2" noWrap>
                                  Sửa
                                </Typography>
                              </Stack>
                            </MenuItem>

                            <MenuItem sx={{ color: 'error.main' }} variant="subtitle2" noWrap>
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
            count={bills.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
      </Container>

     
    </div>
  );
}
