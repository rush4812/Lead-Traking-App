import React from 'react';

const StatusBadge = ({ status }) => {
  const normalizedStatus = (status || 'new').toLowerCase();

  return (
    <span className={`status-badge ${normalizedStatus}`}>
      <span className="status-dot"></span>
      {normalizedStatus}
    </span>
  );
};

export default StatusBadge;
