export interface PageData {
  id: string; // Unique ID for Drag and Drop
  fileId: string; // Reference to the source file
  pageIndex: number; // Original index in the source file (0-based)
  rotation: number; // Degrees: 0, 90, 180, 270
  thumbnail: string; // Base64 data URL
  crop?: CropData; // Optional crop data
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PDFFile {
  id: string;
  name: string;
  data: ArrayBuffer;
}

export enum PageAction {
  ROTATE_CW,
  ROTATE_CCW,
  DELETE,
  CROP
}
