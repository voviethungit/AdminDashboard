import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import './css/blogs.css';
import { FaX } from 'react-icons/fa6';
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
  DialogContentText,
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
  { id: 'title', label: 'Tiêu đề', alignRight: false },
  { id: 'content', label: 'Mô tả', alignRight: false },
  { id: 'status', label: 'Trạng Thái', alignRight: false },
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

export default function BlogsPage() {
  const [open, setOpen] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(0);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedBlogIdToDelete, setSelectedBlogIdToDelete] = useState(null);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');
  const [editBlogData, setEditBlogData] = useState({
    title: '',
    content: '',
    imageBlog: '',
  });
  const [editBlogErrors, setEditBlogErrors] = useState({
    title: '',
    content: '',
    imageBlog: '',
  });
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedBlogIdToEdit, setSelectedBlogIdToEdit] = useState(null);
  
  // Xử lý mở form chỉnh sửa thông tin blog
  const handleOpenEditDialog = (blogId) => {
    setSelectedBlogIdToEdit(blogId);
    const selectedBlog = blogs.find((blog) => blog._id === blogId);
    if (selectedBlog) {
      setEditBlogData({
        title: selectedBlog.title,
        content: selectedBlog.content,
        imageBlog: selectedBlog.imageBlog,
      });
      setOpenEditDialog(true);
    }
  };
  const handleUpdateBlog = async () => {
    try {
      const errors = {};
      if (!editBlogData.title || editBlogData.title.trim() === '') {
        errors.title = 'Vui lòng nhập tiêu đề.';
      }
      if (!editBlogData.content || editBlogData.content.trim() === '') {
        errors.content = 'Vui lòng nhập mô tả.';
      }
      if (!editBlogData.imageBlog || editBlogData.imageBlog.trim() === '') {
        errors.imageBlog = 'Vui lòng nhập URL hình ảnh.';
      }
      if (Object.keys(errors).length > 0) {
        setEditBlogErrors(errors);
        return;
      }
  
      const accessToken = localStorage.getItem('accessToken');
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  
      const response = await axios.put(
        `http://localhost:5000/update-blog/${selectedBlogIdToEdit}`,
        editBlogData,
        { headers }
      );
  
      if (response.data.success) {
        console.log('Cập nhật bài viết thành công:', response.data.blog);
        setOpenEditDialog(false);
        window.location.reload(); // Tải lại trang sau khi cập nhật
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật bài viết:', error);
    }
  };
  
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [blogData, setBlogData] = useState({
    title: '',
    content: '',
    imageBlog: '',
  });
  const [addBlogErrors, setAddBlogErrors] = useState({
    title: '',
    content: '',
    imageBlog: '',
  })
  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleDeleteButtonClick = (blogId) => {
    setSelectedBlogIdToDelete(blogId);
    setOpenConfirmDialog(true);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = blogs.map((blog) => blog.title);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - blogs.length) : 0;

  const filteredBlogs = applySortFilter(blogs, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredBlogs.length && !!filterName;

  const handleBlogInputChange = (event) => {
    const { name, value } = event.target;
    setBlogData((prevBlogData) => ({
      ...prevBlogData,
      [name]: value,
    }));
  };

  const [openAddDialog, setOpenAddDialog] = useState(false);

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleAddBlog = async () => {
    try {
      const errors = {};
      if (!blogData.title || blogData.title.trim() === '') {
        errors.title = 'Vui lòng nhập tiêu đề.';
      }

      if (!blogData.content || blogData.content.trim() === '') {
        errors.content = 'Vui lòng nhập thông tin bài viết.';
      }

      if (!blogData.imageBlog || blogData.imageBlog.trim() === '') {
        errors.imageBlog = 'Vui lòng nhập URL Hình Ảnh.';
      }
      if (Object.keys(errors).length > 0) {
        setAddBlogErrors(errors);
        return;
      }
      const accessToken = localStorage.getItem('accessToken');
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

      const response = await axios.post('http://localhost:5000/upload-blog', blogData, {
        headers,
      });

      if (response.data.success) {
        console.log('Thêm bài viết thành công:', response.data.blog);
        handleCloseAddDialog();
      }
    } catch (error) {
      console.error('Lỗi khi thêm bài viết:', error);
    }
  };

  // HANDLE EDIT BLOG
 

  const deleteBlogById = async (blogId) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      const response = await axios.put(`http://localhost:5000/delete-blog/${blogId}`, null, { headers });
      window.location.reload();
      return response.data;
    } catch (error) {
      return { success: false, message: 'Lỗi từ phía client' };
    }
  };

  useEffect(() => {
    axios
      .get('http://localhost:5000/get-blog')
      .then((response) => {
        const blogsData = response.data.blogs;
        setBlogs(blogsData);
      })
      .catch((error) => {
        console.error('Lỗi:', error);
      });
  }, []);

  return (
    <div>
      <Helmet>
        <title> Quản Lý Bài Viết </title>
      </Helmet>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Quản Lý Bài Viết
          </Typography>
          <Button variant="contained" color="primary" onClick={handleOpenAddDialog}>
            Thêm Bài Viết
          </Button>
        </Stack>
        <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
          <DialogTitle>Thêm Bài Viết</DialogTitle>
          <DialogContent>
          <Grid container spacing={2}>
              <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tiêu Đề Bài Viết"
              name="title"
              value={blogData.title}
              onChange={handleBlogInputChange}
              error={!!addBlogErrors.title}
              helperText={addBlogErrors.title}
            />
             </Grid>
             <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mô Tả Bài Viết"
              name="content"
              value={blogData.content}
              onChange={handleBlogInputChange}
              error={!!addBlogErrors.content}
              helperText={addBlogErrors.content}
            />
            </Grid>
            <Grid item xs={12}>
            <TextField
              fullWidth
              label="Ảnh Bài Viết"
              name="imageBlog"
              value={blogData.imageBlog}
              onChange={handleBlogInputChange}
              error={!!addBlogErrors.imageBlog}
              helperText={addBlogErrors.imageBlog}
            />
            </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddDialog}>Hủy</Button>
            <Button onClick={handleAddBlog} color="primary">
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
                  rowCount={blogs.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredBlogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((blog) => (
                    <TableRow hover key={blog._id} tabIndex={-1} role="checkbox">
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected.includes(blog.title)}
                          onChange={(event) => handleClick(event, blog.title)}
                        />
                      </TableCell>
                      <TableCell component="th" scope="row" padding="none">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar alt={blog.title} src={blog.imageBlog} />
                          <Typography variant="subtitle2" noWrap>
                            {blog.title}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="left">{blog.content}</TableCell>
                      <TableCell align="left">
                        <Label color={(blog.status === 'deleted' && 'error') || 'success'}>
                          {sentenceCase(blog.status)}
                        </Label>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="right" spacing={2}>
                          <MenuItem onClick={() => handleOpenEditDialog(blog._id)}> 
                            <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
                            Chỉnh sửa
                          </MenuItem>
                          <MenuItem sx={{ color: 'error.main' }} onClick={() => handleDeleteButtonClick(blog._id)}>
                            <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
                            Xóa
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
            count={blogs.length}
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
  <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
  <DialogContent>
    <br/>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Tiêu Đề Bài Viết"
          name="title"
          value={editBlogData.title}
          onChange={(e) =>
            setEditBlogData({ ...editBlogData, title: e.target.value })
          }
          error={!!editBlogErrors.title}
          helperText={editBlogErrors.title}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Mô Tả Bài Viết"
          name="content"
          value={editBlogData.content}
          onChange={(e) =>
            setEditBlogData({ ...editBlogData, content: e.target.value })
          }
          error={!!editBlogErrors.content}
          helperText={editBlogErrors.content}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="URL Hình Ảnh Bài Viết"
          name="imageBlog"
          value={editBlogData.imageBlog}
          onChange={(e) =>
            setEditBlogData({ ...editBlogData, imageBlog: e.target.value })
          }
          error={!!editBlogErrors.imageBlog}
          helperText={editBlogErrors.imageBlog}
        />
      </Grid>
    </Grid>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenEditDialog(false)}>Hủy</Button>
    <Button onClick={handleUpdateBlog} color="primary">
      Lưu
    </Button>
  </DialogActions>
</Dialog>
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Xác nhận xóa bài viết?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bạn có chắc chắn muốn xóa bài viết này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
            Hủy
          </Button>
          <Button
            onClick={() => {
              deleteBlogById(selectedBlogIdToDelete);
              setOpenConfirmDialog(false);
            }}
            color="error"
            autoFocus
          >
            Xác nhận xóa
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
