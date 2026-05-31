// Authorized users list for NPD application
// Only these users can login to the system

export interface AuthorizedUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'engineer' | 'user';
  department: string;
  isActive: boolean;
}

export const authorizedUsers: AuthorizedUser[] = [
  {
    id: '1',
    email: 'kartikvimal7801@gmail.com',
    password: 'kartik1234',
    firstName: 'Kartik',
    lastName: 'Vimal',
    role: 'admin',
    department: 'Product Development',
    isActive: true,
  },
  // Add more users here as needed
  {
    id: '2',
    email: 'demo@havells.com',
    password: 'demo123',
    firstName: 'Demo',
    lastName: 'User',
    role: 'user',
    department: 'Engineering',
    isActive: true,
  },
];

// Helper function to find user by email
export const findUserByEmail = (email: string): AuthorizedUser | undefined => {
  return authorizedUsers.find(user => 
    user.email.toLowerCase() === email.toLowerCase() && user.isActive
  );
};

// Helper function to validate user credentials
export const validateUserCredentials = (email: string, password: string): AuthorizedUser | null => {
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
};

// Helper function to get user by ID
export const getUserById = (id: string): AuthorizedUser | undefined => {
  return authorizedUsers.find(user => user.id === id && user.isActive);
};