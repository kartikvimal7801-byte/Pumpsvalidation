# NPD Application - Login Credentials

**CONFIDENTIAL - FOR DEVELOPMENT USE ONLY**

## Available Login Accounts

### Admin Account
- **Email**: kartikvimal7801@gmail.com
- **Password**: kartik1234
- **Role**: Admin
- **Department**: Product Development

### Demo Account
- **Email**: demo@havells.com
- **Password**: demo123
- **Role**: User
- **Department**: Engineering

## Notes
- These credentials are for development and testing purposes only
- Do not share these credentials publicly
- For production deployment, implement proper user management system
- Add new users by editing `src/data/authorizedUsers.ts`

## Adding New Users
To add new users, edit the `authorizedUsers` array in `src/data/authorizedUsers.ts`:

```typescript
{
  id: '3',
  email: 'newuser@havells.com',
  password: 'securepassword',
  firstName: 'First',
  lastName: 'Last',
  role: 'engineer', // admin | manager | engineer | user
  department: 'Department Name',
  isActive: true,
}
```