import { NextApiRequest, NextApiResponse } from 'next';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

export default (req: NextApiRequest, res: NextApiResponse) => {
  const filePath = path.join(process.cwd(), 'public', 'sample-data.xlsx');
  const fileData = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileData, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);
  res.status(200).json(data);
};