import jwt from 'jsonwebtoken';

export const jwtGenerator = (id: number) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30M',
  });
};
