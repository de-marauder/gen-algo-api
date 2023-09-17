import dotenv from 'dotenv';

dotenv.config();

export const env = (value: string) => {
  if (!value) return ''
  return process.env[value] || ''
}