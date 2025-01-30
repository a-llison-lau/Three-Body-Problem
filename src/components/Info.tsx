// Include navigation instructions, share button, github
import { IoInformationCircleOutline } from "react-icons/io5";

function Info() {
  return (
    <div className="absolute top-1 right-1 text-xl cursor-pointer z-10">
      <IoInformationCircleOutline color="gray" />
    </div>
  );
}

export default Info;
