import { v4 as uuid } from 'uuid';
import jwt, { Secret } from 'jsonwebtoken';
import { Context } from '../db/connection';
import bcrypt from 'bcryptjs';
import type { User, UserDetails } from '@ws-chat/common/src/index';

const SECRET_KEY: Secret = 'your-secret-key-here';

export type CreateUserInput = Pick<User, 'email' | 'name' | 'password'>;

export type LoginUserInput = Pick<User, 'email' | 'password'>;

export const insertUser = async (
  { db }: Context,
  userData: CreateUserInput,
): Promise<UserDetails | null> => {
  try {
    const userId = uuid();
    const hashedPassword = bcrypt.hashSync(userData.password);
    const sql = `INSERT INTO users (id, email, name, password) VALUES($1, $2, $3, $4) RETURNING *`;
    const values = [userId, userData.email, userData.name, hashedPassword];

    const {
      rows: [user],
    } = await db.query<User>(sql, values);

    if (user) return { id: user.id, email: user.email, name: user.name };
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getUserByEmail = async ({ db }: Context, userEmail: string): Promise<User | null> => {
  try {
    const sql = `SELECT * FROM users WHERE email = $1`;
    const values = [userEmail];

    const {
      rows: [user],
    } = await db.query<User>(sql, values);

    if (user) return user;
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const loginUser = async (
  { db }: Context,
  userData: LoginUserInput,
): Promise<(UserDetails & { token: string }) | null> => {
  const { email, password } = userData;

  try {
    const user = await getUserByEmail({ db }, email);

    if (!user) throw new Error();

    const isPasswordMatching = bcrypt.compareSync(password, user.password.toString());

    if (!isPasswordMatching) throw new Error();

    const token = jwt.sign({ id: user.id, name: user.name }, SECRET_KEY, {
      expiresIn: '2 days',
    });

    return { id: user.id, email, name: user.name, token };
  } catch (error) {
    console.error('Login failed: ', error);
    return null;
  }
};
