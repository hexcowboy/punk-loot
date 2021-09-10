import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";

function TopButton() {
  const history = useHistory();
  if (history.location.pathname === "/about") {
    return (
      <button onClick={() => history.goBack()} className="nes-btn">
        #
      </button>
    );
  } else {
    return (
      <Link to="/about" className="nes-btn">
        ?
      </Link>
    );
  }
}

function Header() {
  return (
    <nav>
      <Link to="/">
        <h1>
          Loot St<sup>BETA</sup>
        </h1>
      </Link>
      <TopButton />
    </nav>
  );
}

export default Header;
