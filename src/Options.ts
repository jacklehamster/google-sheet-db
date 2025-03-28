import { Auth } from 'googleapis';

export interface Options {
  sheet?: string;
  condition?: (row: any) => boolean,
  credentials?: string;
}
