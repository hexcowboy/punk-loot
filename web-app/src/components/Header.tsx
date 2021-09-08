import { Link } from "react-router-dom";

function Header() {
  return (
    <nav>
      <Link to="/">
        <h1>Loot St</h1>
      </Link>
    </nav>
  );
}

export default Header;
