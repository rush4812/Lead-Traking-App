import React from 'react';
import { Users, UserPlus } from 'lucide-react';

const Navbar = ({ onOpenCreateModal, onGoHome }) => {
  return (
    <header className="navbar">
      <div className="nav-brand" onClick={onGoHome}>
        <div className="brand-icon">
          <Users size={22} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="brand-title">LeadFlow</span>
          <span className="brand-badge">MERN Practical</span>
        </div>
      </div>

      <button className="btn btn-primary" onClick={onOpenCreateModal} id="btn-add-lead">
        <UserPlus size={16} />
        <span>Add Lead</span>
      </button>
    </header>
  );
};

export default Navbar;
