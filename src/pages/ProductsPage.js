import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { filter } from 'lodash';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './css/productspage.css';
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
} from '@mui/material';
// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead } from '../sections/@dashboard/user';

const TABLE_HEAD = [
  { id: 'title', label: 'Tên xe', alignRight: false },
  { id: 'categoryID', label: 'Danh Mục', alignRight: false },
  { id: 'location', label: 'Địa chỉ', alignRight: false },
  { id: 'description', label: 'Mô tả', alignRight: false },
  { id: 'price', label: 'Giá', alignRight: false },
  { id: 'chair', label: 'Số ghế', alignRight: false },
  { id: 'star', label: 'Đánh giá', alignRight: false },
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

export default function ProductsPage() {
  const [open, setOpen] = useState(null);
  const [cars, setCars] = useState([]);
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');
  const [deleteCarId, setDeleteCarId] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [editCar, setEditCar] = useState(null);
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
      const newSelecteds = cars.map((car) => car.title);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - cars.length) : 0;

  const filteredCars = applySortFilter(cars, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredCars.length && !!filterName;

  const [formErrors, setFormErrors] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    imagePath: '',
    image1: '',
    image2: '',
    categoryID: '',
    image3: '',
    fuel: '',
    chair: '',
  });

  const [addCarErrors, setAddCarErrors] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    imagePath: '',
    image1: '',
    image2: '',
    categoryID: '',
    image3: '',
    fuel: '',
    chair: '',
  });

  const [carData, setCarData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    imagePath: '',
    image1: '',
    image2: '',
    categoryID: '',
    image3: '',
    fuel: '',
    chair: '',
  });

  const [updatedData, setUpdatedDate] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    imagePath: '',
    image1: '',
    image2: '',
    categoryID: '',
    image3: '',
    fuel: '',
    chair: '',
  });

  const handleCarInputChange = (event) => {
    const { name, value } = event.target;
    setCarData((prevCarData) => ({
      ...prevCarData,
      [name]: value,
    }));
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditCar((prevEditCar) => ({
      ...prevEditCar,
      [name]: value,
    }));

    // Validation
    const errors = { ...formErrors };
    switch (name) {
      case 'title':
        errors.title = value.trim() === '' ? 'Vui lòng nhập tên xe.' : '';
        break;
      case 'categoryID':
        errors.categoryID = value.trim() === '' ? 'Vui lòng nhập danh mục.' : '';
        break;
      case 'description':
        errors.description = value.trim() === '' ? 'Vui lòng nhập mô tả.' : '';
        break;
      case 'price':
        errors.price = value.trim() === '' ? 'Giá tiền phải là số.' : '';
        break;
      case 'location':
        errors.location = value.trim() === '' ? 'Vui lòng nhập địa chỉ.' : '';
        break;
      case 'imagePath':
        errors.imagePath = value.trim() === '' ? 'Vui lòng nhập URL hình ảnh chính.' : '';
        break;
      case 'image1':
        errors.image1 = value.trim() === '' ? 'Vui lòng nhập URL hình ảnh phụ 1.' : '';
        break;
      case 'image2':
        errors.image2 = value.trim() === '' ? 'Vui lòng nhập URL hình ảnh phụ 2.' : '';
        break;
      case 'image3':
        errors.image3 = value.trim() === '' ? 'Vui lòng nhập URL hình ảnh phụ 3.' : '';
        break;
      case 'fuel':
        errors.fuel = value.trim() === '' ? 'Vui lòng nhập nguyên liệu.' : '';
        break;
      case 'chair':
        errors.chair = value.trim() === '' ? 'Số ghế phải là số.' : '';
        break;
      default:
        break;
    }

    setFormErrors(errors);
  };

  const handleConfirmDelete = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

      const response = await axios.put(`http://localhost:5000/delete-car/${deleteCarId}`, null, {
        headers,
      });

      if (response.data.success) {
        console.log('Xóa xe thành công:', response.data.car);
        setDeleteCarId(null);
        window.location.reload();
      }
    } catch (error) {
      console.error('Lỗi khi xóa xe:', error);
    }
  };

  // HANDLE EDIT XE
  const handleEditCar = async (carId) => {
    const isError = Object.values(formErrors).some((error) => error !== '');
    if (isError) {
      console.error('Vui lòng nhập đúng thông tin xe.');
      return;
    }
    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

      const response = await axios.put(`http://localhost:5000/update-car/${carId}`, editCar, {
        headers,
      });

      if (response.data.success) {
        setOpenEditDialog(false);
        console.log('Thông tin xe đã được cập nhật:', response.data.car);
        window.location.reload();
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin xe:', error);
    }
  };

  // HANDLE UPLOAD XE
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleAddCar = async () => {
    try {
      const errors = {};
      if (!carData.title || carData.title.trim() === '') {
        errors.title = 'Vui lòng nhập tên xe.';
      }

      if (!carData.location || carData.location.trim() === '') {
        errors.location = 'Vui lòng nhập địa chỉ.';
      }

      if (!carData.description || carData.description.trim() === '') {
        errors.description = 'Vui lòng nhập mô tả.';
      }

      if (!carData.price || carData.price.trim() === '') {
        errors.price = 'Vui lòng nhập giá tiền.';
      }
      if (!carData.categoryID || carData.categoryID.trim() === '') {
        errors.categoryID = 'Vui lòng nhập ID của danh mục';
      }
      if (!carData.chair || carData.chair.trim() === '') {
        errors.chair = 'Vui lòng nhập số ghế.';
      }
      if (!carData.imagePath || carData.imagePath.trim() === '') {
        errors.imagePath = 'Vui lòng thêm hình ảnh.';
      }
      if (!carData.image1 || carData.image1.trim() === '') {
        errors.image1 = 'Vui lòng thêm hình ảnh.';
      }
      if (!carData.image2 || carData.image2.trim() === '') {
        errors.image2 = 'Vui lòng thêm hình ảnh.';
      }
      if (!carData.image3 || carData.image3.trim() === '') {
        errors.image3 = 'Vui lòng thêm hình ảnh.';
      }
      if (!carData.fuel || carData.fuel.trim() === '') {
        errors.fuel = 'Vui lòng nhập nguyên liệu.';
      }
      if (Object.keys(errors).length > 0) {
        setAddCarErrors(errors);
        return;
      }
      const accessToken = localStorage.getItem('accessToken');
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

      const response = await axios.post('http://localhost:5000/upload-car', carData, {
        headers,
      });

      if (response.data.success) {
        window.location.reload();
        console.log('Thêm xe thành công:', response.data.car);
        handleCloseAddDialog();
      }
    } catch (error) {
      console.error('Lỗi khi thêm xe:', error);
    }
  };

  useEffect(() => {
    axios
      .get('http://localhost:5000/get-car')
      .then((response) => {
        const carsData = response.data.cars;
        setCars(carsData);
      })
      .catch((error) => {
        console.error('Lỗi:', error);
      });
  }, []);

  return (
    <>
      <Helmet>
        <title> Quản Lý Xe Thuê </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Quản Lý Xe Thuê
          </Typography>
          <Button variant="contained" color="primary" onClick={handleOpenAddDialog}>
            Thêm Xe
          </Button>
        </Stack>
        <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
          <DialogTitle>Thêm Xe</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên Xe"
                  name="title"
                  value={carData.title}
                  onChange={handleCarInputChange}
                  error={!!addCarErrors.title}
                  helperText={addCarErrors.title}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Danh Mục"
                  name="categoryID"
                  value={carData.categoryID}
                  onChange={handleCarInputChange}
                  error={!!addCarErrors.categoryID}
                  helperText={addCarErrors.categoryID}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô Tả"
                  name="description"
                  value={carData.description}
                  onChange={handleCarInputChange}
                  error={!!addCarErrors.description}
                  helperText={addCarErrors.description}
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  type="file"
                  name="imagePath"
                  accept="image/*"
                  value={carData.imagePath}
                  onChange={handleCarInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  type="file"
                  name="image1"
                  accept="image/*"
                  value={carData.image1}
                  onChange={handleCarInputChange}
                />
                
              </Grid>
              <Grid item xs={12}>
                <input
                  type="file"
                  name="image2"
                  accept="image/*"
                  value={carData.image2}
                  onChange={handleCarInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  type="file"
                  name="image3"
                  accept="image/*"
                  value={carData.image3}
                  onChange={handleCarInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa Chỉ Nhận Xe"
                  name="location"
                  value={carData.location}
                  onChange={handleCarInputChange}
                  error={!!addCarErrors.location}
                  helperText={addCarErrors.location}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Giá Xe /Ngày"
                  name="price"
                  value={carData.price}
                  onChange={handleCarInputChange}
                  error={!!addCarErrors.price}
                  helperText={addCarErrors.price}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Số Ghế"
                  name="chair"
                  value={carData.chair}
                  onChange={handleCarInputChange}
                  error={!!addCarErrors.chair}
                  helperText={addCarErrors.chair}
                />
              </Grid>
              <Grid item xs={12}>
              <InputLabel id="date-label">Nhiên Liệu Sử Dụng
              </InputLabel>
                <Select
                  fullWidth
                  name="fuel"
                  value={carData.fuel}
                  onChange={handleCarInputChange}
                  error={!!addCarErrors.fuel}
                  helperText={addCarErrors.fuel}
                >
<MenuItem value="Xăng">Xăng</MenuItem>
                  <MenuItem value="waiting">Điện</MenuItem>
                  </Select>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddDialog}>Hủy</Button>
            <Button onClick={handleAddCar} color="primary">
              Thêm
            </Button>
          </DialogActions>
        </Dialog>
        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={cars.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredCars.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((car) => (
                    <TableRow hover key={car._id} tabIndex={-1} role="checkbox">
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected.includes(car.fullName)}
                          onChange={(event) => handleClick(event, car.fullName)}
                        />
                      </TableCell>

                      <TableCell component="th" scope="row" padding="none">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar alt={car.title} src={car.imagePath} />
                          <Typography variant="subtitle2" noWrap>
                            {car.title}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="left">{car.categoryID}</TableCell>
                      <TableCell align="left">{car.location}</TableCell>
                      <TableCell align="left">{car.description}</TableCell>
                      <TableCell align="left">{car.price}</TableCell>
                      <TableCell align="left">{car.chair}</TableCell>
                      <TableCell component="th" scope="row" padding="none">
                        <Stack direction="row" alignItems="right" spacing={2}>
                          <Typography> {car.star} </Typography>
                          <Typography variant="subtitle2" noWrap>
                            {'sao'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell component="th" scope="row" padding="none">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <MenuItem
                            onClick={() => {
                              setEditCar(car);
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
                            onClick={() => {
                              setDeleteCarId(car._id);
                              setOpen(true);
                            }}
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
            count={cars.length}
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
        <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
        <br />
        <DialogContent>
          {editCar && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên Xe"
                  name="title"
                  value={editCar.title}
                  onChange={handleInputChange}
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Danh Mục"
                  name="categoryID"
                  value={editCar.categoryID}
                  onChange={handleInputChange}
                  error={!!formErrors.categoryID}
                  helperText={formErrors.categoryID}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ảnh Xe"
                  name="imagePath"
                  value={editCar.imagePath}
                  onChange={handleInputChange}
                  error={!!formErrors.imagePath}
                  helperText={formErrors.imagePath}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa Chỉ Nhận Xe"
                  name="location"
                  value={editCar.location}
                  onChange={handleInputChange}
                  error={!!formErrors.location}
                  helperText={formErrors.location}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Giá Xe/Ngày"
                  name="price"
                  value={editCar.price}
                  onChange={handleInputChange}
                  error={!!formErrors.price}
                  helperText={formErrors.price}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô Tả Xe"
                  name="description"
                  value={editCar.description}
                  onChange={handleInputChange}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Số Ghế"
                  name="chair"
                  value={editCar.chair}
                  onChange={handleInputChange}
                  error={!!formErrors.chair}
                  helperText={formErrors.chair}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ảnh Phụ 1"
                  name="image1"
                  value={editCar.image1}
                  onChange={handleInputChange}
                  error={!!formErrors.image1}
                  helperText={formErrors.image1}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ảnh Phụ 2"
                  name="image2"
                  value={editCar.image2}
                  onChange={handleInputChange}
                  error={!!formErrors.image2}
                  helperText={formErrors.image2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ảnh Phụ 3"
                  name="image3"
                  value={editCar.image3}
                  onChange={handleInputChange}
                  error={!!formErrors.image3}
                  helperText={formErrors.image3}
                />
              </Grid>
              <Grid item xs={12}>
                <Button onClick={() => handleEditCar(editCar._id, editCar)} color="primary">
                  Lưu thay đổi
                </Button>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(open)} onClose={handleCloseMenu}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Bạn có chắc chắn muốn xóa xe này không?</Typography>
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
