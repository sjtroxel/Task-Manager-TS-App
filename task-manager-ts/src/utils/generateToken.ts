import jwt from 'jsonwebtoken';

const generateToken = (id: string) => {
  // this signs a token using a "secret" from your .env file
  // it expires in 30 days
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

export default generateToken;