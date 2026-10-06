import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import './NotFoundPage.css';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');

  return (
    <section className="not-found container" aria-labelledby="not-found-title">
      <p className="not-found-code" aria-hidden="true">
        404
      </p>
      <h1 id="not-found-title" className="not-found-title">
        Page not found
      </h1>
      <p className="not-found-message">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved. Try one of these instead:
      </p>
      <ul className="not-found-links" role="list">
        <li>
          <Link to={ROUTES.HOME}>Homepage</Link>
        </li>
        <li>
          <Link to={ROUTES.SERVICES}>Browse services</Link>
        </li>
        <li>
          <Link to={ROUTES.PROVIDERS}>Find professionals</Link>
        </li>
      </ul>
    </section>
  );
}
