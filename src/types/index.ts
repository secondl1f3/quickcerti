export type Tool = 'select' | 'text' | 'image' | 'rectangle' | 'circle' | 'line' | 'pan';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'center' | 'bottom';
  textDecoration?: string;
  lineHeight?: number;
}

export interface BorderStyle {
  width: number;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
}

export interface DesignElement {
  id: string;
  type: 'text' | 'image' | 'rectangle' | 'circle' | 'line';
  position: Position;
  size: Size;
  rotation: number;
  opacity: number;
  zIndex: number;
  
  // Text specific
  text?: string;
  textStyle?: TextStyle;
  isVariable?: boolean;
  variableName?: string;
  
  // Image specific
  imageUrl?: string;
  
  // Shape specific
  backgroundColor?: string;
  borderStyle?: BorderStyle;
  
  // Line specific
  lineStyle?: {
    color: string;
    width: number;
    style: 'solid' | 'dashed' | 'dotted';
  };
}

export interface DataRow {
  [key: string]: string | number;
}

export interface Variable {
  name: string;
  type: 'text' | 'number' | 'date';
  defaultValue?: string;
}

export interface Template {
  id: string;
  name: string;
  thumbnail: string;
  elements: DesignElement[];
  variables: Variable[];
  createdAt: Date;
}

export interface GenerationOptions {
  format: 'pdf' | 'png' | 'jpg';
  quality: number;
  filenameField: string;
  batchSize: number;
}