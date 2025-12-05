import { Link, useLocation } from 'react-router-dom';
import { Button } from '@indxsearch/systm';
import { ArrowLeft } from '@indxsearch/pixl';
import styles from './Nav.module.css';

export default function Nav() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  if (isHome) return null;

  return (
    <nav className={styles.nav}>
      <Link to="/">
        <Button variant="ghost" iconLeft={<ArrowLeft />}>
          Back to Components
        </Button>
      </Link>
    </nav>
  );
}
