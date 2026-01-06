import { signup, login } from '../src/services/auth.service.js';

// Mock prisma client used inside auth.service
jest.unstable_mockModule('../src/utils/prismaClient.js', () => {
  const userStore = new Map();
  return {
    prisma: {
      user: {
        findUnique: jest.fn(({ where: { email } }) => {
          return Promise.resolve(userStore.get(email) || null);
        }),
        create: jest.fn(({ data }) => {
          userStore.set(data.email, data);
          return Promise.resolve({ ...data, id: userStore.size });
        }),
      },
    },
  };
});

// Dynamically import after mocks are set up
const { prisma } = await import('../src/utils/prismaClient.js');

describe('auth.service', () => {
  beforeEach(() => {
    // reset mocks and store between tests
    jest.clearAllMocks();
    // Clear the internal map used by the mock by reassigning its behavior
    prisma.user.findUnique.mockImplementation(({ where: { email } }) => Promise.resolve(null));
    prisma.user.create.mockImplementation(({ data }) => Promise.resolve({ ...data, id: 1 }));
  });

  describe('signup', () => {
    test('creates a new user when email is not taken', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);
      prisma.user.create.mockResolvedValueOnce({ id: 1, email: 'a@b.com', username: 'u', password: 'p' });

      const user = await signup('a@b.com', 'u', 'p');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
      expect(prisma.user.create).toHaveBeenCalledWith({ data: { username: 'u', password: 'p', email: 'a@b.com' } });
      expect(user).toEqual({ id: 1, email: 'a@b.com', username: 'u', password: 'p' });
    });

    test('throws when user already exists', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 1, email: 'a@b.com' });

      await expect(signup('a@b.com', 'u', 'p')).rejects.toThrow('User already exists');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    test('propagates prisma errors during create', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);
      prisma.user.create.mockRejectedValueOnce(new Error('db create failed'));

      await expect(signup('x@y.com', 'u', 'p')).rejects.toThrow('db create failed');
    });
  });

  describe('login', () => {
    test('returns user when credentials are valid', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 2, email: 'a@b.com', password: 'p' });

      const user = await login('a@b.com', 'p');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
      expect(user).toEqual({ id: 2, email: 'a@b.com', password: 'p' });
    });

    test('throws when email is not found', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);
      await expect(login('missing@b.com', 'p')).rejects.toThrow('Invalid email or password');
    });

    test('throws when password does not match', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 2, email: 'a@b.com', password: 'p' });
      await expect(login('a@b.com', 'wrong')).rejects.toThrow('Invalid email or password');
    });

    test('propagates prisma errors during lookup', async () => {
      prisma.user.findUnique.mockRejectedValueOnce(new Error('db read failed'));
      await expect(login('a@b.com', 'p')).rejects.toThrow('db read failed');
    });
  });
});
