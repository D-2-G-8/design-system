import React from 'react';
import styles from './UserSharing.module.css';

export interface UserSharingProps extends React.HTMLAttributes<HTMLDivElement> {
  users?: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    permission: string;
  }>;
  onInvite?: (email: string, role: string) => void;
  onRemoveUser?: (userId: string) => void;
  onPermissionChange?: (userId: string, permission: string) => void;
}

export function UserSharing({
  users = [],
  onInvite,
  onRemoveUser,
  onPermissionChange,
  className,
  ...props
}: UserSharingProps) {
  const [email, setEmail] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState('viewer');

  const handleInvite = () => {
    if (email && onInvite) {
      onInvite(email, selectedRole);
      setEmail('');
      setSelectedRole('viewer');
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`} {...props}>
      <div className={styles.header}>
        <h2 className={styles.title}>Share with others</h2>
        <p className={styles.subtitle}>Invite people to collaborate</p>
      </div>

      <div className={styles.inviteSection}>
        <div className={styles.inputWrapper}>
          <input
            type="email"
            className={styles.emailInput}
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            className={styles.roleSelector}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className={styles.actionButtons}>
          <button className={styles.shareButton} onClick={handleInvite}>
            Invite
          </button>
        </div>
      </div>

      <div className={styles.userList}>
        {users.map((user) => (
          <div key={user.id} className={styles.userItem}>
            <div className={styles.userAvatar}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className={styles.icon} />
              ) : (
                <span className={styles.icon}>{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userEmail}>{user.email}</div>
            </div>
            <select
              className={styles.permissionBadge}
              value={user.permission}
              onChange={(e) => onPermissionChange?.(user.id, e.target.value)}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <button
              className={styles.removeButton}
              onClick={() => onRemoveUser?.(user.id)}
              aria-label="Remove user"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
