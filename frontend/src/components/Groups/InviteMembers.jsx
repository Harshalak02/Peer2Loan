import React from 'react';

const InviteMembers = ({ groupId, groupName }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6 mt-6">
      <h2 className="text-xl font-semibold text-blue-800 mb-2">Invite Members to {groupName}</h2>
      <p className="text-gray-600 mb-4">Share the group access code or send invitations to add members.</p>
      {/* You can add a form or buttons here for sending invitations */}
      <div className="text-sm text-blue-600">Group ID: {groupId}</div>
    </div>
  );
};

export default InviteMembers;
