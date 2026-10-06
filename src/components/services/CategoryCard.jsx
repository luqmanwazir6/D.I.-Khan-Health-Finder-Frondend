import { Link } from 'react-router-dom';
import {
  FaHome,
  FaCar,
  FaTv,
  FaHardHat,
  FaUserGraduate,
  FaWrench,
  FaArrowRight,
} from 'react-icons/fa';
import Card from '@/components/common/Card';
import './CategoryCard.css';

const ICON_MAP = {
  FaHome,
  FaCar,
  FaTv,
  FaHardHat,
  FaUserGraduate,
  FaWrench,
};

export default function CategoryCard({ category }) {
  const IconComponent = ICON_MAP[category.iconName] || FaWrench;

  return (
    <Card interactive className="category-card" as="article">
      <Link to={`/services?category=${category.slug}`} className="category-card-link">
        <div className="category-icon-wrapper" aria-hidden="true">
          <IconComponent />
        </div>
        <div className="category-card-info">
          <h3 className="category-card-title">{category.name}</h3>
          <p className="category-card-desc">{category.description}</p>
          <div className="category-card-footer">
            <span className="category-count">{category.services?.length || category.serviceCount} services</span>
            <span className="category-arrow" aria-hidden="true">
              <FaArrowRight />
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
