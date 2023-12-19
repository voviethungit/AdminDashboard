import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useState, useEffect, useRef } from 'react';
import './css/blogs.css';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { FaX } from 'react-icons/fa6';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Popover,
  Grid,
  Checkbox,
  TableRow,
  MenuItem,
  InputLabel,
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
  DialogContentText,
  DialogTitle,
  TablePagination,
} from '@mui/material';
import { saveAs } from 'file-saver';
import { useReactToPrint } from 'react-to-print';
import { Link } from 'react-router-dom';
// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead } from '../sections/@dashboard/user';
import MyDocumentComponent from './MyDocumentComponent';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'fullName', label: 'Họ và Tên', alignRight: false },
  { id: 'location', label: 'Địa chỉ', alignRight: false },
  { id: 'title', label: 'Xe Thuê', alignRight: false },
  { id: 'price', label: 'Tổng tiền', alignRight: false },
  { id: 'status', label: 'Trạng Thái', alignRight: false },
  { id: '' },
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

  
export default function RentalPage() {
  const [open, setOpen] = useState(null);
  const [rentalRecords, setRentalRecords] = useState([]);
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const isAdmin = localStorage.getItem('isAdmin');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const compoentPDF = useRef();
  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rentalRecords.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };
  const handleOpenConfirmation = (rentalHistoryId) => {
    setSelectedUserId(rentalHistoryId);
    setOpenConfirmation(true);
  };

  const handleDeleteRentalHistory = async (rentalHistoryId) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  
      const response = await axios.put(`http://localhost:5000/rental-history/${rentalHistoryId}`, null, {
        headers,
      });
  
      if (response.data.success) {
        const updatedRentalhistory = rentalRecords.filter((rentalRecord) => rentalRecord._id !== rentalHistoryId);
        setRentalRecords(updatedRentalhistory);
      }
    } catch (error) {
      console.error('Lỗi khi xóa khách hàng:', error);
    }
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

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rentalRecords.length) : 0;

  const filteredUsers = applySortFilter(rentalRecords, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  const fetchRentalHistory = async () => {
    try {

        const accessToken = localStorage.getItem('accessToken');
        const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      const response = await axios.get('http://localhost:5000/rental-history', {headers});
      const fetchedRentalRecords = response.data.rentalRecords;
      setRentalRecords(fetchedRentalRecords);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRentalHistory();
  }, []);
  const generatePDF = useReactToPrint({
    content: ()=>compoentPDF.current,
    documentTitle: "HOA DON THUE XE",
    onAfterPrint: ()=>alert("Thanh Cong!")
  });
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
        <title> Quản Lý Hóa Đơn </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
          Quản Lý Hóa Đơn
          </Typography>
          <Button variant="contained"  onClick={ generatePDF }>
        Xuất Toàn Bộ Tới PDF
      </Button>
        </Stack>

        <Card>
          <Scrollbar>
          <div ref={compoentPDF} style={{width: '100%'}}>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={rentalRecords.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((rentalRecord) => (
                      <TableRow hover key={rentalRecord._id} tabIndex={-1} >
                        <TableCell padding="checkbox">
                          <Checkbox checked={selected.includes(rentalRecord.title)}
                          onChange={(event) => handleClick(event, rentalRecord.title)} />
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {rentalRecord.fullName}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell align="left">{rentalRecord.location}</TableCell>

                        <TableCell align="left">{rentalRecord.title}</TableCell>
                        <TableCell align="left">{rentalRecord.price}đ</TableCell>
                        <TableCell align="left">
                          <Label color={(rentalRecord.status === 'Fail' && 'error') || 'success'}>{rentalRecord.status}</Label>
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
                            </div>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rentalRecords.length}
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
          Delete
        </MenuItem> */}
      </Popover>
      <Dialog open={openConfirmation} onClose={() => setOpenConfirmation(false)}>
          <DialogTitle>Xác nhận</DialogTitle>
          <DialogContent>
            <Typography>Bạn có muốn xóa Lịch Sử Thuê này không?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirmation(false)}>Hủy</Button>
            <Button
              onClick={() => {
                setOpenConfirmation(false);
                handleDeleteRentalHistory(selectedUserId);
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
