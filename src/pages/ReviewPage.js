import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useEffect, useState } from 'react';
import axios from 'axios';
// @mui
import {
  Card,
  Table,
  InputLabel,
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
  Select,
  TableContainer,
  Dialog,
  TextField,
  DialogActions,
  Button,
  DialogContent,
  DialogTitle,
  TablePagination,
  Menu,
} from '@mui/material';
// components
import { Link } from 'react-router-dom';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'fullName', label: 'Họ và Tên', alignRight: false },
  { id: 'rating', label: 'Số Sao', alignRight: false },
  { id: 'reviewText', label: 'Đánh Giá', alignRight: false },
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
    return filter(array, (review) => review.fullName.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function ReviewPage() {
  const [open, setOpen] = useState(null);
  const isAdmin = localStorage.getItem('isAdmin');
  const [page, setPage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');
  const [deleteReview, setDeleteReview] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [openPopover, setOpenPopover] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [expandedReviews, setExpandedReviews] = useState([]);

  const handleExpand = (index) => {
    const newExpandedReviews = [...expandedReviews];
    newExpandedReviews[index] = !newExpandedReviews[index];
    setExpandedReviews(newExpandedReviews);
  };
  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };
  const getReviews = async () => {
    try {
      const response = await axios.get('http://localhost:5000/reviews');
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    getReviews();
  }, []);
  const handleConfirmDelete = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

      const response = await axios.put(`http://localhost:5000/delete-reviews/${deleteReview}`, null, {
        headers,
      });

      if (response.data.success) {
        setDeleteReview(null);
        setOpenDialog(false);
        getReviews();
       console.log(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi xóa bình luận:', error);
    }
  };
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = reviews.map((n) => n.name);
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

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - reviews.length) : 0;

  const filteredUsers = applySortFilter(reviews, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;
  if (!isAdmin) {
    return (
      <div>
        <h1 style={{ textAlign: 'center' }}>Bạn không phải là Quản trị viên.</h1>
        <p style={{ textAlign: 'center' }}>Nếu là Quản trị viên vui lòng đăng nhập để tiếp tục.</p>
        <Link to="/login-admin" replace style={{ textAlign: 'center', textDecoration: 'none' }}>
          Đăng Nhập
        </Link>
      </div>
    );
  }
  return (
    <>
      <Helmet>
        <title> Quản Lý Đánh Giá </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Quản Lý Đánh Giá
          </Typography>
        </Stack>

        <Card>
          <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={reviews.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />

                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((review, index) => (
                    <TableRow hover key={review._id} tabIndex={-1} role="checkbox">
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected.includes(review.fullName)}
                          onChange={(event) => handleClick(event, review.fullName)}
                        />
                      </TableCell>

                      <TableCell component="th" scope="row" padding="none">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar alt={review.fullName} src={review.avatar} />
                          <Typography variant="subtitle2" noWrap>
                            {review.fullName}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell align="left">{review.rating}</TableCell>

                      <TableCell align="left">
                        {expandedReviews[index] || review.reviewText.length < 50 ? (
                          <>
                            {review.reviewText}
                            {review.reviewText.length > 50 && (
                              <Button onClick={() => handleExpand(index)}>Thu gọn</Button>
                            )}
                          </>
                        ) : (
                          <>
                            {`${review.reviewText.substring(0, 50)}...`}
                            <Button onClick={() => handleExpand(index)}>Xem thêm</Button>
                          </>
                        )}
                      </TableCell>

                      <MenuItem
                        sx={{ color: 'error.main' }}
                        onClick={() => {
                          setDeleteReview(review._id);
                          setOpenDialog(true);
                        }}
                      >
                        <Stack direction="column" alignItems="center">
                          <Iconify icon={'eva:trash-2-outline'} sx={{ mb: 1 }} />
                          <Typography variant="body2">Xóa</Typography>
                        </Stack>
                      </MenuItem>
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
            count={reviews.length}
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
          Delete
        </MenuItem>
      </Popover>
      <Dialog open={openDialog} onClose={handleCloseMenu}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Bạn có chắc chắn muốn xóa bình luận này không?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMenu}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
