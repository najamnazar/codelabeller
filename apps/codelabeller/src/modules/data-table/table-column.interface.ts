export interface TableColumn {
  field: string; // For nested properties, use: "property.nestedProperty"
  header: string;
  widthPercentage?: string; // Include % at the end of this value
  filterType?: 'text'| 'numeric' | 'date' | 'contains';
  dataTransformer?: (cellValue: any) => string;
}