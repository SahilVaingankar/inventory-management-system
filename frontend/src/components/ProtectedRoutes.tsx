import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "../stores/store";

const ProtectedRoutes = ({ type }: any) => {
  const { login } = useStore();
  if (type === "login" && login) {
    return <Navigate to={"/"} replace />;
  }
  if (type === "guest" && !login) {
    return <Navigate to={"/login"} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoutes;
