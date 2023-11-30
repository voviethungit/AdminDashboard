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
  DialogContentText,
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
  { id: 'model', label: 'Tên Danh Mục', alignRight: false },
  { id: 'imageCategory', label: 'Ảnh Danh Mục', alignRight: false },
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
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedCategoryIdToDelete, setSelectedCategoryIdToDelete] = useState(null);


  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [newCategoryData, setNewCategoryData] = useState({
    model: '',
    imageCategory: '',
  });
  const [newCategoryErrors, setNewCategoryErrors] = useState({
    model: '',
    imageCategory: '',
  });
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };
  const handleAddCategory = async () => {
    try {
      const errors = {};
      if (!newCategoryData.model || newCategoryData.model.trim() === '') {
        errors.model = 'Vui lòng nhập tên danh mục.';
      }
      if (!newCategoryData.imageCategory || newCategoryData.imageCategory.trim() === '') {
        errors.imageCategory = 'Vui lòng nhập URL Hình Ảnh.';
      }
      if (Object.keys(errors).length > 0) {
        setNewCategoryErrors(errors);
        return;
      }
  
      const accessToken = localStorage.getItem('accessToken');
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  
      const response = await axios.post('http://localhost:5000/add-category', newCategoryData, { headers });
  
      if (response.data.success) {
        window.location.reload();
        console.log('Thêm danh mục thành công:', response.data.category);
        setOpenAddDialog(false);
        setCategories([...categories, response.data.category]);
      }
    } catch (error) {
      console.error('Lỗi khi thêm danh mục:', error);
    }
  };

  
  const handleDeleteCategory = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      if (selectedCategoryIdToDelete) {
        const response = await axios.put(`http://localhost:5000/delete-category/${selectedCategoryIdToDelete}`, null, { headers });

        if (response.data.success) {
          window.location.reload();
          console.log('Đã xóa danh mục thành công');
          handleCloseConfirmDialog();
        }
      }
    } catch (error) {
      console.error('Lỗi khi xóa danh mục:', error);
     
    }
  };

  const handleDeleteButtonClick = (categoryId) => {
    setSelectedCategoryIdToDelete(categoryId); 
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };
  const handleCloseMenu = () => {
    setOpen(null);
  };
  const [editCategoryData, setEditCategoryData] = useState({
    model: '',
    imageCategory: '',
  });
  const [editCategoryErrors, setEditCategoryErrors] = useState({
    model: '',
    imageCategory: '',
  });
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedCategoryIdToEdit, setSelectedCategoryIdToEdit] = useState(null);

  const handleOpenEditDialog = (categoryId) => {
    setSelectedCategoryIdToEdit(categoryId);
    const selectedCategory = categories.find((cat) => cat._id === categoryId);
    if (selectedCategory) {
      setEditCategoryData({
        model: selectedCategory.model,
        imageCategory: selectedCategory.imageCategory,
      });
      setOpenEditDialog(true);
    }
  };

  const handleUpdateCategory = async () => {
    try {
      const errors = {};
      if (!editCategoryData.model || editCategoryData.model.trim() === '') {
        errors.model = 'Vui lòng nhập tên danh mục.';
      }
      if (!editCategoryData.imageCategory || editCategoryData.imageCategory.trim() === '') {
        errors.imageCategory = 'Vui lòng nhập URL Hình Ảnh.';
      }
      if (Object.keys(errors).length > 0) {
        setEditCategoryErrors(errors);
        return;
      }

      const accessToken = localStorage.getItem('accessToken');
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

      const response = await axios.put(
        `http://localhost:5000/edit-category/${selectedCategoryIdToEdit}`,
        editCategoryData,
        { headers }
      );

      if (response.data.success) {
        console.log('Cập nhật danh mục thành công:', response.data.category);
        setOpenEditDialog(false);
        window.location.reload();
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật danh mục:', error);
    }
  };
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = categories.map((category) => category.id);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - categories.length) : 0;

  const filteredCategories = applySortFilter(categories, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredCategories.length && !!filterName;

  useEffect(() => {
    axios
      .get('http://localhost:5000/all-category')
      .then((response) => {
        const categoriesData = response.data.categories;
        setCategories(categoriesData);
      })
      .catch((error) => {
        console.error('Lỗi:', error);
      });
  }, []);

  return (
    <div>
      <Helmet>
        <title> Quản Lý Danh Mục </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Quản Lý Danh Mục
          </Typography>
          <Button variant="contained" color="primary" onClick={handleOpenAddDialog}>
            Thêm Danh Mục
          </Button>
        </Stack>
        <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
  <DialogTitle>Thêm Danh Mục</DialogTitle>
  <DialogContent>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Tên Danh Mục"
          name="model"
          value={newCategoryData.model}
          onChange={(e) => setNewCategoryData({ ...newCategoryData, model: e.target.value })}
          error={!!newCategoryErrors.model}
          helperText={newCategoryErrors.model}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="URL Hình Ảnh"
          name="imageCategory"
          value={newCategoryData.imageCategory}
          onChange={(e) => setNewCategoryData({ ...newCategoryData, imageCategory: e.target.value })}
          error={!!newCategoryErrors.imageCategory}
          helperText={newCategoryErrors.imageCategory}
        />
      </Grid>
    </Grid>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenAddDialog(false)}>Hủy</Button>
    <Button onClick={handleAddCategory} color="primary">
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
                  rowCount={categories.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((category) => (
                    <TableRow hover key={category._id} tabIndex={-1} role="checkbox">
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected.includes(category.model)}
                          onChange={(event) => handleClick(event, category.model)}
                        />
                      </TableCell>

                      <TableCell align="left">{category.model}</TableCell>
                      <TableCell align="left">
                        <img
                          src={category.imageCategory}
                          alt={category.model}
                          style={{ maxWidth: '100px', maxHeight: '100px' }}
                        />
                      </TableCell>
                      <TableCell component="th" scope="row" padding="none">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <MenuItem onClick={() => handleOpenEditDialog(category._id)}>
                            <Stack direction="column" alignItems="center">
                              <Iconify icon={'eva:edit-fill'} sx={{ mb: 1 }} />
                              <Typography variant="body2">
                                Chỉnh sửa
                              </Typography>
                            </Stack>
                          </MenuItem>

                          <MenuItem sx={{ color: 'error.main' }} variant="subtitle2"  onClick={() => handleDeleteButtonClick(category._id)}>
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
            count={categories.length}
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
        <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
        <DialogContent>
          <br />
          {selectedCategoryIdToEdit !== null && (

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên Danh Mục"
                  name="model"
                  value={editCategoryData.model}
                  onChange={(e) => setEditCategoryData({ ...editCategoryData, model: e.target.value })}
                  error={!!editCategoryErrors.model}
                  helperText={editCategoryErrors.model}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL Hình Ảnh"
                  name="imageCategory"
                  value={editCategoryData.imageCategory}
                  onChange={(e) => setEditCategoryData({ ...editCategoryData, imageCategory: e.target.value })}
                  error={!!editCategoryErrors.imageCategory}
                  helperText={editCategoryErrors.imageCategory}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Hủy</Button>
          <Button onClick={handleUpdateCategory} color="primary">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa danh mục này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Hủy</Button>
          <Button onClick={handleDeleteCategory} color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
