import { NavLink } from "react-router-dom";
import { assets } from "../../assets/assets";

const Sidebar = () => {
  const sidebarLinks = [
    { name: "Dashboard", path: "/owner", icon: assets.dashboardIcon },
    { name: "Add Dining", path: "/owner/add-dining", icon: assets.addIcon },
    { name: "Manage", path: "/owner/manage", icon: assets.listIcon },
  ];

  return (
    <div className="w-16 md:w-64 h-full border-r border-gray-200 bg-white overflow-y-auto transition-all duration-300">
      <nav className="flex flex-col pt-4">
        {sidebarLinks.map((item, index) => (
          <NavLink
            to={item.path}
            key={index}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 px-4 md:px-6 transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-600 border-r-4 md:border-r-[6px] border-blue-600"
                  : "hover:bg-gray-100 text-gray-700"
              }`
            }
          >
            <img src={item.icon} alt={item.name} className="h-5 w-5" />
            <span className="hidden md:block">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
