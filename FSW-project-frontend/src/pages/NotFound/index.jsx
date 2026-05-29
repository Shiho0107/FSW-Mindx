import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="notFoundPage">
      <div className="notFoundContent">
        <h1 className="errorCode">404</h1>
        <h2 className="errorTitle">Oops! Page Not Found</h2>
        <p className="errorDesc">
          We can&apos;t seem to find the page you&apos;re looking for. It might have been removed or the URL is incorrect.
        </p>
        <Link to="/">
          <Button variant="primary" style={{ padding: "0 32px" }}>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
