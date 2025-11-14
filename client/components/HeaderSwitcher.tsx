import { useEffect, useState } from "react";
import Header from "./Header";
import UnloggedHeader from "./UnloggedHeader";

export default function HeaderSwitcher() {
  const [isLogged, setIsLogged] = useState<boolean>(() => !!localStorage.getItem("token"));

  useEffect(() => {
    const onStorage = () => setIsLogged(!!localStorage.getItem("token"));
    const onAuthChanged = () => setIsLogged(!!localStorage.getItem("token"));

    window.addEventListener("storage", onStorage);
    window.addEventListener("authChanged", onAuthChanged as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("authChanged", onAuthChanged as EventListener);
    };
  }, []);

  return isLogged ? <Header /> : <UnloggedHeader />;
}
