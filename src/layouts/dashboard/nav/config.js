// component
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const navConfig = [
  {
    title: 'Thống kê',
    path: '/dashboard/app',
    icon: icon('ic_analytics'),
  },
  {
    title: 'Người Dùng',
    path: '/dashboard/user',
    icon: icon('ic_user'),
  },
  {
    title: 'Xe Thuê',
    path: '/dashboard/products',
    icon: icon('ic_cart'),
  },
  {
    title: 'Bài Viết',
    path: '/dashboard/blog',
    icon: icon('ic_blog'),
  },
  {
    title: 'Danh Mục',
    path: '/dashboard/category',
    icon: icon('ic_blog'),
  },
  {
    title: 'Hóa Đơn',
    path: '/dashboard/bill',
    icon: icon('ic_blog'),
  }
];

export default navConfig;
