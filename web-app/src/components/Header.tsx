import { Link } from "react-router-dom";

function Header() {
  return (
    <nav>
      <Link to="/">
        <h1>
          Loot St<sup>BETA</sup>
        </h1>
      </Link>
      <Link to="/about" className="nes-btn" href="#">
        ?
      </Link>
    </nav>
  );
}

export default Header;
