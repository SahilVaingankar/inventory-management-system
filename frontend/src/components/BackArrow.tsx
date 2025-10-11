import { BiArrowBack } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

interface BackArrowProps {
  left: number;
}

const BackArrow = ({ left }: BackArrowProps) => {
  const navigate = useNavigate();
  return (
    <BiArrowBack
      className="hidden sm:block absolute top-5 h-8 w-8 rounded-full bg-white/50 cursor-pointer hover:bg-gray-200"
      onClick={() => navigate(-1)}
      style={{ left: `${left}px` }}
    />
  );
};

export default BackArrow;
